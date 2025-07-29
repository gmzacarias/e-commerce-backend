import { sendPaymentConfirmed } from "services/sendgrid"
import { render } from "@react-email/render"
import { paymentMail } from "components/paymentMail"
import { sgMail } from "lib/sendgrid"

jest.mock("@react-email/render");
jest.mock("components/paymentMail");
jest.mock("lib/sendgrid", () => ({
    sgMail: { send: jest.fn() },
    sender: "test@smartshop.com",
}))

describe("test in function sendPaymentConfirmed", () => {
    it("should render the email and send it", async () => {
        const email = "user@test.com";
        const userName = "userTest";
        const order = { orderId: "order001" };
        (paymentMail as jest.Mock).mockReturnValue({ component: "mailComponent" });
        (render as jest.Mock).mockReturnValue("<html>email content</html>");
        await sendPaymentConfirmed(email, userName, order as any);
        expect(paymentMail).toHaveBeenCalledWith({ userName, order });
        expect(render).toHaveBeenCalledWith({ component: "mailComponent" });
        expect(sgMail.send).toHaveBeenCalledWith({
            to: email,
            from: "test@smartshop.com",
            subject: `✅ Confirmación de tu compra en Smartshop - Orden #${order.orderId}`,
            html: "<html>email content</html>",
        });
    })

    it("should throw an error when sgmail fails to send the email", async () => {
        const error = new Error("hubo un problema al enviar el email");
        const email = "user@test.com";
        const userName = "userTest";
        const order = { orderId: "order001" };
        (paymentMail as jest.Mock).mockReturnValue({ component: "mailComponent" });
        (render as jest.Mock).mockReturnValue("<html>email content</html>");
        (sgMail.send as jest.Mock).mockRejectedValueOnce(error);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        await sendPaymentConfirmed(email, userName, order as any);
        expect(consoleSpy).toHaveBeenCalledWith("Email no enviado", error.message);
         expect(paymentMail).toHaveBeenCalledWith({ userName, order });
        expect(render).toHaveBeenCalledWith({ component: "mailComponent" });
        expect(sgMail.send).toHaveBeenCalledWith({
            to: "user@test.com",
            from: "test@smartshop.com",
            subject: `✅ Confirmación de tu compra en Smartshop - Orden #${order.orderId}`,
            html: "<html>email content</html>",
        });
    })
})