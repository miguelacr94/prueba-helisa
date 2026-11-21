import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Sistema')
@Controller('health')
export class HealthGatewayController {
  @Get()
  @ApiOperation({ summary: 'Verificar estado del API Gateway' })
  @ApiResponse({ status: 200, description: 'Servicio en ejecución.' })
  check() {
    return {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}

