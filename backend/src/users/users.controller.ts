import { Body, Controller, Get, Patch } from '@nestjs/common';

import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { UpdateCurrentUserDto } from './dto/update-current-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: RequestUser) {
    return this.usersService.getCurrentUser(user.userId);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateCurrentUserDto,
  ) {
    return this.usersService.updateCurrentUser(user.userId, dto);
  }
}
