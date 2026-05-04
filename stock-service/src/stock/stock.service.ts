import { Injectable } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

interface StockRequest {
  productId: number;
  quantity: number;
}

interface StockResponse {
  available: boolean;
  message: string;
}

@Injectable()
export class StockService {
  // Simple in-memory stock data
  private stock = new Map<number, number>([
    [1, 10], // productId 1 has 10 stock
    [2, 5],  // productId 2 has 5 stock
  ]);

  @GrpcMethod('StockService', 'CheckAndReserve')
  checkAndReserve(data: StockRequest): StockResponse {
    const { productId, quantity } = data;
    const currentStock = this.stock.get(productId) || 0;

    if (currentStock >= quantity) {
      this.stock.set(productId, currentStock - quantity);
      return { available: true, message: 'Stock reserved successfully' };
    } else {
      return { available: false, message: `Insufficient stock. Available: ${currentStock}` };
    }
  }
}
