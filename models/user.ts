export class User {
    constructor(public id: string, public data: UserData) {
        this.id = id
    }

    updateData(data: UserData) {
        this.data = data
    }

    updateEmail(email: string) {
        this.data.email = email
    }

    updateUserName(userName: string) {
        this.data.userName = userName
    }

    updateAddress(newAddress: Partial<AddressData>) {
        this.data.address = {
            ... this.data.address,
            ...newAddress
        }
    }

    updatePhoneNumber(phoneNumber: number) {
        this.data.phoneNumber = phoneNumber
    }

    updateCart(data: ProductData[]) {
        this.data.cart = data
    }
}



