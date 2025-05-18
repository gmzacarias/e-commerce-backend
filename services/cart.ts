import { Cart } from "models/cart"
import { UserRepository } from "repositories/userRepository"
import { searchProductById } from "./algolia"

export class CartService {
    constructor(private repo: UserRepository) { }

    async getCartData(userId: string): Promise<ProductData[]> {
        try {
            const cartData = await this.repo.getCart(userId)
            return cartData
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }

    async addProduct(userId: string, productId: string, quantity: number): Promise<boolean> {
        try {
            const user = await this.repo.getUser(userId)
            const product = await searchProductById(productId)
            const cart = new Cart(user.data.cart)
            cart.add(product, quantity)
            user.updateCart(cart.items)
            await this.repo.save(user)
            return true
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }

    async deleteProduct(userId: string, productId: string): Promise<boolean> {
        try {
            const user = await this.repo.getUser(userId)
            const cart = new Cart(user.data.cart)
            cart.remove(productId)
            user.updateCart(cart.items)
            await this.repo.save(user)
            return true
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }

    async reset(userId: string): Promise<ProductData[]> {
        try {
            const user = await this.repo.getUser(userId)
            const cart = new Cart()
            cart.clear()
            user.updateCart(cart.items)
            await this.repo.save(user)
            return cart.items
        } catch (error) {
            console.error(error.message)
            throw error
        }
    }
}