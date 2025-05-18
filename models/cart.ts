export class Cart {
    constructor(public items: ProductData[] = []) { }

    private hasProduct(productId: string): boolean {
        return this.items.some(product => product.id === productId)
    }

    private validateQuantity(quantity: number) {
        if (quantity <= 0) {
            throw new Error("la cantidad debe ser mayor a cero")
        }
    }

    add(product: ProductData, quantity: number) {
        this.validateQuantity(quantity)
        const exists = this.hasProduct(product.id)
        if (!exists) {
            this.items.push({ ...product, quantity })
        } else {
            this.updateQuantity(product.id, quantity)
        }
    }

    updateQuantity(productId: string, quantity: number) {
        this.validateQuantity(quantity)
        const item = this.items.find(p => p.id === productId)
        if (!item) {
            throw new Error("producto no encontrado")
        }
        item.quantity += quantity
    }

    remove(productId: string) {
        const exists = this.hasProduct(productId)
        if (!exists) {
            throw new Error("el producto no existe")
        }
        this.items = this.items.filter(product => product.id !== productId)
    }

    clear() {
        this.items = []
    }
}