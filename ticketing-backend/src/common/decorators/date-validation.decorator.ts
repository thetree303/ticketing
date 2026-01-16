import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsBefore(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (obj: object, propertyName: string) {
    registerDecorator({
      name: 'isBefore',
      target: obj.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          return typeof value === 'string' && typeof relatedValue === 'string'
            ? new Date(value) < new Date(relatedValue)
            : true; // Bỏ qua nếu giá trị null/undefined
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be before ${args.constraints[0]}`;
        },
      },
    });
  };
}
