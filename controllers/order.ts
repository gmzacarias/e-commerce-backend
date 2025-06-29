import { OrderService } from "services/order"
import { OrderRepository } from "repositories/orderRepository"
import { UserRepository } from "repositories/userRepository"
import { Order } from "models/order"

const orderRepo = new OrderRepository()
const userRepo = new UserRepository()
const orderService = new OrderService(orderRepo, userRepo)

export async function getAllOrders(userId: string): Promise<OrderData[]> {
    return await orderService.getMyOrders(userId)
}

export async function getOrderDataById(userId: string, orderId: string): Promise<OrderData> {
    return await orderService.getOrdersById(userId, orderId)
}

export async function createOrder(userId: string, additionalInfo: string,): Promise<{ url: string }> {
    return await orderService.createPreference(userId,additionalInfo)
}

export async function deleteOrder(userId: string, orderId: string): Promise<boolean> {
    return await orderService.deleteOrderById(userId, orderId)
}

export async function updateStatusOrder(userId: string, topic: string, id: string): Promise<Order> {
    return await orderService.UpdateOrder(userId, topic, id)
}

export async function setPaymentOrder(userId: string, id: string): Promise<OrderData> {
    return await orderService.setPayment(userId, id)
}

