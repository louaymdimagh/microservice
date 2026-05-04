import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc, ClientKafka } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { lastValueFrom } from 'rxjs';
import { Order } from './order.entity.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

interface StockService {
  CheckAndReserve(data: { productId: number; quantity: number }): { available: boolean; message: string };
}

@Injectable()
export class OrdersService implements OnModuleInit {
  private stockService: StockService;

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @Inject('STOCK_PACKAGE')
    private stockClient: ClientGrpc,
    @Inject('KAFKA_SERVICE')
    private kafkaClient: ClientKafka,
  ) {}

  onModuleInit() {
    this.stockService = this.stockClient.getService<StockService>('StockService');
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    // Appeler le stock-service
    const stockResponse = await lastValueFrom(this.stockService.CheckAndReserve({
      productId: dto.productId,
      quantity: dto.quantity,
    }) as any) as { available: boolean; message: string };

    console.log('Stock response:', stockResponse);

    if (!stockResponse.available) {
      throw new Error(`Stock insuffisant: ${stockResponse.message}`);
    }

    // Créer la commande
    const order = this.ordersRepository.create({
      ...dto,
      status: 'confirmed',
    });
    const savedOrder = await this.ordersRepository.save(order);

    // Publier sur Kafka
    this.kafkaClient.emit('order.created', {
      orderId: savedOrder.id,
      productId: savedOrder.productId,
      quantity: savedOrder.quantity,
      customerEmail: savedOrder.customerEmail,
    });

    return savedOrder;
  }

  findAll(): Promise<Order[]> {
    return this.ordersRepository.find();
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOneBy({ id });
    if (!order) throw new Error(`Order #${id} not found`);
    return order;
  }
}
