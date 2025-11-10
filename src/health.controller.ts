import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { PrismaService } from './prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private prisma: PrismaService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return this.getStatus(key, true);
    } catch (error) {
      return this.getStatus(key, false, { message: error.message });
    }
  }
}

@Controller()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
  ) {}

  @Get('health')
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealth.isHealthy('postgresql'),
    ]).then(result => {
      // Padronizar formato de resposta para compatibilidade com Actuator
      const standardized = {
        status: result.status === 'ok' ? 'UP' : 'DOWN',
        components: {} as Record<string, any>
      };
      
      // Converter info para components
      if (result.info && typeof result.info === 'object') {
        Object.keys(result.info).forEach(key => {
          const infoValue = result.info![key];
          if (infoValue && typeof infoValue === 'object' && 'status' in infoValue) {
            standardized.components[key] = {
              status: infoValue.status === 'up' ? 'UP' : 'DOWN'
            };
          }
        });
      }
      
      // Converter error para components com status DOWN
      if (result.error && typeof result.error === 'object') {
        Object.keys(result.error).forEach(key => {
          standardized.components[key] = {
            status: 'DOWN',
            details: result.error![key]
          };
        });
      }
      
      return standardized;
    });
  }
}

