import { UnauthorizedException } from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import { AuthMiddleware } from './auth.middleware';

describe('AuthMiddleware', () => {
  const originalFetch = global.fetch;
  const mockResponse = {} as ExpressResponse;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env.OAUTH_SERVICE_URL = 'http://oauth';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.OAUTH_SERVICE_URL;
  });

  it('rejects the request when the Authorization header is missing', async () => {
    const middleware = new AuthMiddleware();
    const request = { headers: {} };
    const next = jest.fn();

    await expect(
      middleware.use(request as any, mockResponse, next),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(next).not.toHaveBeenCalled();
  });

  it('rejects the request when token validation fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      headers: { get: () => 'application/json' },
      json: jest.fn(),
    } as unknown as globalThis.Response);

    const middleware = new AuthMiddleware();
    const request = { headers: { authorization: 'Bearer invalid' } };
    const next = jest.fn();

    await expect(
      middleware.use(request as any, mockResponse, next),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(global.fetch).toHaveBeenCalledWith('http://oauth/validate', {
      method: 'POST',
      headers: { Authorization: 'Bearer invalid' },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches the introspection payload when validation succeeds', async () => {
    const payload = { sub: 'user-id', active: true };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: jest.fn().mockResolvedValue(payload),
    } as unknown as globalThis.Response);

    const middleware = new AuthMiddleware();
    const request = { headers: { authorization: 'Bearer valid' } };
    const next = jest.fn();

    await expect(
      middleware.use(request as any, mockResponse, next),
    ).resolves.toBeUndefined();

    expect(request.user).toEqual(payload);
    expect(next).toHaveBeenCalled();
  });
});
