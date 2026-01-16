import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { EventStatus } from '../events/entities/event.entity';
import { UserStatus } from 'src/users/dto/create-user.dto';
import { OrderStatus } from '../orders/entities/order.entity';
import { GetMyTicketsQueryDto } from './dto/get-my-tickets-query.dto';
import { PaginationMetaDto, PaginationResponseDto } from '../events/dto';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from '../common/constants/messages.constant';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async create(createTicketDto: CreateTicketDto): Promise<Ticket> {
    const ticket = this.ticketRepository.create(createTicketDto);
    return this.ticketRepository.save(ticket);
  }

  async findAll(): Promise<Ticket[]> {
    return this.ticketRepository.find({
      relations: ['order', 'ticketType'],
    });
  }

  // Lấy tất cả vé đã thanh toán của user
  async getMyTickets(
    userId: number,
    query: GetMyTicketsQueryDto,
  ): Promise<PaginationResponseDto<any>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const baseQb = this.ticketRepository
      .createQueryBuilder('ticket')
      .innerJoin('ticket.order', 'order')
      .innerJoin('ticket.ticketType', 'ticketType')
      .innerJoin('order.event', 'event')
      .innerJoin('order.customer', 'customer') // Join thêm bảng Customer để lấy info người mua
      .where('order.customerId = :userId', { userId })
      .andWhere('order.status = :orderStatus', {
        orderStatus: OrderStatus.Paid,
      });

    if (query.status) {
      baseQb.andWhere('ticket.status = :ticketStatus', {
        ticketStatus: query.status,
      });
    }

    if (query.search) {
      baseQb.andWhere(
        '(ticket.uniqueCode ILIKE :search OR event.title ILIKE :search OR ticketType.name ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Đếm dữ liệu
    const countQb = baseQb
      .clone()
      .select('ticket.uniqueCode', 'uniqueCode')
      .addSelect('ticket.ticketTypeId', 'ticketTypeId')
      .groupBy('ticket.uniqueCode')
      .addGroupBy('ticket.ticketTypeId');

    const [countSql, countParams] = countQb.getQueryAndParameters();
    const countRows = await this.ticketRepository.manager.query(
      `SELECT COUNT(*)::int AS "count" FROM (${countSql}) sub`,
      countParams,
    );
    const totalItems = Number(countRows?.[0]?.count ?? 0);

    // Lấy dữ liệu
    const dataQb = baseQb
      .clone()
      .select('MIN(ticket.id)', 'id')
      .addSelect('ticket.uniqueCode', 'uniqueCode')
      .addSelect('ticket.status', 'status')
      .addSelect("STRING_AGG(ticket.seatNumber, ', ')", 'seatNumber')
      .addSelect('MIN(ticket.purchasedAt)', 'ticket_purchasedAt')
      .addSelect('MIN(ticket.purchaserName)', 'purchaserName')
      .addSelect('MIN(ticket.purchaserEmail)', 'purchaserEmail')
      .addSelect('MIN(ticket.purchaserPhone)', 'purchaserPhone')
      .addSelect('MIN(ticket.checkinTime)', 'checkinTime')
      .addSelect('COUNT(ticket.id)', 'quantity')

      // Ticket Type Info
      .addSelect('ticketType.id', 'ticketType_id')
      .addSelect('ticketType.name', 'ticketType_name')
      .addSelect('ticketType.price', 'ticketType_price')

      // Event Info
      .addSelect('event.id', 'event_id')
      .addSelect('event.title', 'event_title')
      .addSelect('event.startTime', 'event_startTime')
      .addSelect('event.venueName', 'event_venueName')
      .addSelect('event.address', 'event_address')
      .addSelect('event.bannerUrl', 'event_bannerUrl')

      // Order Info
      .addSelect('MIN(order.id)', 'order_id')
      .addSelect('MIN(order.createdAt)', 'order_createdAt') // Lấy ngày tạo đơn hàng
      .addSelect('MAX(order.status)', 'order_status')

      // Purchaser (Customer) Info
      .addSelect('MIN(customer.fullName)', 'customer_fullName')
      .addSelect('MIN(customer.email)', 'customer_email')
      .addSelect('MIN(customer.phoneNumber)', 'customer_phoneNumber')

      .groupBy('ticket.uniqueCode')
      .addGroupBy('ticket.status')
      .addGroupBy('ticket.ticketTypeId')
      .addGroupBy('ticketType.id')
      .addGroupBy('ticketType.name')
      .addGroupBy('ticketType.price')
      .addGroupBy('event.id')
      .addGroupBy('event.title')
      .addGroupBy('event.startTime')
      .addGroupBy('event.venueName')
      .addGroupBy('event.address')
      .addGroupBy('event.bannerUrl');

    const sortOrder =
      query.sortOrder && query.sortOrder.toUpperCase() === 'ASC'
        ? 'ASC'
        : 'DESC';
    const sortBy = query.sortBy ?? 'purchasedAt';

    const sortExprMap: Record<string, string> = {
      purchasedAt: 'MIN(order.createdAt)', // Sắp xếp theo ngày đơn hàng
      eventStartTime: 'event.startTime',
      ticketType: 'ticketType.name',
      status: 'ticket.status',
    };
    dataQb.orderBy(sortExprMap[sortBy] ?? 'MIN(order.createdAt)', sortOrder);

    dataQb.offset(skip).limit(limit);

    const rows = await dataQb.getRawMany();

    // Map dữ liệu trả về theo cấu trúc Frontend yêu cầu
    const data = rows.map((row: any) => ({
      id: Number(row.id),
      uniqueCode: row.uniqueCode,
      status: row.status,
      seatNumber: row.seatNumber ?? undefined,
      purchasedAt: row.order_createdAt ?? row.ticket_purchasedAt,
      purchaserName: row.purchaserName ?? undefined,
      purchaserEmail: row.purchaserEmail ?? undefined,
      purchaserPhone: row.purchaserPhone ?? undefined,
      checkinTime: row.checkinTime ?? undefined,
      ticketType: {
        id: Number(row.ticketType_id),
        name: row.ticketType_name,
        price: row.ticketType_price,
      },
      event: {
        id: Number(row.event_id),
        title: row.event_title,
        startTime: row.event_startTime,
        venueName: row.event_venueName ?? undefined,
        venueAddress: row.event_address ?? undefined,
        bannerUrl: row.event_bannerUrl ?? undefined,
      },
      order: {
        id: Number(row.order_id),
        status: row.order_status,
      },
      purchaser: {
        fullName: row.customer_fullName,
        email: row.customer_email,
        phoneNumber: row.customer_phoneNumber,
      },
    }));

    const totalPages = Math.ceil(totalItems / limit);
    const meta: PaginationMetaDto = {
      totalItems,
      itemCount: data.length,
      itemsPerPage: limit,
      totalPages,
      currentPage: page,
    };

    return { data, meta };
  }

  async findOne(id: number): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['order.customer', 'order.event', 'ticketType'],
    });
    if (!ticket) {
      throw new NotFoundException(ERROR_MESSAGES.TICKET.NOT_FOUND);
    }
    return ticket;
  }

  async update(id: number, updateTicketDto: UpdateTicketDto): Promise<Ticket> {
    const ticket = await this.findOne(id);
    Object.assign(ticket, updateTicketDto);
    return this.ticketRepository.save(ticket);
  }

  async remove(id: number): Promise<void> {
    const ticket = await this.findOne(id);
    await this.ticketRepository.remove(ticket);
  }

  async validateTicket(
    uniqueCode: string,
    organizerId: number,
    isAdmin: boolean,
  ): Promise<any> {
    const ticket = await this.ticketRepository.findOne({
      where: { uniqueCode: uniqueCode },
      relations: ['order.customer', 'order.event', 'ticketType'],
    });

    if (!ticket) {
      throw new NotFoundException(ERROR_MESSAGES.TICKET.NOT_FOUND_BY_CODE);
    }

    if (ticket.order.event.organizerId !== organizerId && !isAdmin) {
      throw new BadRequestException(ERROR_MESSAGES.TICKET.UNAUTHORIZED);
    }

    if (ticket.status === TicketStatus.Used) {
      throw new BadRequestException(ERROR_MESSAGES.TICKET.USED);
    }

    if (ticket.status === TicketStatus.Expired) {
      throw new BadRequestException(ERROR_MESSAGES.TICKET.EXPIRED);
    }

    if (ticket.status === TicketStatus.Cancelled) {
      throw new BadRequestException(ERROR_MESSAGES.TICKET.CANCELLED);
    }

    if (ticket.status !== TicketStatus.Active) {
      throw new BadRequestException(ERROR_MESSAGES.TICKET.NOT_ACTIVE);
    }

    const event = ticket.order.event;
    if (event.status !== EventStatus.PUBLISHED) {
      throw new BadRequestException(ERROR_MESSAGES.TICKET.INVALID);
    }

    const customer = ticket.order.customer;
    if (customer.status !== UserStatus.ACTIVE) {
      throw new BadRequestException(ERROR_MESSAGES.TICKET.INVALID);
    }

    ticket.status = TicketStatus.Used;
    ticket.checkinTime = new Date();
    await this.ticketRepository.save(ticket);

    return {
      success: true,
      message: SUCCESS_MESSAGES.TICKET.CHECKIN_SUCCESS,
      tickets: {
        id: ticket.id,
        uniqueCode: ticket.uniqueCode,
        eventTitle: event.title,
        ticketType: ticket.ticketType.name,
        seatNumber: ticket.seatNumber,
        purchaserName: ticket.purchaserName || customer.fullName,
        purchaserEmail: ticket.purchaserEmail || customer.email,
        purchaserPhone: ticket.purchaserPhone || customer.phoneNumber,
        checkinTime: ticket.checkinTime,
      },
    };
  }

  // Lấy các sự kiện dành cho Admin
  async getAllForAdmin(
    query: GetMyTicketsQueryDto,
  ): Promise<PaginationResponseDto<any>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const qb = this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoin('ticket.order', 'order')
      .leftJoin('order.customer', 'customer')
      .leftJoin('ticket.ticketType', 'ticketType')
      .leftJoin('ticketType.event', 'event');

    // Lọc theo trạng thái vé
    if (query.status) {
      qb.andWhere('ticket.status = :status', { status: query.status });
    }
    // Tìm kiếm theo mã vé, tên sự kiện, loại vé
    if (query.search) {
      qb.andWhere(
        '(ticket.id::text ILIKE :search OR event.title ILIKE :search OR ticketType.name ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.eventId) {
      qb.andWhere('event.id = :eventId', { eventId: query.eventId });
    }

    if (query.dateFrom) {
      qb.andWhere('ticket.purchasedAt >= :dateFrom', {
        dateFrom: query.dateFrom,
      });
    }

    if (query.dateTo) {
      qb.andWhere('ticket.purchasedAt <= :dateTo', { dateTo: query.dateTo });
    }

    // Sắp xếp
    const sortOrder =
      query.sortOrder && query.sortOrder.toUpperCase() === 'ASC'
        ? 'ASC'
        : 'DESC';
    const sortBy = query.sortBy ?? 'id';

    // Count total items
    const totalItems = await qb.getCount();
    const totalPages = Math.ceil(totalItems / limit);

    // Lấy dữ liệu
    qb.select([
      // 1. Vé
      'ticket.id AS "id"',
      'ticket.status AS "status"',
      'ticket.seatNumber AS "seatNumber"',
      'ticket.checkinTime AS "checkinTime"',
      'ticket.purchasedAt AS "purchasedAt"',

      // 2. Sự kiện
      'event.id AS "eventId"',
      'event.title AS "eventTitle"',

      // 3. Loại vé & Giá
      'ticketType.name AS "ticketTypeName"',
      'ticketType.price AS "price"',

      // 4. Người mua (Customer)
      'customer.id AS "customerId"',
      'customer.fullName AS "customerName"',
      'customer.email AS "customerEmail"',
      'customer.phoneNumber AS "customerPhone"',

      // 5. Đơn hàng gốc
      'order.id AS "orderId"',
    ])
      .orderBy(`ticket.${sortBy}`, sortOrder)
      .skip(skip)
      .limit(limit);

    const tickets = await qb.getRawMany();

    const meta: PaginationMetaDto = {
      totalItems,
      itemCount: tickets.length,
      itemsPerPage: limit,
      totalPages,
      currentPage: page,
    };

    return { data: tickets, meta };
  }

  // Hàm chuyển vé sang Expired (dùng khi kết thúc sự kiện)
  async expireTicketsByEvent(eventId: number): Promise<void> {
    const tickets = await this.ticketRepository.find({
      where: {
        order: {
          event: {
            id: eventId,
          },
        },
        status: In([
          TicketStatus.Active,
          TicketStatus.Available,
          TicketStatus.Reserved,
        ]),
      },
      relations: ['order', 'order.event'],
    });
    for (const ticket of tickets) {
      ticket.status = TicketStatus.Expired;
      await this.ticketRepository.save(ticket);
      this.logger.log(`Vé hết hạn ID: ${ticket.id} (status = Expired)`);
    }
  }

  // Hàm chuyển vé sang Cancelled (dùng khi hủy sự kiện)
  @OnEvent('event.cancelled')
  async cancelTicketsByEvent(eventId: number): Promise<void> {
    const tickets = await this.ticketRepository.find({
      where: {
        order: {
          event: {
            id: eventId,
          },
        },
        status: In([
          TicketStatus.Active,
          TicketStatus.Available,
          TicketStatus.Reserved,
        ]),
      },
      relations: ['order', 'order.event'],
    });
    for (const ticket of tickets) {
      ticket.status = TicketStatus.Cancelled;
      await this.ticketRepository.save(ticket);
      this.logger.log(`Vé hủy ID: ${ticket.id} (status = Cancelled)`);
    }
  }

  // Hàm chuyển vé sang Active (dùng khi khôi phục sự kiện)
  @OnEvent('event.approved')
  async restoreTicketsByEvent(eventId: number): Promise<void> {
    const tickets = await this.ticketRepository.find({
      where: {
        order: {
          event: {
            id: eventId,
          },
        },
        status: In([TicketStatus.Cancelled]),
      },
      relations: ['order', 'order.event'],
    });
    for (const ticket of tickets) {
      ticket.status = TicketStatus.Active;
      await this.ticketRepository.save(ticket);
      this.logger.log(`Vé khôi phục ID: ${ticket.id} (status = Active)`);
    }
  }
}
