// src/stats/stats.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/dto/create-user.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/users.entity';

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('organizer')
  @Roles(UserRole.ORGANIZER)
  getOrganizerStats(@CurrentUser() user: User) {
    return this.statsService.getOrganizerStats(user.id);
  }

  @Get('organizer/revenue-chart')
  @Roles(UserRole.ORGANIZER)
  getOrganizerRevenueChart(@CurrentUser() user: User) {
    return this.statsService.getOrganizerRevenueChart(user.id);
  }

  @Get('organizer/top-events')
  @Roles(UserRole.ORGANIZER)
  getOrganizerTopEvents(
    @Query('limit') limit: number,
    @CurrentUser() user: User,
  ) {
    return this.statsService.getOrganizerTopEvents(limit || 5, user.id);
  }

  @Get('organizer/next-event')
  @Roles(UserRole.ORGANIZER)
  getOrganizerNextEvent(@CurrentUser() user: User) {
    return this.statsService.getOrganizerNextEvent(user.id);
  }

  @Get('organizer/event-performance')
  @Roles(UserRole.ORGANIZER)
  getOrganizerEventPerformance(@CurrentUser() user: User) {
    return this.statsService.getOrganizerEventPerformance(user.id);
  }

  @Get('organizer/event-comparison')
  @Roles(UserRole.ORGANIZER)
  getOrganizerEventComparison(@CurrentUser() user: User) {
    return this.statsService.getOrganizerEventComparison(user.id);
  }

  @Get('organizer/loyal-customers')
  @Roles(UserRole.ORGANIZER)
  getOrganizerLoyalCustomers(
    @Query('limit') limit: number,
    @CurrentUser() user: User,
  ) {
    return this.statsService.getLoyalCustomers(limit || 5, user.id);
  }

  @Get('admin')
  @Roles(UserRole.ADMIN)
  getAdminStats() {
    return this.statsService.getAdminStats();
  }

  @Get('admin/revenue-chart')
  @Roles(UserRole.ADMIN)
  getAdminRevenueChart(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.statsService.getAdminRevenueChart(dateFrom, dateTo);
  }

  @Get('admin/order-status')
  @Roles(UserRole.ADMIN)
  getAdminOrderStatusStats() {
    return this.statsService.getAdminOrderStatusStats();
  }

  @Get('admin/recent-transactions')
  @Roles(UserRole.ADMIN)
  getRecentTransactions(@Query('limit') limit: number) {
    return this.statsService.getRecentTransactions(limit || 5);
  }

  @Get('admin/top-events')
  @Roles(UserRole.ADMIN)
  getTopEvents(@Query('limit') limit: number) {
    return this.statsService.getTopSellingEvents(limit || 5);
  }

  @Get('admin/loyal-customers')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  getLoyalCustomers(@Query('limit') limit: number, @CurrentUser() user: User) {
    const userId = user.role === UserRole.ORGANIZER ? user.id : undefined;
    return this.statsService.getLoyalCustomers(limit || 5, userId);
  }
}
