import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiConfigService {
  constructor(private readonly configService: ConfigService) {}

  get getAppFrontendURL(): string {
    return this.configService.get('APP_FRONTEND_URL', { infer: true });
  }

  get getDBString(): string {
    return this.configService.get('DB_STRING', { infer: true });
  }

  get getJWTAccessPrivateKey(): string {
    return this.configService.get('JWT_ACCESS_PRIVATE_KEY', { infer: true });
  }

  get getJWTRefreshPrivateKey(): string {
    return this.configService.get('JWT_REFRESH_PRIVATE_KEY', { infer: true });
  }

  get getJWTGatewayPrivateKey(): string {
    return this.configService.get('JWT_GATEWAY_PRIVATE_KEY', { infer: true });
  }

  get getJWTAccessExpiry(): number {
    return this.configService.get('JWT_ACCESS_EXPIRY', { infer: true });
  }

  get getJWTRefreshExpiry(): number {
    return this.configService.get('JWT_REFRESH_EXPIRY', { infer: true });
  }

  get getJWTGatewayExpiry(): number {
    return this.configService.get('JWT_GATEWAY_EXPIRY', { infer: true });
  }

  get getWhatsAppWebhookToken(): string {
    return this.configService.get('WHATSAPP_WEBHOOK_TOKEN', { infer: true });
  }

  get getInstagramWebhookToken(): string {
    return this.configService.get('INSTAGRAM_WEBHOOK_TOKEN', { infer: true });
  }

  get getInstagramAppId(): string {
    return this.configService.get('INSTAGRAM_APP_ID', { infer: true });
  }

  get getInstagramAppSecret(): string {
    return this.configService.get('INSTAGRAM_APP_SECRET', { infer: true });
  }

  get getInstagramAppRedirectUrl(): string {
    return this.configService.get('INSTAGRAM_APP_REDIRECT_URL', {
      infer: true,
    });
  }
}
