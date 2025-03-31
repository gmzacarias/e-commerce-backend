declare global {
    
    interface AuthData {
        email: string,
        userId: string,
        code: number,
        expire: Date,
    }
    
}

export { }