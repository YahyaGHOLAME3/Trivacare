import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ConversationParticipantRole,
  MessageReceiptStatus,
  Prisma,
  Role,
} from '@prisma/client';

import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { PatientsService } from '../patients/patients.service';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect } from '../users/user.select';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateThreadDto } from './dto/create-thread.dto';

@Injectable()
export class MessagingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly patientsService: PatientsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async listThreads(user: RequestUser) {
    const threads = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: user.userId,
          },
        },
      },
      include: {
        patient: {
          include: {
            user: {
              select: publicUserSelect,
            },
          },
        },
        participants: {
          include: {
            user: {
              select: publicUserSelect,
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            sender: {
              select: publicUserSelect,
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const unreadCounts = await Promise.all(
      threads.map((thread) =>
        this.prisma.messageReceipt.count({
          where: {
            userId: user.userId,
            status: MessageReceiptStatus.UNREAD,
            message: {
              conversationId: thread.id,
            },
          },
        }),
      ),
    );

    return threads.map((thread, index) => ({
      ...thread,
      unreadCount: unreadCounts[index],
    }));
  }

  async createThread(user: RequestUser, dto: CreateThreadDto) {
    const patientProfile =
      user.role === Role.PATIENT
        ? await this.patientsService.getProfileByUserIdOrThrow(user.userId)
        : await this.patientsService.getProfileByIdOrThrow(dto.patientId ?? '');

    const patientUserId = patientProfile.userId;
    const requestedParticipants = dto.participantUserIds ?? [];
    const coordinatorUserIds =
      user.role === Role.PATIENT && requestedParticipants.length === 0
        ? [await this.getDefaultCoordinatorUserIdOrThrow(patientProfile.id)]
        : requestedParticipants;
    const participantUserIds = new Set([
      patientUserId,
      user.userId,
      ...coordinatorUserIds,
    ]);
    const anchorLinks = await this.resolveAnchorLinks(patientProfile.id, dto);

    await this.ensureThreadCreationAccess(
      user,
      patientProfile.id,
      patientUserId,
      [...participantUserIds],
    );
    await this.ensureUsersExist([...participantUserIds]);
    const professionalUserIds = await this.getProfessionalUserIds([
      ...participantUserIds,
    ]);

    const conversation = await this.prisma.$transaction(async (tx) => {
      const created = await tx.conversation.create({
        data: {
          patientId: patientProfile.id,
          careRequestId: anchorLinks.careRequestId,
          appointmentId: anchorLinks.appointmentId,
          anchorType: dto.anchorType,
          anchorId: dto.anchorId,
          subject: dto.subject,
          participants: {
            create: [...participantUserIds].map((participantUserId) => ({
              userId: participantUserId,
              role: this.resolveParticipantRole(
                participantUserId,
                patientUserId,
                professionalUserIds,
              ),
            })),
          },
        },
      });

      if (dto.initialMessage?.trim()) {
        await this.createMessageInTransaction(tx, created.id, user.userId, {
          body: dto.initialMessage,
        });
      }

      return tx.conversation.findUniqueOrThrow({
        where: { id: created.id },
        include: this.threadInclude,
      });
    });

    await this.auditLogsService.create({
      actorId: user.userId,
      action: 'thread_create',
      entityType: 'Conversation',
      entityId: conversation.id,
      metadata: {
        anchorType: dto.anchorType,
        anchorId: dto.anchorId,
      },
    });

    return conversation;
  }

  async listMessages(user: RequestUser, threadId: string) {
    await this.ensureParticipant(user.userId, threadId);

    return this.prisma.message.findMany({
      where: { conversationId: threadId },
      include: {
        sender: {
          select: publicUserSelect,
        },
        receipts: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async createMessage(user: RequestUser, threadId: string, dto: CreateMessageDto) {
    await this.ensureParticipant(user.userId, threadId);

    const message = await this.prisma.$transaction(async (tx) => {
      const created = await this.createMessageInTransaction(
        tx,
        threadId,
        user.userId,
        dto,
      );

      await tx.conversation.update({
        where: { id: threadId },
        data: { updatedAt: new Date() },
      });

      return created;
    });

    await this.auditLogsService.create({
      actorId: user.userId,
      action: 'message_create',
      entityType: 'Message',
      entityId: message.id,
      metadata: { conversationId: threadId },
    });

    return message;
  }

  async markRead(user: RequestUser, threadId: string) {
    await this.ensureParticipant(user.userId, threadId);

    const result = await this.prisma.messageReceipt.updateMany({
      where: {
        userId: user.userId,
        status: MessageReceiptStatus.UNREAD,
        message: {
          conversationId: threadId,
        },
      },
      data: {
        status: MessageReceiptStatus.READ,
        readAt: new Date(),
      },
    });

    await this.auditLogsService.create({
      actorId: user.userId,
      action: 'message_read',
      entityType: 'Conversation',
      entityId: threadId,
      metadata: { count: result.count },
    });

    return { readCount: result.count };
  }

  private async createMessageInTransaction(
    tx: Prisma.TransactionClient,
    threadId: string,
    senderId: string,
    dto: CreateMessageDto,
  ) {
    const participants = await tx.conversationParticipant.findMany({
      where: { conversationId: threadId },
      select: { userId: true },
    });
    const message = await tx.message.create({
      data: {
        conversationId: threadId,
        senderId,
        body: dto.body,
        attachments:
          dto.attachments === undefined
            ? undefined
            : (dto.attachments as Prisma.InputJsonValue),
      },
      include: {
        sender: {
          select: publicUserSelect,
        },
        receipts: true,
      },
    });

    await tx.messageReceipt.createMany({
      data: participants
        .filter((participant) => participant.userId !== senderId)
        .map((participant) => ({
          messageId: message.id,
          userId: participant.userId,
          status: MessageReceiptStatus.UNREAD,
        })),
    });

    return message;
  }

  private async ensureParticipant(userId: string, threadId: string) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: threadId,
          userId,
        },
      },
    });

    if (!participant) {
      const exists = await this.prisma.conversation.findUnique({
        where: { id: threadId },
        select: { id: true },
      });

      if (!exists) {
        throw new NotFoundException('Thread not found');
      }

      throw new ForbiddenException('You are not a participant in this thread');
    }
  }

  private resolveParticipantRole(
    participantUserId: string,
    patientUserId: string,
    professionalUserIds: Set<string>,
  ): ConversationParticipantRole {
    if (participantUserId === patientUserId) {
      return ConversationParticipantRole.PATIENT;
    }

    if (professionalUserIds.has(participantUserId)) {
      return ConversationParticipantRole.PROFESSIONAL;
    }

    return ConversationParticipantRole.COORDINATOR;
  }

  private async getDefaultCoordinatorUserIdOrThrow(patientId: string) {
    const assignedCareRequest = await this.prisma.careRequest.findFirst({
      where: {
        patientId,
        clinicId: {
          not: null,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        clinic: {
          select: {
            members: {
              where: {
                role: Role.CLINIC_ADMIN,
                user: {
                  isActive: true,
                },
              },
              orderBy: {
                createdAt: 'asc',
              },
              take: 1,
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    const assignedCareRequestCoordinator =
      assignedCareRequest?.clinic?.members[0]?.userId;

    if (assignedCareRequestCoordinator) {
      return assignedCareRequestCoordinator;
    }

    const assignedAppointment = await this.prisma.appointment.findFirst({
      where: {
        patientId,
        clinicId: {
          not: null,
        },
      },
      orderBy: {
        scheduledAt: 'desc',
      },
      select: {
        clinic: {
          select: {
            members: {
              where: {
                role: Role.CLINIC_ADMIN,
                user: {
                  isActive: true,
                },
              },
              orderBy: {
                createdAt: 'asc',
              },
              take: 1,
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    const assignedAppointmentCoordinator =
      assignedAppointment?.clinic?.members[0]?.userId;

    if (assignedAppointmentCoordinator) {
      return assignedAppointmentCoordinator;
    }

    const coordinator = await this.prisma.user.findFirst({
      where: {
        role: Role.SUPER_ADMIN,
        isActive: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        id: true,
      },
    });

    if (coordinator) {
      return coordinator.id;
    }

    throw new BadRequestException(
      'No active healthcare coordinator is available for this patient thread',
    );
  }

  private async ensureThreadCreationAccess(
    user: RequestUser,
    patientId: string,
    patientUserId: string,
    participantUserIds: string[],
  ) {
    const allowedUserIds = await this.getAuthorizedThreadParticipantUserIds(
      patientId,
      patientUserId,
    );

    if (!allowedUserIds.has(user.userId)) {
      throw new ForbiddenException('You are not assigned to this patient');
    }

    const unauthorizedParticipant = participantUserIds.find(
      (participantUserId) => !allowedUserIds.has(participantUserId),
    );

    if (unauthorizedParticipant) {
      throw new ForbiddenException(
        'Thread participants must belong to the patient care team',
      );
    }
  }

  private async getAuthorizedThreadParticipantUserIds(
    patientId: string,
    patientUserId: string,
  ) {
    const [clinicAdmins, professionals, superAdmins] = await Promise.all([
      this.prisma.clinicMember.findMany({
        where: {
          role: Role.CLINIC_ADMIN,
          user: {
            isActive: true,
          },
          clinic: {
            OR: [
              {
                careRequests: {
                  some: { patientId },
                },
              },
              {
                appointments: {
                  some: { patientId },
                },
              },
            ],
          },
        },
        select: {
          userId: true,
        },
      }),
      this.prisma.professionalProfile.findMany({
        where: {
          user: {
            isActive: true,
          },
          OR: [
            {
              careRequests: {
                some: { patientId },
              },
            },
            {
              appointments: {
                some: { patientId },
              },
            },
          ],
        },
        select: {
          userId: true,
        },
      }),
      this.prisma.user.findMany({
        where: {
          role: Role.SUPER_ADMIN,
          isActive: true,
        },
        select: {
          id: true,
        },
      }),
    ]);

    return new Set([
      patientUserId,
      ...clinicAdmins.map((admin) => admin.userId),
      ...professionals.map((professional) => professional.userId),
      ...superAdmins.map((admin) => admin.id),
    ]);
  }

  private async getProfessionalUserIds(userIds: string[]) {
    const professionalProfiles = await this.prisma.professionalProfile.findMany({
      where: {
        userId: {
          in: [...new Set(userIds)],
        },
      },
      select: {
        userId: true,
      },
    });

    return new Set(professionalProfiles.map((profile) => profile.userId));
  }

  private async ensureUsersExist(userIds: string[]) {
    const uniqueUserIds = [...new Set(userIds)];
    const count = await this.prisma.user.count({
      where: {
        id: {
          in: uniqueUserIds,
        },
        isActive: true,
      },
    });

    if (count !== uniqueUserIds.length) {
      throw new NotFoundException('One or more thread participants were not found');
    }
  }

  private async resolveAnchorLinks(
    patientId: string,
    dto: CreateThreadDto,
  ): Promise<{ careRequestId?: string; appointmentId?: string }> {
    if (dto.anchorType === 'APPOINTMENT') {
      const appointment = await this.prisma.appointment.findFirst({
        where: {
          id: dto.anchorId,
          patientId,
        },
        select: {
          id: true,
        },
      });

      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }

      return { appointmentId: appointment.id };
    }

    if (dto.anchorType === 'PATIENT_CASE') {
      if (dto.anchorId === patientId || dto.anchorId === 'general') {
        return {};
      }

      const careRequest = await this.prisma.careRequest.findFirst({
        where: {
          id: dto.anchorId,
          patientId,
        },
        select: {
          id: true,
        },
      });

      if (!careRequest) {
        throw new NotFoundException('Care request not found');
      }

      return { careRequestId: careRequest.id };
    }

    return {};
  }

  private readonly threadInclude = {
    patient: {
      include: {
        user: {
          select: publicUserSelect,
        },
      },
    },
    participants: {
      include: {
        user: {
          select: publicUserSelect,
        },
      },
    },
    messages: {
      include: {
        sender: {
          select: publicUserSelect,
        },
        receipts: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    },
  } as const;
}
