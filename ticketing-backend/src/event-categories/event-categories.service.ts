import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventCategory } from './entities/event-category.entity';

@Injectable()
export class EventCategoriesService {
  constructor(
    @InjectRepository(EventCategory)
    private readonly eventCategoryRepository: Repository<EventCategory>,
  ) {}

  findAll() {
    return this.eventCategoryRepository.find();
  }

  findOne(id: number) {
    return this.eventCategoryRepository.findOne({ where: { id } });
  }

  async create(data: Partial<EventCategory>) {
    const category = this.eventCategoryRepository.create(data);
    return this.eventCategoryRepository.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    if (!category) throw new Error('Category not found');
    await this.eventCategoryRepository.remove(category);
    return { deleted: true };
  }
}
