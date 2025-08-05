import { render as renderEmail } from "@react-email/render"
import { saleMail } from "components/saleMail"

describe("test in function saleMail", () => {
    const mockUser = {
        userName: "Carlos",
        email: "carlos@example.com",
    };
    const mockOrder = {
        userId: "user-001",
        orderId: "ORD123",
        created: "2025-08-05",
        products: [
            {
                photo: "https://example.com/prod1.png",
                model: "Model A",
                familyModel: "Family X",
                brand: "BrandY",
                quantity: 3,
                price: 1500,
            },
            {
                photo: "https://example.com/prod2.png",
                model: "Model B",
                familyModel: "Family Z",
                brand: "BrandZ",
                quantity: 1,
                price: 3000,
            },
        ],
        payment: {
            transactionTotalAmount: 7500,
        },
    };

    it("should render user data and order", () => {
        const html = renderEmail(saleMail({ user: mockUser as any, order: mockOrder as any }));
        expect(html).toContain("¡Nueva venta realizada!");
        expect(html).toContain(mockUser.userName);
        expect(html).toContain(mockUser.email);
        expect(html).toContain(mockOrder.userId);
        expect(html).toContain(mockOrder.orderId);
        expect(html).toContain(mockOrder.created);
    })

    it("should render the products with their prices", () => {
        const html = renderEmail(saleMail({ user: mockUser as any, order: mockOrder as any }));
        for (const product of mockOrder.products) {
            expect(html).toContain(product.brand);
            expect(html).toContain(product.familyModel);
            expect(html).toContain(product.model);
            expect(html).toContain(product.photo);
            expect(html).toContain(String(product.quantity));
            expect(html).toContain(`$${product.price * product.quantity}`);
        }
    })

    it("should show the total purchase", () => {
        const html = renderEmail(saleMail({ user: mockUser as any, order: mockOrder as any }));
        expect(html).toContain(`$${mockOrder.payment.transactionTotalAmount}`);
    })

    it("incluye el botón con link correcto", () => {
        const html = renderEmail(saleMail({ user: mockUser as any, order: mockOrder as any }));
        expect(html).toContain(
            `https://e-commerce-smartshop.vercel.app/me/myOrders/${mockOrder.orderId}`
        );
        expect(html).toContain("Ver Orden en el panel");
    })

    it("should contain the logo and the link in the footer", () => {
        const html = renderEmail(saleMail({ user: mockUser as any, order: mockOrder as any }));
        expect(html).toContain("https://res.cloudinary.com/dkwjm2ocu/ukudm8olr7crts5seziv.png");
        expect(html).toContain('alt="Smartshop logo"');
        expect(html).toContain("https://e-commerce-smartshop.vercel.app");
        expect(html).toContain(">SMARTSHOP.COM<");
    })
})
