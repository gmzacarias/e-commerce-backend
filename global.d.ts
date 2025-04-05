declare global {

    interface AuthData {
        email: string,
        userId: string,
        code: number,
        expire: FirestoreTimestamp | Date,
    }

    interface UserData {
        email?: string,
        userName?: string,
        phoneNumber?: number,
        address?: string,
        cart?: ProductData[],
    }

    interface OrderData {
        userId: string,
        products: ProductsCart[],
        status: string,
        totalPrice: number,
        additionalInfo: string,
        url: string,
        id: string,
        created: string,
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

    interface ProductsCart {
        productId: string,
        brand: string,
        model: string,
        colour: string,
        photo: string,
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

    interface FirestoreTimestamp {
        _nanoseconds: number,
        _seconds: number
    }
}

export { }