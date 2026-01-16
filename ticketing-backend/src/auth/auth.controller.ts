import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ChangePasswordDto } from './dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { User } from '../users/users.entity';
import { UserRole } from '../users/dto/create-user.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    return this.authService.getProfile(user.id);
  }

  // Endpoint cho Admin
  @Get('admin/dashboard')
  @Roles(UserRole.ADMIN)
  adminDashboard(@CurrentUser() user: User) {
    return {
      message: 'Welcome Admin',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  // Endpoint cho Organizer
  @Get('organizer/dashboard')
  @Roles(UserRole.ORGANIZER)
  organizerDashboard(@CurrentUser() user: User) {
    return {
      message: 'Welcome Organizer',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  // Endpoint cho Customer
  @Get('customer/dashboard')
  @Roles(UserRole.CUSTOMER)
  customerDashboard(@CurrentUser() user: User) {
    return {
      message: 'Welcome Customer',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  // Endpoint cho nhiều vai trò
  @Get('events/manage')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  manageEvents(@CurrentUser() user: User) {
    return {
      message: 'Manage Events',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  @Patch('change-password')
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(
      user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword,
    );
  }
}
