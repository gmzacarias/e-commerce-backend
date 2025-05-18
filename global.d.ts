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
        phoneNumber: number,
        address: AddressData,
        cart: ProductData[],
    }

    interface AddressData {
        street: string
        locality: string
        city: string
        state: string
        postalCode: string
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
        created: string,
        payment: PaymentData,
        expire: Boolean,
    }

    interface ProductData {
        objectID: string,
        model: string,
        colour: string,
        photo: string,
        storage: string,
        frontCamera: string,
        brand: string,
        price: number,
        id: string,
        android: string,
        camera: string,
        ram: string,
        quantity: number
        totalPrice: number
    }

    interface AirtableData {
        android: string;
        brand: string;
        camera: string;
        colour: string;
        frontCamera: string;
        id: string;
        model: string;
        photo: string;
        price: number;
        ram: string;
        storage: string;
    }

    interface AlgoliaData extends AirtableData {
        objectID: string,
        quantity: string,
        totalPrice: number
    }

    interface ProductsOrder {
        productId: string,
        brand: string,
        model: string,
        colour: string,
        photo: string,
        quantity: number
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

    interface FirestoreTimestamp {
        _nanoseconds: number,
        _seconds: number
    }
}

export { }