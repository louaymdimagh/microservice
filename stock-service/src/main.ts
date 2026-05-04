import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.GRPC,
    options: {
      package: 'stock',
      protoPath: 'src/stock.proto',
      url: 'localhost:50051',
    },
  });
  await app.listen();
  console.log('Stock gRPC service running on localhost:50051');
}
bootstrap();
