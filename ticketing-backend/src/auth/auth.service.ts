import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import * as bcrypt from 'bcrypt';
import { UserStatus } from '../users/dto/create-user.dto';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../common/constants/messages.constant';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Kiểm tra username đã tồn tại
    const existingUsername = await this.usersService.findByUsername(
      registerDto.username,
    );
    if (existingUsername) {
      throw new ConflictException(ERROR_MESSAGES.USER.USERNAME_EXISTS);
    }

    // Kiểm tra email đã tồn tại
    const existingEmail = await this.usersService.findByEmail(
      registerDto.email,
    );
    if (existingEmail) {
      throw new ConflictException(ERROR_MESSAGES.USER.EMAIL_EXISTS);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Tạo user mới
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = registerDto;
    const user = await this.usersService.create({
      ...userData,
      passwordHash: hashedPassword,
    });

    return {
      message: SUCCESS_MESSAGES.AUTH.REGISTER_SUCCESS,
      user,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByIdentifierForLogin(
      loginDto.identifier,
    );

    // Kiểm tra user tồn tại
    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.USER.INVALID_CREDENTIALS);
    }

    // Kiểm tra trạng thái tài khoản
    if (user.status === UserStatus.LOCKED) {
      throw new UnauthorizedException(ERROR_MESSAGES.USER.ACCOUNT_LOCKED);
    }

    if (user.status === UserStatus.BANNED) {
      throw new UnauthorizedException(ERROR_MESSAGES.USER.ACCOUNT_BANNED);
    }

    // Kiểm tra password (lúc này user.passwordHash đã có giá trị)
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(ERROR_MESSAGES.USER.INVALID_CREDENTIALS);
    }

    // Tạo JWT token
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      message: SUCCESS_MESSAGES.AUTH.LOGIN_SUCCESS,
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
    };
  }

  async validateUser(userId: number) {
    return this.usersService.findOne(userId);
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findOne(userId);
    if (!user) return null;
    return user;
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    // Lấy user với password để verify
    const user = await this.usersService.findOneWithPassword(userId);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException(ERROR_MESSAGES.USER.NO_PASSWORD);
    }

    // Kiểm tra mật khẩu hiện tại
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        ERROR_MESSAGES.USER.INVALID_CURRENT_PASSWORD,
      );
    }

    // Hash mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Cập nhật mật khẩu mới
    await this.usersService.updatePassword(userId, hashedNewPassword);

    return {
      message: SUCCESS_MESSAGES.AUTH.PASSWORD_CHANGED,
    };
  }
}
