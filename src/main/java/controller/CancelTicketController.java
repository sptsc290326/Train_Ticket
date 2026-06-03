package controller;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import service.TrainTickService;

@WebServlet(urlPatterns = { "/CancelTicketController", "/ticket/cancel" })
public class CancelTicketController extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private TrainTickService service = new TrainTickService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        String ticketId = request.getParameter("ticketId");
        boolean success = service.cancelTicket(ticketId);

        String message;
        if (success) {
            message = "Đã hủy vé " + ticketId + " và trả ghế về trạng thái TRONG.";
        } else {
            message = "Hủy vé thất bại. Kiểm tra mã vé hoặc trạng thái vé.";
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
