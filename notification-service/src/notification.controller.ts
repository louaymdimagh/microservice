import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NotificationService } from './notification.service.js';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern('order.created')
  handleOrderCreated(@Payload() data: any) {
    this.notificationService.sendNotification(data);
  }
}