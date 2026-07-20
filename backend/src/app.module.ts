import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import { AppointmentsModule } from './appointments/appointments.module';
import { AuthModule } from './auth/auth.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { BillingModule } from './billing/billing.module';
import { CareRequestsModule } from './care-requests/care-requests.module';
import { ClinicsModule } from './clinics/clinics.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { DocumentsModule } from './documents/documents.module';
import { HealthModule } from './health/health.module';
import { MessagingModule } from './messaging/messaging.module';
import { NotesModule } from './notes/notes.module';
import { PatientsModule } from './patients/patients.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfessionalsModule } from './professionals/professionals.module';
import { SecurityModule } from './security/security.module';
import { TripsModule } from './trips/trips.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [configuration],
      validate: validateEnv,
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    PatientsModule,
    AppointmentsModule,
    DocumentsModule,
    NotesModule,
    ClinicsModule,
    ProfessionalsModule,
    CareRequestsModule,
    AuditLogsModule,
    TripsModule,
    MessagingModule,
    SecurityModule,
    BillingModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
