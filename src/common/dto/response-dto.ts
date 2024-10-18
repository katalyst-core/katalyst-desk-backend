export class ResponseDTO {
  constructor(partial: Partial<unknown>) {
    Object.assign(this, partial);
  }
}
