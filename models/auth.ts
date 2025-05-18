export class Auth {
    constructor(public id: string, public data: AuthData) {
        this.id = id
    }

    updateEmail(email: string) {
        this.data.email = email
    }

    updateCode(code: number) {
        this.data.code = code
    }

    updateExpire(expire: Date) {
        this.data.expire = expire
    }
}



