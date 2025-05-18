import { firestore } from "lib/firestore"
import { Order } from "models/order"

export class OrderRepository {
    private orderCollection = firestore.collection("orders")

    async createOrder(data: OrderData) {
        try {
            const snap = await this.orderCollection.add(data)
            return new Order(snap.id, data)
        } catch (error) {
            console.error("no se pudo crear una nueva orden")
            throw error
        }
    }

    async getOrders(userId: string): Promise<OrderData[]> {
        try {
            const snap = await this.orderCollection.where("userId", "==", userId).get()
            if (snap.empty) {
                return []
            }
            const doc = snap.docs
            const orders = doc.map(item => {
                return new Order(item.id, item.data() as OrderData).data
            })
            return orders
        } catch (error) {
            console.error("no se pudo obtener las ordenes:", error.message)
            throw error
        }
    }

    async getOrderDoc(userId: string, orderId: string) {
        try {
            const doc = await this.orderCollection.doc(orderId).get()
            if (!doc.exists) {
                throw new Error("no existe un documento asociado a esta orden")
            }
            const data = doc.data() as OrderData
            if (data.userId !== userId) {
                throw new Error("el usuario no tiene acceso a esta orden")
            }
            return new Order(doc.id, data)
        } catch (error) {
            console.error("no se pudo obtener la orden:", error.message)
            throw error
        }
    }

    async save(data: Order): Promise<boolean> {
        try {
            const order = await this.getOrderDoc(data.data.userId, data.data.orderId)
            await this.orderCollection.doc(order.id).update(order.data as Record<string, any>)
            return true
        } catch (error) {
            console.error("no se pudo actualizar el documento:", error.message)
            throw error
        }
    }

    async delete(data: Order): Promise<boolean> {
        try {
            const order = await this.getOrderDoc(data.data.userId, data.data.orderId)
            await this.orderCollection.doc(order.id).delete()
            return true
        } catch (error) {
            console.error("no se pudo eliminar el documento:", error.message)
            throw error
        }
    }
}