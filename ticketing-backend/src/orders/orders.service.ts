// src/orders/orders.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import {
  CreateOrderRequestDto,
  OrderItemDto,
} from './dto/create-order-request.dto';
import { GetMyOrdersQueryDto } from './dto/get-my-orders-query.dto';
import { Event, EventStatus } from '../events/entities/event.entity';
import { TicketType } from '../ticket-types/entities/ticket-type.entity';
import { Ticket, TicketStatus } from '../tickets/entities/ticket.entity';
import { v4 as uuidv4 } from 'uuid';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationResponseDto, PaginationMetaDto } from '../events/dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThan } from 'typeorm';
import { Logger } from '@nestjs/common';
import { ERROR_MESSAGES } from '../common/constants/messages.constant';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  // TẠO ĐƠN HÀNG MỚI
  async create(
    userId: number,
    createOrderDto: CreateOrderRequestDto,
  ): Promise<Order | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Bắt đầu transaction
    try {
      let totalAmount = 0;

      // Kiểm tra và giữ vé
      for (const item of createOrderDto.items) {
        const ticketType = await queryRunner.manager.findOne(TicketType, {
          where: { id: item.ticketTypeId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!ticketType) {
          throw new NotFoundException(
            `Loại vé ${item.ticketTypeId} không tồn tại`,
          );
        }

        if (ticketType.eventId !== createOrderDto.eventId) {
          throw new BadRequestException(
            `Loại vé ${item.ticketTypeId} không thuộc sự kiện ${createOrderDto.eventId}`,
          );
        }

        const event = await queryRunner.manager.findOne(Event, {
          where: { id: ticketType.eventId },
        });

        if (!event || event.status !== EventStatus.PUBLISHED) {
          throw new BadRequestException(
            `Sự kiện ${createOrderDto.eventId} không ở trạng thái PUBLISHED`,
          );
        }

        if (
          ticketType.soldQuantity + item.quantity >
          ticketType.initialQuantity
        ) {
          throw new BadRequestException(
            `Loại vé ${item.ticketTypeId} không đủ số lượng vé`,
          );
        }

        // Trừ kho để giữ vé (Lock Stock)
        ticketType.soldQuantity += item.quantity;
        await queryRunner.manager.save(ticketType);

        // Tính tổng tiền
        totalAmount += Number(ticketType.price) * item.quantity;
      }
      // Tạo đơn hàng
      const order = queryRunner.manager.create(Order, {
        customer: { id: userId },
        event: { id: createOrderDto.eventId },
        totalAmount,
        status: OrderStatus.Pending,
        metadata: { items: createOrderDto.items },
      });
      const savedOrder = await queryRunner.manager.save(order);

      // Commit transaction
      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async confirmOrder(
    orderId: number,
    purchaserInfo?: {
      purchaserName?: string;
      purchaserEmail?: string;
      purchaserPhone?: string;
    },
  ): Promise<Order> {
    this.logger.log(`Xác nhận đơn hàng với ID: ${orderId}`);
    return this.dataSource.transaction(async (manager) => {
      // Tìm đơn hàng
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        relations: ['customer', 'event'],
      });

      if (!order) throw new NotFoundException(ERROR_MESSAGES.ORDER.NOT_FOUND);
      if (order.status === OrderStatus.Refunded) {
        throw new BadRequestException(ERROR_MESSAGES.ORDER.ALREADY_REFUNDED);
      }
      if (order.status === OrderStatus.Paid) return order;
      if (order.status === OrderStatus.Cancelled) {
        throw new BadRequestException(ERROR_MESSAGES.ORDER.ALREADY_CANCELLED);
      }

      // 1. Cập nhật trạng thái đơn hàng thành Paid
      order.status = OrderStatus.Paid;
      await manager.save(order);

      // 2. Sinh vé thật, cập nhật trạng thái vé từ Reserved -> Active
      const metadata = order.metadata as any;
      const tickets = Array.isArray(metadata)
        ? metadata
        : (metadata?.items as OrderItemDto[]) || [];
      const orderTickets: Ticket[] = [];

      const now = new Date();

      for (const ticket of tickets) {
        for (let i = 0; i < ticket.quantity; i++) {
          const newTicket = new Ticket();
          newTicket.orderId = order.id;
          newTicket.ticketTypeId = ticket.ticketTypeId;
          newTicket.uniqueCode = uuidv4();
          newTicket.status = TicketStatus.Active;
          newTicket.eventId = order.eventId;
          newTicket.order = order;
          newTicket.ticketType = { id: ticket.ticketTypeId } as TicketType;
          newTicket.purchasedAt = now;

          if (purchaserInfo) {
            newTicket.purchaserName = purchaserInfo.purchaserName || '';
            newTicket.purchaserEmail = purchaserInfo.purchaserEmail || '';
            newTicket.purchaserPhone = purchaserInfo.purchaserPhone || '';
          }
          orderTickets.push(newTicket);
        }
      }
      // Lưu tất cả vé vào CSDL
      if (orderTickets.length > 0) {
        await manager.save(Ticket, orderTickets);
      }

      // Trả về đơn hàng đã được xác nhận
      const confirmedOrder = await manager.findOne(Order, {
        where: { id: orderId },
        relations: ['tickets'],
      });
      if (!confirmedOrder)
        throw new NotFoundException(ERROR_MESSAGES.ORDER.NOT_FOUND);
      return confirmedOrder;
    });
  }

  // Hủy đơn hàng (Cancel Order)
  async cancelOrder(orderId: number, userId?: number): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // Bắt đầu transaction
    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId, ...(userId ? { customerId: userId } : {}) },
        relations: ['event'],
      });
      if (!order) {
        throw new NotFoundException(ERROR_MESSAGES.ORDER.NOT_FOUND);
      }
      if (order.status === OrderStatus.Cancelled) {
        throw new BadRequestException(ERROR_MESSAGES.ORDER.ALREADY_CANCELLED);
      }
      if (order.status === OrderStatus.Refunded) {
        throw new BadRequestException(ERROR_MESSAGES.ORDER.ALREADY_REFUNDED);
      }
      // Cập nhật trạng thái đơn hàng thành Cancelled
      order.status = OrderStatus.Cancelled;
      await queryRunner.manager.save(order);

      // Giải phóng vé đã giữ (nếu có)
      const metadata = order.metadata as any;
      const tickets = Array.isArray(metadata)
        ? metadata
        : (metadata?.items as OrderItemDto[]) || [];
      for (const item of tickets) {
        const ticketType = await queryRunner.manager.findOne(TicketType, {
          where: { id: item.ticketTypeId },
          lock: { mode: 'pessimistic_write' },
        });

        if (ticketType) {
          await queryRunner.manager.decrement(
            TicketType,
            { id: item.ticketTypeId },
            'soldQuantity',
            item.quantity,
          );
        }
      }

      // Commit transaction
      await queryRunner.commitTransaction();
      this.logger.log(`Đơn hàng ${orderId} đã được hủy thành công`);
      return { message: 'Đơn hàng đã được hủy thành công' };
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Lấy tất cả đơn hàng với phân trang và lọc
  async getAllWithPagination(
    query: GetMyOrdersQueryDto,
  ): Promise<PaginationResponseDto<any>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.customer', 'customer')
      .leftJoin('order.event', 'event');

    // Filters
    if (query.status) {
      qb.andWhere('order.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(CAST(order.id AS TEXT) ILIKE :search OR customer.fullName ILIKE :search OR customer.email ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Filter by date range
    if (query.dateFrom) {
      qb.andWhere('order.createdAt >= :dateFrom', {
        dateFrom: query.dateFrom,
      });
    }
    if (query.dateTo) {
      qb.andWhere('order.createdAt <= :dateTo', {
        dateTo: query.dateTo,
      });
    }

    // Get data with ordering
    const sortOrder =
      query.sortOrder && query.sortOrder.toUpperCase() === 'ASC'
        ? 'ASC'
        : 'DESC';

    const sortByMap: Record<string, string> = {
      createdAt: 'order.createdAt',
      totalAmount: 'order.totalAmount',
      id: 'order.id',
      status: 'order.status',
    };
    const sortBy = sortByMap[query.sortBy ?? ''] ?? 'order.createdAt';

    // Đếm tổng số đơn hàng
    const totalItems = await qb.getCount();
    const totalPages = Math.ceil(totalItems / limit);

    // Lấy dữ liệu với phân trang và sắp xếp
    qb.select([
      // 1. Thông tin đơn hàng
      'order.id AS "id"',
      'order.totalAmount AS "totalAmount"',
      'order.status AS "status"',
      'order.createdAt AS "createdAt"',
      // 2. Thông tin khách hàng
      'customer.id AS "customerId"',
      'customer.fullName AS "customerName"',
      'customer.email AS "customerEmail"',
      'customer.phoneNumber AS "customerPhone"',
      // 3. Thông tin sự kiện
      'event.id AS "eventId"',
      'event.title AS "eventTitle"',
    ])
      .orderBy(sortBy, sortOrder)
      .skip(skip)
      .take(limit);

    const orders = await qb.getRawMany();

    const meta: PaginationMetaDto = {
      totalItems,
      itemCount: orders.length,
      itemsPerPage: limit,
      totalPages,
      currentPage: page,
    };

    return {
      data: orders,
      meta,
    };
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['customer', 'event', 'tickets', 'tickets.ticketType'],
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return this.orderRepository.save(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }

  async findByCustomerPaginated(
    userId: number,
    query: GetMyOrdersQueryDto,
  ): Promise<PaginationResponseDto<any>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.event', 'event')
      .leftJoin('order.tickets', 'tickets')
      .leftJoin('tickets.ticketType', 'ticketType')
      .select([
        'order.id AS id',
        'order.status AS status',
        'event.id AS "eventId"',
        'event.title AS "eventTitle"',
        'event.startTime AS "eventStartTime"',
        'ticketType.id AS "ticketTypeId"',
        'ticketType.name AS "ticketTypeName"',
        'order.totalAmount AS "totalAmount"',
        'order.createdAt AS "createdAt"',
      ])
      .where('order.customerId = :userId', { userId })
      .groupBy('order.id')
      .addGroupBy('event.id')
      .addGroupBy('ticketType.id');

    if (query.status) {
      qb.andWhere('order.status = :status', { status: query.status });
    }

    if (query.search) {
      qb.andWhere(
        '(CAST(order.id AS TEXT) ILIKE :search OR event.title ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const countQb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.event', 'event')
      .where('order.customerId = :userId', { userId });

    if (query.status) {
      countQb.andWhere('order.status = :status', { status: query.status });
    }
    if (query.search) {
      countQb.andWhere(
        '(CAST(order.id AS TEXT) ILIKE :search OR event.title ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const sortOrder =
      query.sortOrder && query.sortOrder.toUpperCase() === 'ASC'
        ? 'ASC'
        : 'DESC';

    const sortByMap: Record<string, string> = {
      createdAt: 'order.createdAt',
      totalAmount: 'order.totalAmount',
      id: 'order.id',
      status: 'order.status',
    };
    const sortBy = sortByMap[query.sortBy ?? ''] ?? 'order.createdAt';
    qb.orderBy(sortBy, sortOrder);

    const totalItems = await countQb.getCount();
    const totalPages = Math.ceil(totalItems / limit);

    qb.offset(skip).limit(limit);

    const orders = await qb.getRawMany();

    const meta: PaginationMetaDto = {
      totalItems,
      itemCount: orders.length,
      itemsPerPage: limit,
      totalPages,
      currentPage: page,
    };

    return {
      data: orders,
      meta,
    };
  }

  // Cron job để hủy các đơn hàng hết hạn mỗi phút
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredOrders() {
    const expirationMinutes = parseInt(process.env.ORDER_EXP || '15', 10);
    const expirationTime = new Date(Date.now() - expirationMinutes * 60 * 1000);
    this.logger.log(
      `Kiểm tra đơn hàng hết hạn trước: ${expirationTime.toISOString()}`,
    );

    const expiredOrders = await this.orderRepository.find({
      where: {
        status: OrderStatus.Pending,
        createdAt: LessThan(expirationTime),
      },
    });

    if (expiredOrders.length > 0) {
      this.logger.log(
        `Tìm thấy ${expiredOrders.length} đơn hàng hết hạn. Đang hủy...`,
      );

      for (const order of expiredOrders) {
        try {
          await this.cancelOrder(order.id, order.customerId);
          this.logger.log(`Đã hủy đơn hàng: ${order.id}`);
        } catch (error) {
          this.logger.error(`Lỗi khi hủy đơn hàng: ${order.id}`, error);
        }
      }
    }
  }
}
