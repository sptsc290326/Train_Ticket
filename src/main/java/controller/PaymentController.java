package controller;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import service.TrainTickService;

@WebServlet(urlPatterns = { "/PaymentController", "/payment/process" })
public class PaymentController extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private TrainTickService service = new TrainTickService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        String payId = request.getParameter("payId");
        String ticketId = request.getParameter("ticketId");
        String method = request.getParameter("method");
        String amountStr = request.getParameter("amount");

        String message;

        try {
            double amount = Double.parseDouble(amountStr);
            boolean success = service.processPayment(payId, ticketId, method, amount);

            if (success) {
                message = "Thanh toán thành công vé " + ticketId;
            } else {
                message = "Thanh toán thất bại. Kiểm tra mã vé hoặc trạng thái vé.";
            }

        } catch (Exception e) {
            message = "Thanh toán thất bại. Dữ liệu gửi lên không hợp lệ.";
        }

        request.setAttribute("msg", message);
        request.getRequestDispatcher("/index.jsp").forward(request, response);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.sendRedirect(request.getContextPath() + "/index.jsp");
    }
}
