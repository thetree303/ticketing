import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../orders/entities/order.entity';
import * as crypto from 'crypto';
import * as qs from 'qs';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from '../orders/orders.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly configService: ConfigService,
    private readonly ordersService: OrdersService,
  ) {}

  // Tạo URL thanh toán VNPAY
  async createPaymentUrl(
    userId: number,
    clientIp: string,
    createPaymentDto: CreatePaymentDto,
  ): Promise<string> {
    const order = await this.orderRepository.findOne({
      where: { id: createPaymentDto.orderId, customerId: userId },
      relations: ['event'],
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.status !== OrderStatus.Pending) {
      throw new BadRequestException('Order is not pending payment');
    }

    // Lưu purchaser info vào order metadata
    if (
      createPaymentDto.purchaserName ||
      createPaymentDto.purchaserEmail ||
      createPaymentDto.purchaserPhone
    ) {
      const metadata = order.metadata || {};
      const items = Array.isArray(metadata) ? metadata : metadata.items || [];
      order.metadata = {
        items,
        purchaserInfo: {
          name: createPaymentDto.purchaserName,
          email: createPaymentDto.purchaserEmail,
          phone: createPaymentDto.purchaserPhone,
        },
      };
      await this.orderRepository.save(order);
    }

    const tmnCode = this.configService.get<string>('vnpay.vnp_TmnCode') || '';
    const hashSecret =
      this.configService.get<string>('vnpay.vnp_HashSecret') || '';
    const vnpUrl = this.configService.get<string>('vnpay.vnp_Url') || '';
    const returnUrl =
      this.configService.get<string>('vnpay.vnp_ReturnUrl') || '';
    const timeLimit = 15; // phút
    const createDate = this.formatDate(order.createdAt);
    const expireDate = this.formatDate(
      new Date(order.createdAt.getTime() + timeLimit * 60 * 1000),
    );
    const orderId = `${order.id}-${Date.now()}`;
    const amount = order.totalAmount * 100; // Tính theo VND * 100

    const params: Record<string, string | number> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Amount: amount,
      vnp_BankCode: 'NCB',
      vnp_CreateDate: createDate,
      vnp_CurrCode: 'VND',
      vnp_IpAddr: clientIp || '127.0.0.1',
      vnp_Locale: 'vn',
      vnp_OrderInfo: `Thanh toan don hang ID ${order.id}`,
      vnp_OrderType: 'other',
      vnp_ReturnUrl: returnUrl,
      vnp_ExpireDate: expireDate,
      vnp_TxnRef: orderId,
    };

    // Sắp xếp các tham số theo đúng thứ tự
    const sorted = this.sortObject(params);

    // Tạo chuỗi được băm
    const signData = qs.stringify(sorted, { encode: false });
    const hmac = crypto.createHmac('sha512', hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    sorted['vnp_SecureHash'] = signed;

    // Ghép lại thành URL hoàn chỉnh
    const paymentUrl = `${vnpUrl}?${qs.stringify(sorted, { encode: false })}`;
    return paymentUrl;
  }

  // ----- LOGIC XỬ LÝ PHẢN HỒI TỪ VNPAY -----
  // 1. Kiểm tra phản hồi từ VNPAY
  private async verifyVnpayData(query: Record<string, string>) {
    const vnp_Params = { ...query };
    const secureHash = vnp_Params['vnp_SecureHash'];
    const hashSecret =
      this.configService.get<string>('vnpay.vnp_HashSecret') || '';

    // Xóa các param không cần thiết để tính hash
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    // Sắp xếp các tham số, tạo chuỗi băm
    const sortedParams = this.sortObject(vnp_Params);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    // Xác thực checksum
    if (secureHash !== signed) {
      return {
        isValid: false,
        code: '97',
        message: 'Invalid Checksum',
        order: null,
      };
    }

    // Lấy thông tin cần thiết
    const txnRef = vnp_Params['vnp_TxnRef'] || '';
    const orderId = parseInt(txnRef.split('-')[0], 10);
    const vnpAmount = parseInt(vnp_Params['vnp_Amount'] || '0', 10) / 100;
    const rspCode = vnp_Params['vnp_ResponseCode'];

    // Tìm đơn hàng, kiểm tra các thông tin
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      this.logger.error(`[VNP CHECK] Order not found for orderId ${orderId}`);
      return {
        isValid: false,
        code: '01',
        message: 'Order not found',
        order: null,
      };
    }

    // Kiểm tra số tiền (cho phép sai số dưới 0.01 do làm tròn)
    const orderAmount = Number(order.totalAmount);
    if (Math.abs(orderAmount - vnpAmount) > 0.01) {
      this.logger.error(
        `[VNP CHECK] Invalid amount for orderId ${orderId}. Expected ${order.totalAmount}, got ${vnpAmount}`,
      );
      return { isValid: false, code: '04', message: 'Invalid Amount', order };
    }

    // Trả về kết quả hợp lệ, với code gốc từ VNPAY
    return {
      isValid: true,
      code: rspCode,
      message: 'Success',
      order,
    };
  }

  // 2. Xử lý IPN từ VNPAY
  async handleVnpayIpn(
    query: Record<string, string>,
  ): Promise<{ RspCode: string; Message: string }> {
    try {
      const verification = await this.verifyVnpayData(query);
      if (!verification.isValid) {
        return { RspCode: verification.code, Message: verification.message };
      }

      // Kiểm tra trạng thái đơn hàng
      const order = verification.order!;
      if (order.status === OrderStatus.Paid) {
        return { RspCode: '02', Message: 'Order already processed' };
      }
      if (order.status !== OrderStatus.Pending) {
        return { RspCode: '03', Message: 'Order not in pending status' };
      }

      // Xử lý đơn hàng
      if (verification.code === '00') {
        const purchaserInfo = order.metadata?.purchaserInfo || {};
        await this.ordersService.confirmOrder(order.id, {
          purchaserName: purchaserInfo.name,
          purchaserEmail: purchaserInfo.email,
          purchaserPhone: purchaserInfo.phone,
        });
        this.logger.log(
          `[VNP IPN] Order ID ${order.id} marked as Paid via VNPAY IPN.`,
        );
        return { RspCode: '00', Message: 'Payment successful' };
      } else {
        await this.ordersService.cancelOrder(order.id);
        this.logger.log(
          `[VNP IPN] Order ID ${order.id} cancelled due to payment failure via VNPAY IPN.`,
        );
        return { RspCode: verification.code, Message: 'Payment failed' };
      }
    } catch (error) {
      this.logger.error('[VNP IPN] Error handling', error);
      return { RspCode: '99', Message: 'Internal Server Error' };
    }
  }

  // 3. Xử lý trả về từ VNPAY, tương tự IPN nhưng không update DB
  async handleVnpayReturn(query: Record<string, string>) {
    const verify = await this.verifyVnpayData(query);

    const orderId = verify.order
      ? verify.order.id
      : query['vnp_TxnRef']?.split('-')[0];

    if (!verify.isValid) {
      return {
        success: false,
        message: verify.message,
        orderId,
        code: verify.code,
      };
    }

    if (verify.code === '00') {
      return {
        success: true,
        message: 'Success',
        orderId,
        code: '00',
      };
    } else {
      return {
        success: false,
        message: 'Payment Failed',
        orderId,
        code: verify.code,
      };
    }
  }

  // Định dạng ngày theo chuẩn YYYYMMDDHHmmss
  private formatDate(date: Date) {
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    const yyyy = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const HH = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    return `${yyyy}${MM}${dd}${HH}${mm}${ss}`;
  }

  // Sắp xếp các khóa của object theo thứ tự bảng chữ cái
  private sortObject(obj: Record<string, any>) {
    const sorted: Record<string, any> = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
      sorted[key] = obj[key];
    });

    for (const key in sorted) {
      if (typeof sorted[key] === 'string') {
        sorted[key] = encodeURIComponent(sorted[key]).replace(/%20/g, '+');
      }
    }
    return sorted;
  }
}
