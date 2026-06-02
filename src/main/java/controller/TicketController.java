package controller;

import java.io.IOException;
import java.util.List;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import model.ChiTietVe;
import model.Ve;
import service.TicketService;

@WebServlet(urlPatterns = {"/ticket/list", "/ticket/detail"})
public class TicketController extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private TicketService tService = new TicketService();

    private static final String VIEW = "/WEB-INF/view/";

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        String path = request.getServletPath();

        if ("/ticket/list".equals(path)) {
            hienThiDSVe(request, response);
        } else if ("/ticket/detail".equals(path)) {
            hienThiChiTietVe(request, response);
        } else {
            response.sendRedirect(request.getContextPath() + "/index.jsp");
        }
    }

    private void hienThiDSVe(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String userId = request.getParameter("userId");

        if (userId == null || userId.trim().isEmpty()) {
            request.setAttribute("message", "Thiếu mã người dùng");
            request.getRequestDispatcher(VIEW + "error.jsp").forward(request, response);
            return;
        }

        List<Ve> dsVe = tService.layVeTheoNguoiDat(userId);

        request.setAttribute("dsVe", dsVe);
        request.setAttribute("userId", userId);

        RequestDispatcher rd = request.getRequestDispatcher(VIEW + "ticket-list.jsp");
        rd.forward(request, response);
    }

    private void hienThiChiTietVe(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String idVe = request.getParameter("idVe");

        if (idVe == null || idVe.trim().isEmpty()) {
            request.setAttribute("message", "Thiếu mã vé");
            request.getRequestDispatcher(VIEW + "error.jsp").forward(request, response);
            return;
        }

        Ve ve = tService.layChiTietVe(idVe);

        if (ve == null) {
            request.setAttribute("message", "Không tìm thấy vé");
            request.getRequestDispatcher(VIEW + "error.jsp").forward(request, response);
            return;
        }

        List<ChiTietVe> dsChiTietVe = tService.layDSChiTietVe(idVe);

        request.setAttribute("ve", ve);
        request.setAttribute("dsChiTietVe", dsChiTietVe);

        RequestDispatcher rd = request.getRequestDispatcher(VIEW + "ticket-detail.jsp");
        rd.forward(request, response);
    }
}