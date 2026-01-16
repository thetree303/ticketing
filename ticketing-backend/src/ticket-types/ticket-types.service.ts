import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TicketType } from './entities/ticket-type.entity';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';

@Injectable()
export class TicketTypesService {
  constructor(
    @InjectRepository(TicketType)
    private readonly ticketTypeRepository: Repository<TicketType>,
  ) {}

  async create(createTicketTypeDto: CreateTicketTypeDto): Promise<TicketType> {
    const ticketType = this.ticketTypeRepository.create(createTicketTypeDto);
    return this.ticketTypeRepository.save(ticketType);
  }

  async findAll(): Promise<TicketType[]> {
    return this.ticketTypeRepository.find({
      relations: ['event'],
    });
  }

  async findOne(id: number): Promise<TicketType> {
    const ticketType = await this.ticketTypeRepository.findOne({
      where: { id },
      relations: ['event'],
    });
    if (!ticketType) {
      throw new NotFoundException(`Loại vé với ID ${id} không tồn tại`);
    }
    return ticketType;
  }

  async update(
    id: number,
    updateTicketTypeDto: UpdateTicketTypeDto,
  ): Promise<TicketType> {
    const ticketType = await this.findOne(id);
    if (!ticketType) {
      throw new NotFoundException(`Loại vé với ID ${id} không tồn tại`);
    }
    if (
      updateTicketTypeDto.initialQuantity &&
      updateTicketTypeDto.initialQuantity < ticketType.soldQuantity
    ) {
      throw new BadRequestException(
        'Không thể cập nhật tổng số lượng vé nhỏ hơn số lượng đã bán hiện tại',
      );
    }
    Object.assign(ticketType, updateTicketTypeDto);
    return this.ticketTypeRepository.save(ticketType);
  }

  async remove(id: number): Promise<void> {
    const ticketType = await this.findOne(id);
    await this.ticketTypeRepository.remove(ticketType);
  }
}
