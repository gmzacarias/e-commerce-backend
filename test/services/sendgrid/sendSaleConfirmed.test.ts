import { sendSaleConfirmed } from "services/sendgrid"
import { render } from "@react-email/render"
import { saleMail } from "components/saleMail"
import { adminEmail, sgMail } from "lib/sendgrid"

jest.mock("@react-email/render");
jest.mock("components/saleMail");
jest.mock("lib/sendgrid", () => ({
    sgMail: { send: jest.fn() },
    sender: "test@smartshop.com",
    adminEmail:"admin@smartshop.com"
}))

describe("test in function sendPaymentConfirmed", () => {
    it("should render the email and send it", async () => {
        const user = { userName: "userTest" };
        const order = { orderId: "order001" };
        (saleMail as jest.Mock).mockReturnValue({ component: "mailComponent" });
        (render as jest.Mock).mockReturnValue("<html>email content</html>");
        await sendSaleConfirmed(user as any, order as any);
        expect(saleMail).toHaveBeenCalledWith({ user, order });
        expect(render).toHaveBeenCalledWith({ component: "mailComponent" });
        expect(sgMail.send).toHaveBeenCalledWith({
            to: adminEmail,
            from: "test@smartshop.com",
            subject: `✅ Confirmación de venta en Smartshop - Orden #${order.orderId}`,
            html: "<html>email content</html>",
        });
    })

    it("should throw an error when sgmail fails to send the email", async () => {
        const error = new Error("hubo un problema al enviar el email");
        const user = { userName: "userTest" };
        const order = { orderId: "order001" };
        (saleMail as jest.Mock).mockReturnValue({ component: "mailComponent" });
        (render as jest.Mock).mockReturnValue("<html>email content</html>");
        (sgMail.send as jest.Mock).mockRejectedValueOnce(error);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await sendSaleConfirmed(user as any, order as any);
        expect(consoleSpy).toHaveBeenCalledWith("Email no enviado", error.message);
        expect(saleMail).toHaveBeenCalledWith({ user, order });
        expect(render).toHaveBeenCalledWith({ component: "mailComponent" });
        expect(sgMail.send).toHaveBeenCalledWith({
            to: adminEmail,
            from: "test@smartshop.com",
            subject: `✅ Confirmación de venta en Smartshop - Orden #${order.orderId}`,
            html: "<html>email content</html>",
        });
    })
})