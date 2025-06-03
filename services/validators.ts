import { authSchema, tokenSchema } from "lib/schemas/authSchema"
import { updateUserSchema } from "lib/schemas/userSchema"
import { partialCartSchema } from "lib/schemas/cartSchema"
import { orderSchema } from "lib/schemas/orderSchema"
import { partialSearchSchema } from "lib/schemas/searchSchema"
import { productSchema } from "lib/schemas/productSchema"

export function validateAuth(email: string): { email: string } {
    try {
        const result = authSchema.safeParse(email)
        if (!result.success) {
            const errorMessage = result.error.issues.map((issue) => issue.message).join(";")
            throw new Error(errorMessage)
        }
        return result.data
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

export function validateAuthToken(data: { email: string, code: number }): { email: string, code: number } {
    try {
        const result = tokenSchema.safeParse(data)
        if (!result.success) {
            const errorMessage = result.error.issues.map((issue) => issue.message).join(";")
            throw new Error(errorMessage)
        }
        return result.data
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

export function validateUserUpdate(data: UserData): {
    email?: string;
    userName?: string;
    phoneNumber?: string;
    address?: {
        street?: string;
        locality?: string;
        city?: string;
        state?: string;
        postalCode?: number;
        country?: string;
    }
} {
    try {
        const result = updateUserSchema.safeParse(data)
        if (!result.success) {
            const errorMessage = result.error.issues.map((issue) => issue.message).join(";")
            throw new Error(errorMessage)
        }
        return result.data
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

export function validateCartQuery(productId: string): string {
    try {
        const result = partialCartSchema.safeParse({ productId })
        if (!result.success) {
            const errorMessage = result.error.issues.map((issue) => issue.message).join(";")
            throw new Error(errorMessage)
        }
        return result.data.productId
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

export function validateCartBody(quantity: number): number {
    try {
        const result = partialCartSchema.safeParse({ quantity })
        if (!result.success) {
            const errorMessage = result.error.issues.map((issue) => issue.message).join(";")
            throw new Error(errorMessage)
        }
        return result.data.quantity
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

export function validateCreateOrder(additionalInfo: string): string {
    if (!additionalInfo || !additionalInfo.trim()) return null
    try {
        const result = orderSchema.safeParse({ additionalInfo })
        if (!result.success) {
            const errorMessage = result.error.issues.map((issue) => issue.message).join(";")
            throw new Error(errorMessage)
        }
        return result.data.additionalInfo
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

export function validateSearchByQuery(data: QueryData): Partial<QueryData> {
    try {
        const result = partialSearchSchema.safeParse(data)
        if (!result.success) {
            const errorMessage = result.error.issues.map((issue) => issue.message).join(";")
            throw new Error(errorMessage)
        }
        return result.data
    } catch (error) {
        console.error(error.message)
        throw error
    }
}

export function validateSearchProduct(productId: string): string {
    try {
        const result = productSchema.safeParse({ productId })
        if (!result.success) {
            const errorMessage = result.error.issues.map((issue) => issue.message).join(";")
            throw new Error(errorMessage)
        }
        return result.data.productId
    } catch (error) {
        console.error(error.message)
        throw error
    }
}