// src/stats/stats.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Event, EventStatus } from '../events/entities/event.entity';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import { User } from '../users/users.entity';
import { TicketType } from 'src/ticket-types/entities';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(TicketType)
    private ticketTypeRepo: Repository<TicketType>,
  ) {}

  // 1. Thống kê cho Organizer
  async getOrganizerStats(organizerId: number) {
    // Tổng số sự kiện của Organizer
    const totalEvents = await this.eventRepo.count({
      where: { organizerId },
    });

    // Tổng doanh thu và số vé đã bán (Tính dựa trên TicketType)
    // Query: Lấy tất cả loại vé thuộc các sự kiện của Organizer này
    const stats = await this.ticketTypeRepo
      .createQueryBuilder('tt')
      .leftJoin('tt.event', 'event')
      .where('event.organizerId = :organizerId', { organizerId })
      .select('SUM(tt.soldQuantity)', 'totalTicketsSold')
      .addSelect('SUM(tt.soldQuantity * tt.price)', 'totalRevenue')
      .getRawOne();

    // Số vé bán hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStats = await this.orderRepo
      .createQueryBuilder('order')
      .leftJoin('order.event', 'event')
      .leftJoin('order.tickets', 'tickets')
      .where('event.organizerId = :organizerId', { organizerId })
      .andWhere('order.status = :status', { status: OrderStatus.Paid })
      .andWhere('order.createdAt >= :today', { today })
      .select('COUNT(tickets.id)', 'todayTicketsSold')
      .getRawOne();

    return {
      totalEvents,
      totalTicketsSold: Number(stats.totalTicketsSold) || 0,
      totalRevenue: Number(stats.totalRevenue) || 0,
      todayTicketsSold: Number(todayStats.todayTicketsSold) || 0,
    };
  }

  // Lấy dữ liệu biểu đồ doanh thu cho Organizer - Optimized with PostgreSQL generate_series
  async getOrganizerRevenueChart(organizerId: number) {
    const result = await this.orderRepo.manager.query(
      `
      WITH date_series AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          '1 day'::interval
        )::date AS date
      )
      SELECT 
        TO_CHAR(ds.date, 'Dy') AS name,
        COALESCE(SUM(o.total_amount), 0) AS revenue
      FROM date_series ds
      LEFT JOIN (
        SELECT o.created_at, o.total_amount
        FROM orders o
        INNER JOIN events e ON o.event_id = e.id
        WHERE o.status = $1 AND e.organizer_id = $2
      ) o ON DATE(o.created_at) = ds.date
      GROUP BY ds.date
      ORDER BY ds.date ASC
      `,
      [OrderStatus.Paid, organizerId],
    );

    return result.map((row: any) => ({
      name: row.name,
      revenue: Number(row.revenue),
    }));
  }

  // 2. Thống kê cho Admin (Toàn hệ thống)
  async getAdminStats() {
    const totalUsers = await this.userRepo.count();
    const totalEvents = await this.eventRepo.count();

    // Đếm số sự kiện pending
    const pendingEventsCount = await this.eventRepo.count({
      where: { status: EventStatus.PENDING },
    });

    // Đếm số sự kiện đang hoạt động (Published)
    const activeEventsCount = await this.eventRepo.count({
      where: { status: EventStatus.PUBLISHED },
    });

    // Doanh thu toàn sàn (Dựa trên Order đã thanh toán)
    const revenueStats = await this.orderRepo
      .createQueryBuilder('order')
      .where('order.status = :status', { status: OrderStatus.Paid })
      .select('SUM(order.totalAmount)', 'totalRevenue')
      .getRawOne();

    // Tổng số vé đã bán toàn hệ thống
    const ticketStats = await this.ticketTypeRepo
      .createQueryBuilder('tt')
      .select('SUM(tt.soldQuantity)', 'totalTicketsSold')
      .getRawOne();

    const totalTicketsSold = Number(ticketStats.totalTicketsSold) || 0;

    // Tính tỷ lệ tăng trưởng doanh thu (so với tháng trước)
    const revenueGrowth = await this.calculateRevenueGrowth();

    // Lấy dữ liệu 6 tháng gần nhất cho biểu đồ
    const monthlyData = await this.getMonthlyGrowthData();

    return {
      totalUsers,
      totalEvents,
      totalRevenue: Number(revenueStats.totalRevenue) || 0,
      pendingEventsCount,
      monthlyData,
      activeEvents: activeEventsCount,
      totalTicketsSold,
      revenueGrowth,
    };
  }

  // Lấy dữ liệu tăng trưởng theo tháng
  private async getMonthlyGrowthData(): Promise<
    Array<{ name: string; users: number; events: number }>
  > {
    const data: Array<{ name: string; users: number; events: number }> = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        0,
        23,
        59,
        59,
      );

      // Count users created in this month
      const users = await this.userRepo
        .createQueryBuilder('user')
        .where('user.createdAt >= :start', { start: monthStart })
        .andWhere('user.createdAt <= :end', { end: monthEnd })
        .getCount();

      // Count events created in this month
      const events = await this.eventRepo
        .createQueryBuilder('event')
        .where('event.createdAt >= :start', { start: monthStart })
        .andWhere('event.createdAt <= :end', { end: monthEnd })
        .getCount();

      data.push({
        name: `T${monthStart.getMonth() + 1}`,
        users,
        events,
      });
    }

    return data;
  }

  // Tính tỷ lệ tăng trưởng doanh thu (tháng này so với tháng trước)
  private async calculateRevenueGrowth(): Promise<number> {
    const now = new Date();

    // Tháng hiện tại: từ đầu tháng đến bây giờ
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = now;

    // Tháng trước: từ đầu tháng trước đến cuối tháng trước
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const previousMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );

    // Doanh thu tháng hiện tại
    const currentRevenue = await this.orderRepo
      .createQueryBuilder('order')
      .where('order.status = :status', { status: OrderStatus.Paid })
      .andWhere('order.createdAt >= :start', { start: currentMonthStart })
      .andWhere('order.createdAt <= :end', { end: currentMonthEnd })
      .select('SUM(order.totalAmount)', 'revenue')
      .getRawOne();

    // Doanh thu tháng trước
    const previousRevenue = await this.orderRepo
      .createQueryBuilder('order')
      .where('order.status = :status', { status: OrderStatus.Paid })
      .andWhere('order.createdAt >= :start', { start: previousMonthStart })
      .andWhere('order.createdAt <= :end', { end: previousMonthEnd })
      .select('SUM(order.totalAmount)', 'revenue')
      .getRawOne();

    const current = Number(currentRevenue.revenue) || 0;
    const previous = Number(previousRevenue.revenue) || 0;

    if (previous === 0) {
      return current > 0 ? 100 : 0; // Nếu tháng trước = 0, nếu tháng này > 0 thì 100%, else 0
    }

    return Math.round(((current - previous) / previous) * 100);
  }

  async getAdminRevenueChart(dateFrom?: string, dateTo?: string) {
    // Mặc định là 30 ngày gần nhất nếu không chọn ngày
    const endDate = dateTo ? new Date(dateTo) : new Date();
    const startDate = dateFrom
      ? new Date(dateFrom)
      : new Date(new Date().setDate(endDate.getDate() - 30));

    // Format ngày để đưa vào SQL
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const result = await this.orderRepo.manager.query(
      `
      WITH date_series AS (
        SELECT generate_series(
          $1::date,
          $2::date,
          '1 day'::interval
        )::date AS date
      )
      SELECT 
        TO_CHAR(ds.date, 'DD/MM') AS name, -- Format ngày hiển thị trục X
        COALESCE(SUM(o.total_amount), 0) AS revenue
      FROM date_series ds
      LEFT JOIN orders o 
        ON DATE(o.created_at) = ds.date
        AND o.status = $3 -- Chỉ tính đơn đã thanh toán
      GROUP BY ds.date
      ORDER BY ds.date ASC
      `,
      [formatDate(startDate), formatDate(endDate), OrderStatus.Paid],
    );

    return result.map((row: any) => ({
      name: row.name,
      revenue: Number(row.revenue),
    }));
  }

  // Thống kê tỷ lệ trạng thái đơn hàng (Pie Chart)
  async getAdminOrderStatusStats() {
    const result = await this.orderRepo
      .createQueryBuilder('order')
      .select('order.status', 'name')
      .addSelect('COUNT(order.id)', 'value')
      .groupBy('order.status')
      .getRawMany();

    // Map dữ liệu để frontend dễ dùng (đổi key thành name/value)
    return result.map((item) => ({
      name: item.name,
      value: Number(item.value),
    }));
  }

  // Lấy danh sách giao dịch gần đây
  async getRecentTransactions(limit: number = 5) {
    const orders = await this.orderRepo.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['customer', 'event'], // Join bảng user và event
    });

    return orders.map((order) => ({
      id: order.id,
      customerName: order.customer?.fullName || 'Unknown',
      customerAvatar: order.customer?.avatarUrl || null,
      eventName: order.event?.title || 'Unknown Event',
      amount: Number(order.totalAmount),
      status: order.status,
      createdAt: order.createdAt,
    }));
  }

  async getTopSellingEvents(limit = 5) {
    const result = await this.orderRepo
      .createQueryBuilder('order')
      .leftJoin('order.event', 'event')
      .select([
        'event.id AS "id"',
        'event.title AS "title"',
        'event.venueName AS "location"',
        'event.startTime AS "date"',
        'event.bannerUrl AS "images"',
      ])
      .addSelect('SUM(order.totalAmount)', 'revenue')
      .addSelect('COUNT(order.id)', 'soldCount')
      .where('order.status = :status', { status: OrderStatus.Paid })
      .groupBy('event.id')
      .orderBy('"revenue"', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map((item) => {
      // Xử lý lấy ảnh đầu tiên của sự kiện làm avatar
      let imageUrl = null;
      try {
        // Nếu database lưu mảng ảnh dạng JSON hoặc String
        if (Array.isArray(item.images) && item.images.length > 0)
          imageUrl = item.images[0];
        else if (typeof item.images === 'string') imageUrl = item.images;
      } catch {
        imageUrl = null;
      }

      return {
        id: item.id,
        name: item.title,
        location: item.location,
        date: item.date,
        revenue: Number(item.revenue),
        soldCount: Number(item.soldCount),
        image: imageUrl, // Trả về ảnh thật cho Frontend
        status: 'Active',
      };
    });
  }

  // Hàm lấy khách hàng thân thiết
  async getLoyalCustomers(limit = 5, userId?: number) {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoin('order.customer', 'user')
      .select([
        'user.id AS "id"',
        'user.fullName AS "name"',
        'user.email AS "email"',
        'user.avatarUrl AS "avatar"',
      ])
      .addSelect('SUM(order.totalAmount)', 'totalSpent')
      .addSelect('COUNT(order.id)', 'orderCount')
      .where('order.status = :status', { status: OrderStatus.Paid });

    if (userId) {
      // Nếu là Organizer, chỉ tính đơn hàng thuộc các sự kiện của Organizer đó
      qb.leftJoin('order.event', 'event') // Join thêm bảng event để check organizerId
        .andWhere('event.organizerId = :userId', { userId });
    }

    qb.groupBy('user.id')
      .addGroupBy('user.fullName') // Postgres yêu cầu group by các trường select
      .addGroupBy('user.email')
      .addGroupBy('user.avatarUrl')
      .orderBy('"totalSpent"', 'DESC')
      .limit(limit);

    const result = await qb.getRawMany();

    return result.map((item) => ({
      id: item.id,
      name: item.name || 'Người dùng ẩn danh',
      email: item.email,
      avatar: item.avatar, // Đã alias từ avatarUrl ở trên
      totalSpent: Number(item.totalSpent),
      orderCount: Number(item.orderCount),
    }));
  }

  // Lấy sự kiện bán chạy nhất cho Organizer
  async getOrganizerTopEvents(limit = 5, organizerId: number) {
    const result = await this.orderRepo
      .createQueryBuilder('order')
      .leftJoin('order.event', 'event')
      .leftJoin('order.tickets', 'tickets')
      .select([
        'event.id AS "id"',
        'event.title AS "name"',
        'event.city AS "city"',
        'event.venueName AS "venueName"',
        'event.startTime AS "date"',
        'event.bannerUrl AS "bannerUrl"',
      ])
      .addSelect('SUM(order.totalAmount)', 'revenue')
      .addSelect('COUNT(tickets.id)', 'ticketsSold')
      .where('order.status = :status', { status: OrderStatus.Paid })
      .andWhere('event.organizerId = :organizerId', { organizerId })
      .groupBy('event.id')
      .orderBy('"revenue"', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map((item) => ({
      id: item.id,
      name: item.name,
      location: item.venueName,
      date: item.date,
      revenue: Number(item.revenue),
      ticketsSold: Number(item.ticketsSold),
      image: item.bannerUrl || null,
    }));
  }

  // Lấy sự kiện sắp diễn ra tiếp theo cho Organizer
  async getOrganizerNextEvent(organizerId: number) {
    const now = new Date();
    const event = await this.eventRepo.findOne({
      where: {
        organizerId,
        status: EventStatus.PUBLISHED,
        startTime: MoreThanOrEqual(now),
      },
      order: { startTime: 'ASC' },
    });

    if (!event) return null;

    // Đếm số vé đã bán cho sự kiện này
    const ticketStats = await this.ticketTypeRepo
      .createQueryBuilder('tt')
      .where('tt.eventId = :eventId', { eventId: event.id })
      .select('SUM(tt.soldQuantity)', 'sold')
      .addSelect('SUM(tt.initialQuantity)', 'total')
      .getRawOne();

    const sold = Number(ticketStats.sold) || 0;
    const total = Number(ticketStats.total) || 0;

    return {
      id: event.id,
      name: event.title,
      date: event.startTime,
      location: event.venueName,
      soldTickets: sold,
      totalTickets: total,
      image: event.bannerUrl || null,
    };
  }

  // Lấy dữ liệu hiệu suất từng sự kiện (Event Performance Table)
  async getOrganizerEventPerformance(organizerId: number) {
    const events = await this.eventRepo.find({
      where: { organizerId },
      order: { startTime: 'DESC' },
      take: 10, // Lấy 10 sự kiện gần nhất
    });

    const performance = await Promise.all(
      events.map(async (event) => {
        // Tính tổng doanh thu và số vé bán
        const stats = await this.orderRepo
          .createQueryBuilder('order')
          .leftJoin('order.tickets', 'tickets')
          .where('order.eventId = :eventId', { eventId: event.id })
          .andWhere('order.status = :status', { status: OrderStatus.Paid })
          .select('SUM(order.totalAmount)', 'revenue')
          .addSelect('COUNT(tickets.id)', 'sold')
          .getRawOne();

        // Tính tổng số vé có sẵn
        const ticketStats = await this.ticketTypeRepo
          .createQueryBuilder('tt')
          .where('tt.eventId = :eventId', { eventId: event.id })
          .select('SUM(tt.initialQuantity)', 'total')
          .getRawOne();

        const sold = Number(stats.sold) || 0;
        const total = Number(ticketStats.total) || 1; // Tránh chia cho 0
        const sellRate = Math.round((sold / total) * 100);

        return {
          id: event.id,
          name: event.title,
          date: event.startTime,
          revenue: Number(stats.revenue) || 0,
          soldTickets: sold,
          totalTickets: total,
          sellRate,
          status: event.status,
          checkInRate: sellRate, // Use sellRate as checkInRate for now
        };
      }),
    );

    return performance;
  }

  // So sánh hiệu suất giữa các sự kiện (Event Comparison Chart)
  async getOrganizerEventComparison(organizerId: number) {
    const events = await this.eventRepo.find({
      where: { organizerId },
      order: { startTime: 'DESC' },
      take: 5, // Lấy 5 sự kiện gần nhất để so sánh
    });

    const comparison = await Promise.all(
      events.map(async (event) => {
        // Tính doanh thu và số vé bán
        const stats = await this.orderRepo
          .createQueryBuilder('order')
          .leftJoin('order.tickets', 'tickets')
          .where('order.eventId = :eventId', { eventId: event.id })
          .andWhere('order.status = :status', { status: OrderStatus.Paid })
          .select('SUM(order.totalAmount)', 'revenue')
          .addSelect('COUNT(DISTINCT order.id)', 'orders')
          .addSelect('COUNT(tickets.id)', 'sold')
          .getRawOne();

        return {
          name:
            event.title.length > 20
              ? event.title.substring(0, 20) + '...'
              : event.title,
          revenue: Number(stats.revenue) || 0,
          tickets: Number(stats.sold) || 0,
          orders: Number(stats.orders) || 0,
        };
      }),
    );

    return comparison;
  }
}
