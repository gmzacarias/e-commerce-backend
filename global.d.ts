declare global {

    interface AuthData {
        email: string,
        userId: string,
        code: number,
        expire: Date,
    }

    interface UserData {
        email?: string,
        userName?: string,
        phoneNumber?: number,
        address?: string,
        cart?: Array<any> | Array<ProductData>,
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
}

export { }