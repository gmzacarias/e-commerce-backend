import { firestore } from "lib/firestore"
import { Order } from "models/order"

export class OrderRepository {
    private authCollection = firestore.collection("order")
}