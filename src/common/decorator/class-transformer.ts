import { Transform } from 'class-transformer';
import { IsUUID } from 'class-validator';

import { restoreUUID, shortenUUID, transformDTO } from '@util/index';
import { ResponseDTO } from '@dto/response-dto';

export const ShortenUUID = () =>
  Transform(({ value }) => {
    if (!value || !IsUUID(value)) {
      return value;
    }

    return shortenUUID(value);
  });

export const RestoreUUID = () => Transform(({ value }) => restoreUUID(value));

export const TransformDTO = <T extends ResponseDTO = any>(dto: {
  new (...args: any[]): T;
}) => Transform(({ value }) => transformDTO(value, dto));
