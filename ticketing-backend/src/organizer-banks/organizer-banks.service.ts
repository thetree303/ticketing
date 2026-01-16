import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizerBank } from './entities/organizer-bank.entity';
import { CreateOrganizerBankDto } from './dto/create-organizer-bank.dto';
import { UpdateOrganizerBankDto } from './dto/update-organizer-bank.dto';

@Injectable()
export class OrganizerBanksService {
  constructor(
    @InjectRepository(OrganizerBank)
    private readonly organizerBankRepository: Repository<OrganizerBank>,
  ) {}

  async create(
    createOrganizerBankDto: CreateOrganizerBankDto,
  ): Promise<OrganizerBank> {
    const organizerBank = this.organizerBankRepository.create(
      createOrganizerBankDto,
    );
    return this.organizerBankRepository.save(organizerBank);
  }

  async findAll(): Promise<OrganizerBank[]> {
    return this.organizerBankRepository.find({
      relations: ['organizer'],
    });
  }

  async findByOrganizer(organizerId: number): Promise<OrganizerBank[]> {
    return this.organizerBankRepository.find({
      where: { organizerId },
    });
  }

  async findOne(id: number): Promise<OrganizerBank> {
    const organizerBank = await this.organizerBankRepository.findOne({
      where: { id },
      relations: ['organizer'],
    });
    if (!organizerBank) {
      throw new NotFoundException(`OrganizerBank with ID ${id} not found`);
    }
    return organizerBank;
  }

  async update(
    id: number,
    updateOrganizerBankDto: UpdateOrganizerBankDto,
  ): Promise<OrganizerBank> {
    const organizerBank = await this.findOne(id);
    Object.assign(organizerBank, updateOrganizerBankDto);
    return this.organizerBankRepository.save(organizerBank);
  }

  async remove(id: number): Promise<void> {
    const organizerBank = await this.findOne(id);
    await this.organizerBankRepository.remove(organizerBank);
  }
}
