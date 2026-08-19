import { BadRequestException, Injectable } from '@nestjs/common';
import { CartDto } from './dto/cart.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutDto, CheckoutItemDto } from './dto/checkout.dto';
import { DashboardDto } from './dto/dashboard.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async addToCart(userId: string, cartDto: CartDto[]): Promise<CartDto[]> {
    try {
      let cart = await this.prisma.cart.findFirst({
        where: {
          userId,
        },
      });

      // Create cart if it doesn't exist
      if (!cart) {
        cart = await this.prisma.cart.create({
          data: {
            id: crypto.randomUUID(),
            userId,
          },
        });
      }

      // IDs of products currently sent by frontend
      const productIds = cartDto.map((item) => item.productId);

      // Delete items that are no longer in the frontend cart
      await this.prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId: {
            notIn: productIds,
          },
        },
      });

      // Create/update the remaining items
      for (const item of cartDto) {
        await this.prisma.cartItem.upsert({
          where: {
            cartId_productId: {
              cartId: cart.id,
              productId: item.productId,
            },
          },

          create: {
            id: crypto.randomUUID(),
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity,
          },

          update: {
            quantity: item.quantity,
          },
        });
      }

      return cartDto;
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
  async getCart(): Promise<CartDto[]> {
    const cartItems = await this.prisma.cartItem.findMany({
      include: {
        product: true,
      },
    });

    return cartItems.map((cartItem) => {
      const price = Number(cartItem.product.price);

      return {
        id: cartItem.productId,
        productId: cartItem.productId,

        item: {
          id: cartItem.product.id,
          name: cartItem.product.name,
          description: cartItem.product.description ?? '',
          price,
          stock: cartItem.product.stock,
        },

        price,
        quantity: cartItem.quantity,
        total: price * cartItem.quantity,
      };
    });
  }
  async checkout(checkoutDto: CheckoutDto) {
    const { user_id, total, status, items } = checkoutDto;

    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: items.map((item) => item.productId),
        },
      },
    });

    const productById = new Map(
      products.map((product) => [product.id, product]),
    );

    const order = await this.prisma.order.create({
      data: {
        userId: user_id,
        total,
        status,
        items: {
          create: items.map((item: CheckoutItemDto) => {
            const product = productById.get(item.productId);

            if (!product) {
              throw new BadRequestException(
                `Product ${item.productId} was not found`,
              );
            }

            return {
              quantity: item.quantity,
              price: product.price,
              product: {
                connect: { id: item.productId },
              },
            };
          }),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return order;
  }

  async getOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    return {
      id: order.id,
      userId: order.userId,
      total: Number(order.total),
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.price),
        product: item.product
          ? {
              id: item.product.id,
              name: item.product.name,
              description: item.product.description ?? '',
              price: Number(item.product.price),
              stock: item.product.stock,
            }
          : null,
      })),
      payments: order.payments.map((payment) => ({
        id: payment.id,
        orderId: payment.orderId,
        amount: Number(payment.amount),
        method: payment.method,
        status: payment.status,
        createdAt: payment.createdAt,
      })),
    };
  }

  async getOrders(userId: string) {
    if (!userId) {
      return [];
    }

    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    return orders.map((order) => ({
      id: order.id,
      userId: order.userId,
      total: Number(order.total),
      status: order.status,
      createdAt: order.createdAt,
      items: order.items,
      payments: order.payments,
    }));
  }

  async getDashboard() {
    const orders = await this.prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((order) => ({
      id: order.id,
      user_id: order.userId,
      total: Number(order.total),
      status: order.status,
      created_at: order.createdAt,
      updated_at: order.updatedAt,
    }));
  }
}
