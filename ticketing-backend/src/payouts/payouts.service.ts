import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payout } from './entities/payout.entity';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { UpdatePayoutDto } from './dto/update-payout.dto';

@Injectable()
export class PayoutsService {
  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
  ) {}

  async create(createPayoutDto: CreatePayoutDto): Promise<Payout> {
    const payout = this.payoutRepository.create(createPayoutDto);
    return this.payoutRepository.save(payout);
  }

  async findAll(): Promise<Payout[]> {
    return this.payoutRepository.find({
      relations: ['organizer', 'event'],
    });
  }

  async findOne(id: number): Promise<Payout> {
    const payout = await this.payoutRepository.findOne({
      where: { id },
      relations: ['organizer', 'event'],
    });
    if (!payout) {
      throw new NotFoundException(`Payout with ID ${id} not found`);
    }
    return payout;
  }

  async update(id: number, updatePayoutDto: UpdatePayoutDto): Promise<Payout> {
    const payout = await this.findOne(id);
    Object.assign(payout, updatePayoutDto);
    return this.payoutRepository.save(payout);
  }

  async remove(id: number): Promise<void> {
    const payout = await this.findOne(id);
    await this.payoutRepository.remove(payout);
  }
}
