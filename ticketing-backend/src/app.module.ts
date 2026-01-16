import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { OrganizerBanksModule } from './organizer-banks/organizer-banks.module';
import { OrdersModule } from './orders/orders.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TicketsModule } from './tickets/tickets.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PayoutsModule } from './payouts/payouts.module';
import { TicketTypesModule } from './ticket-types/ticket-types.module';
import { PaymentModule } from './payment/payment.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { StatsModule } from './stats/stats.module';
import { ScheduleModule } from '@nestjs/schedule';
import vnpayConfig from './config/vnpay.config';
import { UploadModule } from './upload/upload.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as Joi from 'joi';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1 phút (tính bằng milliseconds)
        limit: 10, // Tối đa 10 requests mỗi phút
        skipIf: (context) => {
          const request = context.switchToHttp().getRequest();
          // Bỏ qua giới hạn tốc độ cho các yêu cầu từ localhost (phát triển)
          const ip = request.ip || request.connection.remoteAddress;
          return ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
        },
      },
      {
        name: 'long',
        ttl: 3600000, // 1 giờ
        limit: 100, // Tối đa 100 requests mỗi giờ
        skipIf: (context) => {
          const request = context.switchToHttp().getRequest();
          // Bỏ qua giới hạn tốc độ cho các yêu cầu từ localhost (phát triển)
          const ip = request.ip || request.connection.remoteAddress;
          return ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
        },
      },
    ]),

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [vnpayConfig],
      validationSchema: Joi.object({
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(5432),
        DB_USER: Joi.string().required(),
        DB_PASS: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
      }),
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    UsersModule,
    AuthModule,
    EventsModule,
    OrganizerBanksModule,
    OrdersModule,
    TransactionsModule,
    TicketsModule,
    ReviewsModule,
    PayoutsModule,
    TicketTypesModule,
    PaymentModule,
    StatsModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
