export class Order {
    constructor(public id: string, public data: OrderData) {
        this.id = id
    }

    setOrderId(orderId: string) {
        this.data.orderId = orderId
    }

    setUrl(url: string) {
        this.data.url = url
    }

    setPayment(data: PaymentData) {
        this.data.payment = data
    }

    updateStatus(status: string) {
        this.data.status = "closed"
    }
}