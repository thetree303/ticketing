import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizerBankDto } from './create-organizer-bank.dto';

export class UpdateOrganizerBankDto extends PartialType(
  CreateOrganizerBankDto,
) {}
