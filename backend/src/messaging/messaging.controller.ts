import { Body, Controller, Get, Param, Post } from '@nestjs/common';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateThreadDto } from './dto/create-thread.dto';
import { MessagingService } from './messaging.service';

@Controller('threads')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get()
  async list(@CurrentUser() user: RequestUser) {
    return this.messagingService.listThreads(user);
  }

  @Post()
  async create(@CurrentUser() user: RequestUser, @Body() dto: CreateThreadDto) {
    return this.messagingService.createThread(user, dto);
  }

  @Get(':id/messages')
  async listMessages(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.messagingService.listMessages(user, id);
  }

  @Post(':id/messages')
  async createMessage(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: CreateMessageDto,
  ) {
    return this.messagingService.createMessage(user, id, dto);
  }

  @Post(':id/read')
  async markRead(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.messagingService.markRead(user, id);
  }
}
