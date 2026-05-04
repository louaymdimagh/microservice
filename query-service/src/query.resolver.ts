import { Args, Query, Resolver, ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { QueryService } from './query.service.js';

@ObjectType()
export class Product {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field()
  price: number;

  @Field()
  stock: number;
}

@ObjectType()
export class Order {
  @Field(() => ID)
  id: number;

  @Field(() => ID)
  productId: number;

  @Field()
  quantity: number;

  @Field()
  status: string;

  @Field()
  customerEmail: string;
}

@Resolver()
export class QueryResolver {
  constructor(private queryService: QueryService) {}

  @Query(() => [Product])
  async products() {
    return this.queryService.getProducts();
  }

  @Query(() => [Order])
  async orders() {
    return this.queryService.getOrders();
  }

  @Query(() => Order, { nullable: true })
  async orderById(@Args('id', { type: () => Int }) id: number) {
    return this.queryService.getOrderById(id);
  }
}