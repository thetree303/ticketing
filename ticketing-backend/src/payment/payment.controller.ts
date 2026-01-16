import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Res,
  Req,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';
import type { Response } from 'express';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post('vnpay/create')
  @UseGuards(JwtAuthGuard)
  async createPayment(
    @CurrentUser('id') userId: number,
    @Body() createPaymentDto: CreatePaymentDto,
    @Req() req: any,
  ) {
    const clientIp =
      req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const paymentUrl = await this.paymentService.createPaymentUrl(
      userId,
      clientIp as string,
      createPaymentDto,
    );
    return {
      success: true,
      paymentUrl,
    };
  }

  // ----------------------------------------------------------------
  // 1. IPN URL: VNPAY gọi ngầm (Server-to-Server)
  // Cấu hình URL này vào phần "IPN URL" trên trang quản trị VNPAY
  // ----------------------------------------------------------------
  @Public()
  @Get('vnpay/ipn')
  async vnpayIpn(@Query() query: Record<string, string>, @Res() res: Response) {
    try {
      const result = await this.paymentService.handleVnpayIpn(query);
      // Trả về đúng định dạng JSON mà VNPAY yêu cầu
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      this.logger.error('VNPAY IPN Error', error);
      // Trường hợp lỗi server nội bộ
      return res
        .status(HttpStatus.OK)
        .json({ RspCode: '99', Message: 'Unknown error' });
    }
  }

  // ----------------------------------------------------------------
  // 2. Return URL: Redirect người dùng về Frontend
  // Cấu hình URL này vào phần "Return URL" trên trang quản trị VNPAY
  // ----------------------------------------------------------------
  @Public()
  @Get('vnpay/return')
  async vnpayReturn(
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ) {
    const result = await this.paymentService.handleVnpayReturn(query);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (result.success) {
      return res.redirect(
        `${frontendUrl}/payment/success?orderId=${result.orderId}&code=${result.code}`,
      );
    } else {
      return res.redirect(
        `${frontendUrl}/payment/failed?orderId=${result.orderId}&code=${result.code}&message=${encodeURIComponent(result.message)}`,
      );
    }
  }
}
