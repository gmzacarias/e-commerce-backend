import { format } from "date-fns"
import { es } from "date-fns/locale"

export function getDate() {
    const currentDate = new Date()
    const formatDate = format(currentDate, "dd 'de' MMMM 'de' yyyy", { locale: es })
    return formatDate
}


