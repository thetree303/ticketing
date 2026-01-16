import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
  IsDate,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, UserRole } from '../../users/dto/create-user.dto';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @MinLength(3, { message: 'Tên đăng nhập phải có ít nhất 3 ký tự' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới',
  })
  username: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsDate({ message: 'Ngày sinh không hợp lệ' })
  @IsOptional()
  @Type(() => Date)
  dateOfBirth?: Date;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsEnum(Gender, { message: 'Giới tính không hợp lệ' })
  @IsOptional()
  gender?: Gender;

  @IsEnum(UserRole, { message: 'Vai trò không hợp lệ' })
  @IsOptional()
  role?: UserRole;
}
