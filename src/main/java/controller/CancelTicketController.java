package controller;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import service.TrainTickService;

@WebServlet("/CancelTicketController")
public class CancelTicketController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private TrainTickService service = new TrainTickService();

    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        
        String ticketId = request.getParameter("ticketId"); // Nhận 'VE02' từ SQL
        
        boolean success = service.cancelTicket(ticketId);
        String message = success ? "Đã thực hiện hủy thành công mã vé: " + ticketId : "Lỗi: Mã vé không tồn tại!";
        
        request.setAttribute("msg", message);
        request.getRequestDispatcher("index.jsp").forward(request, response);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        doPost(request, response);
    }
}