import { Injectable } from '@nestjs/common';

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

  checkAndReserve(data: StockRequest): StockResponse {
    // int64 from gRPC may arrive as Long object or string — coerce to number
    const pid = Number(data.productId);
    const qty = Number(data.quantity);
    const currentStock = this.stock.get(pid) ?? 0;

    console.log(`CheckAndReserve: productId=${pid}, quantity=${qty}, currentStock=${currentStock}`);

    if (currentStock >= qty) {
      this.stock.set(pid, currentStock - qty);
      return { available: true, message: 'Stock reserved successfully' };
    } else {
      return { available: false, message: `Insufficient stock. Available: ${currentStock}` };
    }
  }
}
