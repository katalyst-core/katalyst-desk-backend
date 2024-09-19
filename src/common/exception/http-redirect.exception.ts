export class HttpRedirect {
  private url: any;

  constructor(url: string) {
    this.url = url;
  }

  getUrl() {
    return this.url;
  }
}
