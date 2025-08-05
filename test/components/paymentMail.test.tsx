import { render as renderEmail } from "@react-email/render";
import { paymentMail } from "components/paymentMail"

describe("test in function paymentMail", () => {
    const mockOrder = {
        orderId: "ABC123",
        created: "2025-08-05",
        products: [
            {
                photo: "https://example.com/product1.png",
                model: "Model X",
                familyModel: "Series Z",
                brand: "Brand A",
                quantity: 2,
                price: 1000
            },
            {
                photo: "https://example.com/product2.png",
                model: "Model Y",
                familyModel: "Series W",
                brand: "Brand B",
                quantity: 1,
                price: 500
            }
        ],
        payment: {
            transactionTotalAmount: 2500
        }
    };

    it("should render the username and order number", () => {
        const html = renderEmail(paymentMail({ userName: "Juan", order: mockOrder as any }));
        expect(html).toContain("Hola Juan");
        expect(html).toContain(`Tu pedido #${mockOrder.orderId} ha sido confirmado`);
    });

    it("should render the products with quantities and total price", () => {
        const html = renderEmail(paymentMail({ userName: "Juan", order: mockOrder as any }));
        expect(html).toContain(mockOrder.products[0].brand);
        expect(html).toContain(mockOrder.products[0].model);
        expect(html).toContain(mockOrder.products[0].familyModel);
        expect(html).toContain(mockOrder.products[0].photo);
        expect(html).toContain("$2000");

        expect(html).toContain(mockOrder.products[1].brand);
        expect(html).toContain("$500");
    })

    it("should contain the total purchase price", () => {
        const html = renderEmail(paymentMail({ userName: "Juan", order: mockOrder as any }));
        expect(html).toContain(`$${mockOrder.payment.transactionTotalAmount}`);
    })

    it("should contain the button to view the order", () => {
        const html = renderEmail(paymentMail({ userName: "Juan", order: mockOrder as any }));
        expect(html).toContain(
            `https://e-commerce-smartshop.vercel.app/me/myOrders/${mockOrder.orderId}`
        );
        expect(html).toContain("Ver mi pedido");
    })

    it("should contain the logo and the link in the footer", () => {
        const html = renderEmail(paymentMail({ userName: "Juan", order: mockOrder as any }));
        expect(html).toContain("https://res.cloudinary.com/dkwjm2ocu/ukudm8olr7crts5seziv.png");
        expect(html).toContain('alt="Smartshop logo"');
        expect(html).toContain("https://e-commerce-smartshop.vercel.app");
        expect(html).toContain(">SMARTSHOP.COM<");
    })
})
