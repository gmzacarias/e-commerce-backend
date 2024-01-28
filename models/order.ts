import { firestore } from "../lib/firestore"

interface OrderData {
    userId: string,
    productId: string,
    status: string,
    additionalInfo: string,
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

    static async createNewOrder(newOrderData = {}){
        const newOrderSnap = await collection.add(newOrderData)
        const newOrder = new Order(newOrderSnap.id)
        newOrder.data = newOrderData as OrderData
        return newOrder
    }
}