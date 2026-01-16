import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { User } from '../users/users.entity';
import { EventCategory } from '../event-categories/entities/event-category.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import {
  PaginationQueryDto,
  PaginationResponseDto,
  PaginationMetaDto,
} from './dto';
import { UserRole } from '../users/dto/create-user.dto';
import { EventStatus } from './entities/event.entity';
import { EventApproval } from './entities';
import { ApprovalStatus } from './entities/event-approval.entity';
import { Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThan, In } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ERROR_MESSAGES } from '../common/constants/messages.constant';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(EventCategory)
    private readonly eventCategoryRepository: Repository<EventCategory>,
    @InjectRepository(EventApproval)
    private readonly eventApprovalRepository: Repository<EventApproval>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // Các trạng thái sự kiện bị loại trừ dựa trên vai trò người dùng
  excludedStatusMap = new Map<UserRole, EventStatus[]>([
    [
      UserRole.CUSTOMER,
      [EventStatus.DRAFT, EventStatus.PENDING, EventStatus.REJECTED],
    ],
    [UserRole.ADMIN, [EventStatus.DRAFT]],
  ]);

  // Tạo sự kiện mới bởi Organizer
  async create(
    organizerId: number,
    createEventDto: CreateEventDto,
  ): Promise<Event> {
    const organizer = await this.userRepository.findOne({
      where: { id: organizerId },
    });
    if (!organizer) {
      throw new NotFoundException(ERROR_MESSAGES.EVENT.ORGANIZER_NOT_FOUND);
    }

    if (organizer.role !== UserRole.ORGANIZER) {
      throw new ForbiddenException(ERROR_MESSAGES.EVENT.FORBIDDEN);
    }

    const category = await this.eventCategoryRepository.findOne({
      where: { id: createEventDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(ERROR_MESSAGES.EVENT.CATEGORY_NOT_FOUND);
    }

    const event = this.eventRepository.create({
      ...createEventDto,
      organizerId: organizer.id,
      categoryId: category.id,
      status: EventStatus.DRAFT,
    });
    const savedEvent = await this.eventRepository.save(event);
    await this.updateMinMaxPrice(savedEvent.id);
    return savedEvent;
  }

  // Lấy danh sách sự kiện với phân trang và lọc
  async findAllWithPagination(
    paginationQuery: PaginationQueryDto,
    userId?: number,
    isPendingOnly?: boolean,
    userRole?: UserRole,
  ): Promise<PaginationResponseDto<Event>> {
    const { page = 1, limit = 10 } = paginationQuery;
    const skip = (page - 1) * limit;

    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .leftJoin('event.organizer', 'organizer')
      .leftJoin('event.category', 'category');

    if (userId) {
      queryBuilder.where('event.organizerId = :userId', { userId });
    }

    if (isPendingOnly) {
      queryBuilder.andWhere('event.status = :status', {
        status: EventStatus.PENDING,
      });
    }

    if (userRole === UserRole.CUSTOMER || userRole === UserRole.ADMIN) {
      queryBuilder.where('event.status NOT IN (:...excludedStatus)', {
        excludedStatus: this.excludedStatusMap.get(userRole) || [],
      });
    }

    if (userRole === UserRole.ORGANIZER) {
      queryBuilder.andWhere('event.organizerId = :userId', { userId });
    }

    if (paginationQuery.status) {
      queryBuilder.andWhere('event.status = :statusFilter', {
        statusFilter: paginationQuery.status,
      });
    }

    if (paginationQuery.search) {
      queryBuilder.andWhere(
        '(event.title ILIKE :search OR event.venueName ILIKE :search)',
        { search: `%${paginationQuery.search}%` },
      );
    }

    if (paginationQuery.categoryId) {
      queryBuilder.andWhere('event.categoryId = :categoryId', {
        categoryId: paginationQuery.categoryId,
      });
    }

    if (paginationQuery.startDate) {
      queryBuilder.andWhere('event.startTime >= :startDate', {
        startDate: paginationQuery.startDate,
      });
    }

    if (paginationQuery.endDate) {
      queryBuilder.andWhere('event.endTime <= :endDate', {
        endDate: paginationQuery.endDate,
      });
    }

    if (paginationQuery.maxPrice !== undefined) {
      queryBuilder.andWhere('event.minPrice <= :maxPrice', {
        maxPrice: paginationQuery.maxPrice,
      });
    }

    if (paginationQuery.minPrice !== undefined) {
      queryBuilder.andWhere('event.maxPrice >= :minPrice', {
        minPrice: paginationQuery.minPrice,
      });
    }

    // Hàm sắp xếp
    const sortOrder =
      paginationQuery.sortOrder &&
      paginationQuery.sortOrder.toUpperCase() === 'DESC'
        ? 'DESC'
        : 'ASC';
    const sortBy =
      paginationQuery.sortBy ||
      (userRole === UserRole.CUSTOMER ? 'startTime' : 'id');

    const totalItems = await queryBuilder.getCount();
    const totalPages = Math.ceil(totalItems / limit);

    queryBuilder.select([
      'event.id AS "id"',
      'event.title AS "title"',
      'event.bannerUrl AS "bannerUrl"',
      'event.status AS "status"',
      'event.startTime AS "startTime"',
      'event.endTime AS "endTime"',
      'event.venueName AS "venueName"',
      'event.createdAt AS "createdAt"',
      'event.updatedAt AS "updatedAt"',

      'organizer.id AS "organizerId"',
      'organizer.fullName AS "organizerName"',
      'organizer.email AS "organizerEmail"',
      'organizer.phoneNumber AS "organizerPhone"',

      'event.minPrice AS "minPrice"',
      'event.maxPrice AS "maxPrice"',

      'category.name AS "categoryName"',
    ]);

    // Ưu tiên sự kiện Pending cho Admin
    if (userRole === UserRole.ADMIN) {
      queryBuilder.orderBy(
        `CASE WHEN event.status = '${EventStatus.PENDING}' THEN 0 ELSE 1 END`,
        'ASC',
      );
      queryBuilder.addOrderBy(`event.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy(`event.${sortBy}`, sortOrder);
    }

    queryBuilder.skip(skip).take(limit);

    const events = await queryBuilder.getRawMany();
    const itemCount = events.length;

    const meta: PaginationMetaDto = {
      totalItems,
      itemCount,
      itemsPerPage: limit,
      totalPages,
      currentPage: page,
    };

    return {
      data: events,
      meta,
    };
  }

  // Lấy chi tiết sự kiện
  async findOne(id: number, user?: User): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['organizer', 'category', 'ticketTypes'],
    });
    if (!event) {
      throw new NotFoundException(ERROR_MESSAGES.EVENT.NOT_FOUND);
    }
    if (
      (user?.role === UserRole.CUSTOMER ||
        (user?.role === UserRole.ORGANIZER && user.id !== event.organizerId)) &&
      event.status !== EventStatus.UNPUBLISHED &&
      event.status !== EventStatus.PUBLISHED &&
      event.status !== EventStatus.ENDED &&
      event.status !== EventStatus.CANCELLED
    ) {
      throw new ForbiddenException(ERROR_MESSAGES.EVENT.FORBIDDEN);
    }

    // Sắp xếp loại vé theo giá tăng dần
    event.ticketTypes.sort((a, b) => a.price - b.price);
    return event;
  }

  // Cập nhật sự kiện
  async update(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    const event = await this.findOne(id);
    if (
      event.status === EventStatus.PENDING ||
      event.status === EventStatus.CANCELLED ||
      event.status === EventStatus.ENDED
    ) {
      throw new BadRequestException(ERROR_MESSAGES.EVENT.CANNOT_UPDATE);
    }

    if (
      event.status === EventStatus.PUBLISHED ||
      event.status === EventStatus.UNPUBLISHED
    ) {
      event.status = EventStatus.DRAFT;
      this.eventEmitter.emit('event.cancelled', event.id);
    }

    Object.assign(event, updateEventDto);
    const updatedEvent = await this.eventRepository.save(event);
    await this.updateMinMaxPrice(updatedEvent.id);
    return updatedEvent;
  }

  // Xóa sự kiện
  async remove(id: number, user: User): Promise<any> {
    const event = await this.findOne(id);
    if (
      event.status !== EventStatus.DRAFT &&
      event.status !== EventStatus.REJECTED
    ) {
      throw new BadRequestException(ERROR_MESSAGES.EVENT.CANNOT_DELETE);
    }
    const isAdmin = user.role === UserRole.ADMIN;
    if (!isAdmin && event.organizerId !== user.id) {
      throw new ForbiddenException(ERROR_MESSAGES.EVENT.CANNOT_DELETE);
    }
    await this.eventRepository.remove(event);
    return {
      message: 'Xóa sự kiện thành công',
    };
  }

  // Gửi sự kiện để phê duyệt
  async submitForApproval(id: number, organizerId: number): Promise<any> {
    const event = await this.findOne(id);
    if (event.organizerId != organizerId) {
      throw new NotFoundException(ERROR_MESSAGES.EVENT.NOT_FOUND_BY_USER);
    }
    if (
      event.status !== EventStatus.DRAFT &&
      event.status !== EventStatus.REJECTED
    ) {
      throw new BadRequestException(ERROR_MESSAGES.EVENT.CANNOT_SUBMIT);
    }
    event.status = EventStatus.PENDING;
    await this.eventRepository.save(event);

    return {
      id: event.id,
      title: event.title,
      status: event.status,
      submittedAt: new Date(),
    };
  }

  // Phê duyệt sự kiện
  async approveEvent(
    id: number,
    adminId: number,
    approveNote: string,
  ): Promise<any> {
    const event = await this.findOne(id);
    if (event.status !== EventStatus.PENDING) {
      throw new BadRequestException(ERROR_MESSAGES.EVENT.CANNOT_APPROVE);
    }
    event.status =
      new Date() >= event.releaseDate || !event.releaseDate
        ? EventStatus.PUBLISHED
        : EventStatus.UNPUBLISHED;
    const approvedEvent = await this.eventRepository.save(event);
    this.eventEmitter.emit('event.approved', approvedEvent.id);

    await this.eventApprovalRepository.save({
      event: approvedEvent,
      admin: { id: adminId },
      status: ApprovalStatus.Approved,
      note: approveNote,
      createdAt: new Date(),
    });
    return {
      id: approvedEvent.id,
      title: approvedEvent.title,
      status: approvedEvent.status,
      approvedAt: new Date(),
      note: approveNote,
    };
  }

  // Từ chối sự kiện
  async rejectEvent(
    id: number,
    adminId: number,
    rejectNote: string,
  ): Promise<any> {
    const event = await this.findOne(id);
    if (event.status !== EventStatus.PENDING) {
      throw new BadRequestException(ERROR_MESSAGES.EVENT.CANNOT_REJECT);
    }
    event.status = EventStatus.REJECTED;
    const rejectedEvent = await this.eventRepository.save(event);
    await this.eventApprovalRepository.save({
      event: rejectedEvent,
      admin: { id: adminId },
      status: ApprovalStatus.Rejected,
      note: rejectNote,
      createdAt: new Date(),
    });
    return {
      id: rejectedEvent.id,
      title: rejectedEvent.title,
      status: rejectedEvent.status,
      rejectedAt: new Date(),
      note: rejectNote,
    };
  }

  // Hủy sự kiện
  async cancelEvent(id: number): Promise<Event> {
    const event = await this.findOne(id);
    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException(ERROR_MESSAGES.EVENT.CANNOT_CANCEL);
    }
    event.status = EventStatus.CANCELLED;
    this.eventEmitter.emit('event.cancelled', event.id);
    return this.eventRepository.save(event);
  }

  // Thống kê cho Organizer
  async getOrganizerStats(organizerId: number): Promise<any> {
    // Tổng số sự kiện
    const totalEvents = await this.eventRepository.count({
      where: { organizerId },
    });

    // Tổng doanh thu từ tất cả các sự kiện của organizer
    const totalRevenueResult = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoin('event.ticketTypes', 'ticketType')
      .leftJoin('ticketType.tickets', 'ticket')
      .leftJoin('ticket.order', 'order')
      .select('SUM(order.totalAmount)', 'totalRevenue')
      .where('event.organizerId = :organizerId', { organizerId })
      .andWhere('ticket.status = :status', { status: 'Active' })
      .getRawOne();

    const totalRevenue = totalRevenueResult?.totalRevenue || 0;

    // Tổng số vé đã bán
    const totalTicketsSoldResult = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoin('event.ticketTypes', 'ticketType')
      .leftJoin('ticketType.tickets', 'ticket')
      .select('COUNT(ticket.id)', 'ticketsSold')
      .where('event.organizerId = :organizerId', { organizerId })
      .andWhere('ticket.status = :status', { status: 'Active' })
      .getRawOne();
    const totalTicketsSold = totalTicketsSoldResult?.ticketsSold || 0;

    return {
      totalEvents,
      totalRevenue,
      totalTicketsSold,
    };
  }

  // Task check sự kiện: unpublished -> published, ended nếu qua thời gian, chạy mỗi 5 phút 1 lần
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleEventStatusUpdate() {
    const now = new Date();
    const eventsToEnd = await this.eventRepository.find({
      where: {
        endTime: LessThan(now),
        status: In([EventStatus.PUBLISHED, EventStatus.UNPUBLISHED]),
      },
      select: ['id', 'status'],
    });
    for (const event of eventsToEnd) {
      event.status = EventStatus.ENDED;
      await this.eventRepository.save(event);
      this.eventEmitter.emit('event.ended', event.id);
      this.logger.log(
        `[Cron] Kết thúc sự kiện ID: ${event.id} (status = Ended)`,
      );
    }
    this.logger.log(
      `[Cron] Đã cập nhật ${eventsToEnd.length} sự kiện kết thúc`,
    );

    const eventsToPublish = await this.eventRepository.find({
      where: {
        releaseDate: LessThan(now),
        status: EventStatus.UNPUBLISHED,
      },
      select: ['id', 'status'],
    });
    for (const event of eventsToPublish) {
      event.status = EventStatus.PUBLISHED;
      await this.eventRepository.save(event);
      this.logger.log(`Công khai sự kiện ID: ${event.id} (status = Published)`);
    }
    this.logger.log(`[Cron] Đã công khai ${eventsToPublish.length} sự kiện`);
  }

  // Cập nhật giá min và max của sự kiện dựa trên loại vé
  async updateMinMaxPrice(eventId: number) {
    const event = await this.findOne(eventId);
    const ticketTypes = event.ticketTypes;
    if (ticketTypes.length === 0) {
      event.minPrice = 0;
      event.maxPrice = 0;
      return this.eventRepository.save(event);
    }
    const prices = ticketTypes.map((tt) => tt.price);
    event.minPrice = Math.min(...prices);
    event.maxPrice = Math.max(...prices);
    return this.eventRepository.save(event);
  }
}
