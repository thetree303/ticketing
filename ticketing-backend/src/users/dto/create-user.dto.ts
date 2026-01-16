import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsPhoneNumberVN } from '../../common/decorators/is-phone-number-vn.decorator';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  GAY = 'lgbt', //:))))))))
  OTHER = 'other',
}

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  ORGANIZER = 'organizer',
}

export enum UserStatus {
  ACTIVE = 'active',
  LOCKED = 'locked',
  BANNED = 'banned',
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  passwordHash: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  @IsPhoneNumberVN()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dateOfBirth?: Date;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}
