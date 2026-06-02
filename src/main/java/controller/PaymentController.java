package controller;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import service.TrainTickService;

@WebServlet("/PaymentController")
public class PaymentController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private TrainTickService service = new TrainTickService();

    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        
        String payId = request.getParameter("payId"); // Ví dụ: 'TT02' hoặc 'TT_TEST'
        String ticketId = request.getParameter("ticketId"); // Nhận 'VE01'
        String method = request.getParameter("method");
        double amount = Double.parseDouble(request.getParameter("amount")); // 500000
        
        boolean success = service.processPayment(payId, ticketId, method, amount);
        String message = success ? "Thanh toán thành công vé " + ticketId + " (Hóa đơn: " + payId + ")" : "Lỗi: Thanh toán thất bại!";
        
        request.setAttribute("msg", message);
        request.getRequestDispatcher("index.jsp").forward(request, response);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        doPost(request, response);
    }
}