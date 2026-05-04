import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  sendNotification(data: any) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Email notification sent to ${data.customerEmail} for order ${data.orderId}`);
    console.log(`Product: ${data.productId}, Quantity: ${data.quantity}`);
  }
}