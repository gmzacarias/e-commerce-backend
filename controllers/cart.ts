import { CartService } from "services/cart"
import { UserRepository } from "repositories/userRepository"

const userRepo = new UserRepository()
const cartService = new CartService(userRepo)

export async function getMyCart(userId: string): Promise<ProductData[]> {
    return await cartService.getCartData(userId)
}

export async function addProductById(userId: string, productId: string, quantity: number): Promise<boolean> {
    return await cartService.addProduct(userId, productId, quantity)
}

export async function DeleteProductById(userId: string, productId: string): Promise<boolean> {
    return await cartService.deleteProduct(userId, productId)
}

export async function resetCart(userId: string): Promise<Array<any>> {
    return await cartService.reset(userId)
}