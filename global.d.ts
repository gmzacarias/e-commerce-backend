declare global {

    interface AuthData {
        email: string,
        userId: string,
        code: number,
        expire: FirestoreTimestamp | Date,
    }

    interface UserData {
        email: string,
        userName: string,
        phoneNumber: string,
        address: AddressData,
        cart: ProductData[],
    }

    interface AddressData {
        street: string
        locality: string
        city: string
        state: string
        postalCode: number
        country: string
    }

    interface OrderData {
        userId: string,
        products: ProductsOrder[],
        status: string,
        totalPrice: number,
        additionalInfo: string,
        url: string,
        orderId: string,
        created: Date |FirestoreTimestamp,
        payment: PaymentData | null,
        expire: Boolean,
    }

    interface ProductData {
        objectID: string,
        productId: string,
        system: string,
        version: number,
        brand: string
        familyModel: string,
        model: string,
        colour: string,
        rearCamera: string,
        frontCamera: string,
        ram: strimg,
        storage: string,
        price: number,
        totalPrice: number,
        quantity: number,
        stock: number,
        photo: string,
    }

    interface AirtableData {
        productId: string,
        system: string,
        version: number,
        brand: string
        familyModel: string,
        model: string,
        colour: string,
        rearCamera: string,
        frontCamera: string,
        ram: strimg,
        storage: string,
        price: number,
        totalPrice: number,
        quantity: number,
        stock: number,
        photo: string,
    }

    interface AlgoliaData extends AirtableData {
        objectID: string,
    }

    interface ProductsOrder {
        productId: string,
        brand: string,
        familyModel: string,
        model: string,
        colour: string,
        photo: string,
        quantity: number
        price: number
    }

    interface ItemsData {
        id: string,
        title: string,
        description: string,
        picture_url: string,
        category_id: string,
        quantity: number,
        currency_id: string,
        unit_price: number
    }

    interface PaymentData {
        paymentId: number,
        paymentCreated: string,
        currencyId: string,
        status: string,
        statusDetail: string,
        installments: number,
        paymentMethodId: string,
        paymentTypeId: string,
        transactionAmount: number,
        transactionInstallmentAmout: number,
        transactionTotalAmount: number,
        fourDigitsCard: string
    }

    interface UrlData {
        notificationUrl: string,
        successUrl: string,
        pendingUrl: string,
        failureUrl: string
    }

    interface QueryData {
        q: string,
        offset: string,
        limit: string,
        sort: string,
        brand: string | string[],
        familyModel: string | string[],
        model: string | string[],
        colour: string | string[],
        rearCamera: string | string[],
        frontCamera: string | string[],
        system: string | string[],
        priceMin: number,
        priceMax: number
    }

    interface FirestoreTimestamp {
        _nanoseconds: number,
        _seconds: number
    }

    type codeProps = {
        code: number
    }

    type paymentProps = {
        userName: string,
        order: OrderData
    }

    type saleProps = {
        user: UserData,
        order: OrderData,
       
    }
}

export { }