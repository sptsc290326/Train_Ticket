package controller;

import java.io.IOException;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import service.TripService;

@WebServlet("/SeatController")
public class SeatController extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private final TripService tripService = new TripService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        String chuyenTauId = request.getParameter("chuyenTauId");

        if (chuyenTauId == null || chuyenTauId.trim().isEmpty()) {
            request.setAttribute("message", "Thiếu mã chuyến tàu");
            request.getRequestDispatcher("/WEB-INF/view/error.jsp").forward(request, response);
            return;
        }

        List<Object[]> seats = tripService.getSeatsByTrip(chuyenTauId);
        request.setAttribute("seats", seats);
        request.setAttribute("chuyenTauId", chuyenTauId);

        request.getRequestDispatcher("/WEB-INF/view/seat-select.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        doGet(request, response);
    }
}
