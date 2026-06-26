import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  async create(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.documentsService.create(user, dto);
  }

  @Get(':id')
  async getById(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.documentsService.getById(user, id);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.documentsService.remove(user, id);
  }
}
