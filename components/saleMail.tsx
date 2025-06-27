import {
    Html,
    Head,
    Body,
    Container,
    Img,
    Link,
    Section,
    Text,
    Button,
    Row,
    Column,
} from "@react-email/components";

const main = {
    backgroundColor: "#FFF",
};

const container = {
    backgroundColor: "#F4F4F4",
    padding: "10px",
    width: "100%",
};

const imageSection = {
    borderBottom: "solid 1px #B7C7C8",
    padding: "10px 0",
    textAlign: "center" as const,
};

const orderDetailsSection = {
    padding: "10px",
};
const footerSection = {
    borderTop: "solid 1px #B7C7C8",
    paddingTop: "10px",
    height: 30,
    textAlign: "center" as const,
};

const text = {
    fontFamily: "sans-serif",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#0E0E0E",
    margin: 0,
    padding: 5,
    lineHeight: "none",
};

const descriptionText = {
    ...text,
    fontSize: "12px",
};

const linkText = {
    ...descriptionText,
    textDecoration: "none",
};

const buttonText = {
    ...text,
    backgroundColor: "#0E0E0E",
    borderRadius: 5,
    width: "50%",
    padding: 10,
    textAlign: "center" as const,
    fontSize: "12px",
    color: "#F4F4F4",
};

const orderSummarySection = {
    border: "solid 1px #B7C7C8",
};

const productContainer = {
    backgroundColor: "#F4F4F4",
    borderLeft: "solid 1px #B7C7C8",
    borderRight: "solid 1px #B7C7C8",
    borderBottom: "solid 1px #B7C7C8",
    textAlign: "left" as const,
};

const productItem = {
    borderBottom: "solid 1px #B7C7C8",
};

export function saleMail({ user, order }: saleProps) {
    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    <Section style={imageSection}>
                        <Img
                            src="https://res.cloudinary.com/dkwjm2ocu/ukudm8olr7crts5seziv.png"
                            width="178"
                            height="68"
                            alt="Smartshop logo"
                            style={{ display: "block", margin: "0 auto" }}
                        />
                    </Section>
                    <Section>
                        <Text style={text}>
                            📦 ¡Nueva venta realizada!
                            <br />
                            <br />
                            Se ha generado una nueva orden en tu tienda.
                            <br />
                        </Text>
                    </Section>
                    <Row style={{ border: "solid 1px #B7C7C8" }}>
                        <Column width={"20%"} style={{ textAlign: "center" }}>
                            <Text
                                style={{
                                    ...descriptionText,
                                    borderRight: "solid 1px #b7c7c8",
                                    borderBottom: "solid 1px #b7c7c8",
                                }}
                            >
                                UserID
                            </Text>
                            <Text
                                style={{
                                    ...descriptionText,
                                    borderRight: "solid 1px #b7c7c8",
                                    borderBottom: "solid 1px #b7c7c8",
                                }}
                            >
                                Usuario
                            </Text>
                            <Text
                                style={{
                                    ...descriptionText,
                                    borderRight: "solid 1px #b7c7c8",
                                    borderBottom: "solid 1px #b7c7c8",
                                }}
                            >
                                Email
                            </Text>
                            <Text
                                style={{
                                    ...descriptionText,
                                    borderRight: "solid 1px #b7c7c8",
                                    borderBottom: "solid 1px #b7c7c8",
                                }}
                            >
                                Orden
                            </Text>
                            <Text
                                style={{
                                    ...descriptionText,
                                    borderRight: "solid 1px #b7c7c8",
                                }}
                            >
                                Fecha
                            </Text>
                        </Column>
                        <Column width={"80%"} style={{ textAlign: "left" }}>
                            <Text
                                style={{
                                    ...descriptionText,
                                    borderBottom: "solid 1px #b7c7c8",
                                }}
                            >
                                {order.userId}
                            </Text>
                            <Text
                                style={{
                                    ...descriptionText,
                                    borderBottom: "solid 1px #b7c7c8",
                                }}
                            >
                                {user.userName}
                            </Text>
                            <Text
                                style={{
                                    ...descriptionText,
                                    borderBottom: "solid 1px #b7c7c8",
                                }}
                            >
                                {user.email}
                            </Text>
                            <Text
                                style={{
                                    ...descriptionText,
                                    borderBottom: "solid 1px #b7c7c8",
                                }}
                            >
                                {order.orderId}
                            </Text>
                            <Text
                                style={{
                                    ...descriptionText,
                                }}
                            >
                                {order.created as any}
                            </Text>
                        </Column>
                    </Row>

                    <Section>
                        <Text style={{ ...text, textAlign: "left" }}>
                            <br />
                            Resumen del pedido
                        </Text>
                        <Row style={orderSummarySection}>
                            <Column
                                width={"60%"}
                                style={{ borderRight: "solid 1px #B7C7C8" }}
                            >
                                <Text
                                    style={{
                                        ...descriptionText,
                                        textAlign: "center",
                                    }}
                                >
                                    Productos
                                </Text>
                            </Column>
                            <Column
                                width={"20%"}
                                style={{ borderRight: "solid 1px #B7C7C8" }}
                            >
                                <Text
                                    style={{
                                        ...descriptionText,
                                        textAlign: "center",
                                    }}
                                >
                                    Cantidad
                                </Text>
                            </Column>
                            <Column width={"20%"}>
                                <Text style={{ ...descriptionText, textAlign: "center" }}>
                                    Precio
                                </Text>
                            </Column>
                        </Row>
                        <Section style={productContainer}>
                            {order.products.map((product, index) => (
                                <Row key={index} style={productItem}>
                                    <Column
                                        width={"60%"}
                                        style={{ borderRight: "solid 1px #B7C7C8" }}
                                    >
                                        <Row>
                                            <Column align="left" width={75}>
                                                <Img
                                                    src={product.photo}
                                                    alt={product.model}
                                                    width="75"
                                                    height="75"
                                                    style={{ display: "block", margin: "0 auto" }}
                                                />
                                            </Column>
                                            <Column>
                                                <Text
                                                    style={{ ...descriptionText, paddingLeft: "10px" }}
                                                >
                                                    {product.brand} <br />
                                                    {product.familyModel} {product.model}
                                                </Text>
                                            </Column>
                                        </Row>
                                    </Column>
                                    <Column
                                        width={"20%"}
                                        style={{ borderRight: "solid 1px #B7C7C8" }}
                                    >
                                        <Text style={{ ...descriptionText, textAlign: "center" }}>
                                            {product.quantity}
                                        </Text>
                                    </Column>
                                    <Column width={"20%"}>
                                        <Text style={{ ...descriptionText, textAlign: "center" }}>
                                            ${product.price * product.quantity}
                                        </Text>
                                    </Column>
                                </Row>
                            ))}
                            <Row>
                                <Column width={"80%"}>
                                    <Text
                                        style={{
                                            ...descriptionText,
                                            paddingLeft: "5px",
                                            textAlign: "right",
                                        }}
                                    >
                                        Precio total de la compra:
                                    </Text>
                                </Column>
                                <Column width={"20%"}>
                                    <Text style={{ ...descriptionText, textAlign: "center" }}>
                                        ${order.payment.transactionTotalAmount}
                                    </Text>
                                </Column>
                            </Row>
                        </Section>
                    </Section>
                    <Section style={orderDetailsSection}>
                        <Row>
                            <Column align="center">
                                <Button
                                    href={`https://e-commerce-smartshop.vercel.app/me/myOrders/${order.orderId}`}
                                    style={buttonText}
                                >
                                    Ver Orden en el panel
                                </Button>
                            </Column>
                        </Row>
                    </Section>
                    <Text style={text}>
                        Este es un aviso automático de Smartshop. No respondas a este
                        correo.
                    </Text>
                    <Section style={footerSection}>
                        <Link
                            href="https://e-commerce-smartshop.vercel.app"
                            target="_blank"
                            style={linkText}
                        >
                            SMARTSHOP.COM
                        </Link>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}