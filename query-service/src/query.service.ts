import { Injectable } from '@nestjs/common';

@Injectable()
export class QueryService {
  async getProducts() {
    try {
      const response = await fetch('http://localhost:3000/products');
      return response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async getOrders() {
    try {
      const response = await fetch('http://localhost:3002/orders');
      return response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  async getOrderById(id: number) {
    try {
      const response = await fetch(`http://localhost:3002/orders/${id}`);
      if (!response.ok) return null;
      return response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }
}