import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import type { NextFunction, Request, Response as ExpressResponse } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly validateEndpoint: string;

  constructor() {
    this.validateEndpoint = this.resolveValidateEndpoint();
  }

  async use(req: Request, _res: ExpressResponse, next: NextFunction): Promise<void> {
    const authorizationHeader = req.headers.authorization;
    if (!this.hasBearerToken(authorizationHeader)) {
      throw new UnauthorizedException('Missing bearer token');
    }

    try {
      const oauthResponse = await fetch(this.validateEndpoint, {
        method: 'POST',
        headers: { Authorization: authorizationHeader as string },
      });

      if (!oauthResponse.ok) {
        throw new UnauthorizedException('Token validation failed');
      }

      await this.attachUserContextIfPresent(req, oauthResponse);
      next();
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Unable to validate token');
    }
  }

  private hasBearerToken(header?: string): header is string {
    if (!header) {
      return false;
    }

    const [scheme, token] = header.split(' ');
    return Boolean(token) && scheme.toLowerCase() === 'bearer';
  }

  private async attachUserContextIfPresent(
    req: Request,
    oauthResponse: globalThis.Response,
  ): Promise<void> {
    const contentType = oauthResponse.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      return;
    }

    try {
      const payload = await oauthResponse.json();
      (req as Request & { user?: unknown }).user = payload;
    } catch {
      // Ignore payload parsing failures; authorization already succeeded.
    }
  }

  private resolveValidateEndpoint(): string {
    const explicitEndpoint = process.env.OAUTH_VALIDATE_ENDPOINT;
    if (explicitEndpoint) {
      return explicitEndpoint;
    }

    const baseUrl =
      process.env.OAUTH_SERVICE_URL ?? this.buildInternalBaseUrl();
    const path = process.env.OAUTH_VALIDATE_PATH ?? '/api/v1/validate';

    const normalizedBase = baseUrl.endsWith('/')
      ? baseUrl.slice(0, -1)
      : baseUrl;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${normalizedBase}${normalizedPath}`;
  }

  private buildInternalBaseUrl(): string {
    const protocol = process.env.OAUTH_INTERNAL_PROTOCOL ?? 'http';
    const host = process.env.OAUTH_INTERNAL_HOST ?? 'oauth';
    const port = process.env.OAUTH_INTERNAL_API_PORT;

    const portSegment = port ? `:${port}` : '';
    return `${protocol}://${host}${portSegment}`;
  }
}
