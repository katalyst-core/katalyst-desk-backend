import { Transform } from 'class-transformer';
import { IsUUID } from 'class-validator';

import { UtilService } from '@util/util.service';

export const ShortenUUID = () =>
  Transform(({ value }) => {
    if (!value || !IsUUID(value)) {
      return value;
    }

    return UtilService.shortenUUID(value);
  });

export const RestoreUUID = () =>
  Transform(({ value }) => {
    return UtilService.restoreUUID(value);
  });
