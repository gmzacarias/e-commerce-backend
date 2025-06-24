export function saleMail({ userId, order, price }: saleProps) {
    return (
        <div>
            <h1>Recibiste una aprobacion de compra</h1>
            <p>codigo de orden:{order}</p>
            <p>userId:{userId}</p>
            <p>Precio:${price}</p>
        </div>
    )
}