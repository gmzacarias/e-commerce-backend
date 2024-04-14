import { firestore } from "../lib/firestore"

interface OrderData {
    userId: string,
    products: [string],
    status: string,
    totalPrice: number,
    additionalInfo: string,
    url: string,
    id:string
}

const collection = firestore.collection("orders")
export class Order {
    ref: FirebaseFirestore.DocumentReference
    data: OrderData
    id: string
    constructor(id) {
        this.id = id
        this.ref = collection.doc(id)
    }

    async pull() {
        const snap = await this.ref.get()
        this.data = snap.data() as OrderData
    }

    async push() {
        this.ref.update(this.data as Record<string, any>)
    }

    static async createNewOrder(newOrderData = {}) {
        const newOrderSnap = await collection.add(newOrderData)
        const newOrder = new Order(newOrderSnap.id)
        newOrder.data = newOrderData as OrderData
        return newOrder
    }

    static async getOrders(userId: string): Promise<Array<Order>> {
        try {
            console.log(userId)
            const ordersSnap = await collection.where('userId', '==', userId).get();
            if (ordersSnap.empty) {
                throw new Error("No existen órdenes para este usuario");
            }
            const ordersData = ordersSnap.docs.map(doc => {
                const order = new Order(doc.id) as any
                order.data = doc.data() as OrderData
                return order.data
            })
            // console.log("list", ordersData)
            return ordersData;
        } catch (error) {
            console.error("Error al obtener orderes del usuario: ", error.message);
            return []
        }
    }

    static async getOrderById(orderId: string): Promise<Order> {
        try {
            console.log(orderId)
            const order = await collection.doc(orderId).get()
            if (order.exists) {
                const orderFound = new Order(order.id) as any
                orderFound.data = order.data() as OrderData
                return orderFound.data
            } else {
                throw new Error("No existen órdenes para este usuario");
            }
        } catch (error) {
            console.error("Error al obtener orderes del usuario: ", error.message);
            return null
        }
    }

    static async setOrderIdAndUrl(orderId: string, url: string): Promise<Order> {
        try {
            console.log(orderId)
            const order = await collection.doc(orderId).get()
            if (order.exists) {
                const orderFound = new Order(order.id)
                orderFound.data = order.data() as OrderData
                console.log("mercadopago", url)
                orderFound.data.url = url
                orderFound.data.id = orderId
                await orderFound.push()
                // console.log("url guardada", url)
                return orderFound
            }

        } catch (error) {

        }
    }

}