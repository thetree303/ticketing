import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isPhoneNumberVN', async: false })
export class IsPhoneNumberVNConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (typeof value !== 'string') return false;
    const regex = /^(0|84|\+84)(3|5|7|8|9)([0-9]{8})$/;
    return regex.test(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} không phải là số điện thoại Việt Nam hợp lệ`;
  }
}

export function IsPhoneNumberVN(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPhoneNumberVNConstraint,
    });
  };
}
