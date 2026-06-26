import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { CreateClinicalNoteDto } from './dto/create-clinical-note.dto';
import { QueryClinicalNotesDto } from './dto/query-clinical-notes.dto';
import { UpdateClinicalNoteDto } from './dto/update-clinical-note.dto';
import { NotesService } from './notes.service';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @Roles(Role.PROFESSIONAL)
  async create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateClinicalNoteDto,
  ) {
    return this.notesService.create(user, dto);
  }

  @Get()
  @Roles(Role.PROFESSIONAL, Role.SUPER_ADMIN)
  async list(@CurrentUser() user: RequestUser, @Query() dto: QueryClinicalNotesDto) {
    return this.notesService.list(user, dto);
  }

  @Patch(':id')
  @Roles(Role.PROFESSIONAL, Role.SUPER_ADMIN)
  async update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateClinicalNoteDto,
  ) {
    return this.notesService.update(user, id, dto);
  }

  @Delete(':id')
  @Roles(Role.PROFESSIONAL, Role.SUPER_ADMIN)
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.notesService.remove(user, id);
  }
}
