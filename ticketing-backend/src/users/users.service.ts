import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { CreateUserDto, UserStatus } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PaginationResponseDto } from './dto/pagination-response.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import * as bcrypt from 'bcrypt';
import { paginate } from '../common/utils/pagination.util';
import { ERROR_MESSAGES } from '../common/constants/messages.constant';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  // Tạo người dùng bởi Admin với kiểm tra trùng tên đăng nhập và email
  async adminCreate(adminCreateUserDto: AdminCreateUserDto): Promise<User> {
    const { password, ...userData } = adminCreateUserDto;

    // Check if username exists
    const existingUsername = await this.findByUsername(userData.username);
    if (existingUsername) {
      throw new ConflictException(ERROR_MESSAGES.USER.USERNAME_EXISTS);
    }

    // Check if email exists
    const existingEmail = await this.findByEmail(userData.email);
    if (existingEmail) {
      throw new ConflictException(ERROR_MESSAGES.USER.EMAIL_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      ...userData,
      passwordHash: hashedPassword,
    });
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findAllWithPagination(
    paginationQueryDto: PaginationQueryDto,
  ): Promise<PaginationResponseDto<User>> {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      sortOrder = 'ASC',
    } = paginationQueryDto;
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.andWhere(
        'user.fullName LIKE :search OR user.email LIKE :search',
        { search: `%${search}%` },
      );
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }
    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }
    queryBuilder.orderBy('user.createdAt', sortOrder);

    return paginate(queryBuilder, { page, limit });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findOneWithPassword(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'passwordHash'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByIdentifierForLogin(identifier: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: [{ username: identifier }, { email: identifier }],
      select: ['id', 'username', 'email', 'passwordHash', 'fullName', 'role'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async updatePassword(id: number, newPasswordHash: string): Promise<void> {
    const result = await this.userRepository.update(id, {
      passwordHash: newPasswordHash,
    });

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async updateStatus(id: number, status: string): Promise<User> {
    const user = await this.findOne(id);
    user.status = status as UserStatus;
    return await this.userRepository.save(user);
  }

  async blockUser(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.status = UserStatus.LOCKED;
    return await this.userRepository.save(user);
  }

  async unblockUser(id: number): Promise<User> {
    const user = await this.findOne(id);
    user.status = UserStatus.ACTIVE;
    return await this.userRepository.save(user);
  }

  async softDelete(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.softDelete(id);
  }
}
