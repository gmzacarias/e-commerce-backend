import { firestore } from "lib/firestore"

const collection = firestore.collection("orders")

export class Order {
    ref: FirebaseFirestore.DocumentReference
    data: OrderData
    id: string
    constructor(id: string) {
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

    static async getOrderDoc(orderId: string): Promise<{ id: string; data: OrderData }> {
        try {
            const orderDoc = await collection.doc(orderId).get()
            if (!orderDoc.exists) {
                throw new Error("no existe un documento relacionado a este usuario")
            }
            return {
                id: orderDoc.id,
                data: orderDoc.data() as OrderData
            }
        } catch (error) {
            console.error(`No se pudo obtener el documento: ${error.message}`);
            throw error
        }
    }

    static async createNewOrder(data: OrderData): Promise<Order> {
        try {
            const newOrderSnap = await collection.add(data)
            const newOrder = new Order(newOrderSnap.id)
            newOrder.data = data
            return newOrder
        } catch (error) {
            console.error(`No se pudo crear la orden: ${error.message}`);
            throw error
        }
    }

    static async getOrders(userId: string): Promise<Array<OrderData>> {
        try {
            const ordersSnap = await collection.where('userId', '==', userId).get();
            if (ordersSnap.empty) {
                throw new Error("No existen órdenes para este usuario");
            }
            const ordersData = ordersSnap.docs.map(doc => {
                const order = new Order(doc.id)
                order.data = doc.data() as OrderData
                return order.data
            })
            return ordersData
        } catch (error) {
            console.error("Error al obtener orderes del usuario:", error.message);
            throw error
        }
    }

    static async getOrderById(userId: string, orderId: string): Promise<OrderData> {
        try {
            const checkUserId = await collection.where('userId', '==', userId).get();
            if (checkUserId.empty) {
                throw new Error("No existen órdenes para este usuario");
            }
            const { id, data } = await this.getOrderDoc(orderId)
            const orderFound = new Order(id)
            orderFound.data = data
            return orderFound.data
        } catch (error) {
            console.error("Error al obtener orderes del usuario:", error.message)
            throw error
        }
    }

    static async setOrderIdAndUrl(userId: string, orderId: string, url: string): Promise<Order> {
        try {
            const checkUserId = await collection.where('userId', '==', userId).get();
            if (checkUserId.empty) {
                throw new Error("No existen órdenes para este usuario");
            }
            const { id, data } = await this.getOrderDoc(orderId)
            const orderFound = new Order(id)
            orderFound.data = data
            orderFound.data.url = url
            orderFound.data.id = orderId
            await orderFound.push()
            return orderFound
        } catch (error) {
            console.error("Error al guardar los datos en las ordenes del usuario:", error.message)
            throw error
        }
    }

    static async updateStatusOrder(userId: string, orderId: string): Promise<Order> {
        try {
            const checkUserId = await collection.where('userId', '==', userId).get();
            if (checkUserId.empty) {
                throw new Error("No existen órdenes para este usuario");
            }
            const myOrder = new Order(orderId)
            await myOrder.pull()
            if (!myOrder.data) {
                throw new Error(`no se encontró la orden:${orderId}`);
            }

            if (!myOrder.data.userId) {
                throw new Error(`la orden ${orderId} no contiene userId`)
            }

            if (myOrder.data.status === "closed") {
                return myOrder
            }
            myOrder.data.status = "closed"
            await myOrder.push()
            return myOrder
        } catch (error) {
            console.error(`no se pudo actualizar el status de la orden:${orderId}`, error.message)
            throw error
        }
    }

    static async deleteOrder(userId:string,orderId: string):Promise<boolean> {
        try {
            const {data}= await this.getOrderDoc(orderId)
            if (data.userId !== userId){
                throw new Error(`no tenes los permisos para eliminar esta orden`)
            }
            const checkOrderId = await collection.where('id', '==', orderId).get();
            if (checkOrderId.empty) {
                throw new Error(`no existe esta orderId:${orderId}`)
            }
            await collection.doc(data.id).delete();
            return true
        } catch (error) {
            console.error(`no se pudo eliminar la orden:${orderId}`, error.message)
            throw error
        }
    }

}