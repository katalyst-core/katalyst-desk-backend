import { Transform } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { UtilService } from 'src/util/util.service';

export function ShortenUUID() {
  return Transform(({ value }) => {
    if (!value || !IsUUID(value)) {
      return value;
    }

    return UtilService.shortenUUID(value);
  });
}

export function RestoreUUID() {
  return Transform(({ value }) => {
    return UtilService.restoreUUID(value);
  });
}
