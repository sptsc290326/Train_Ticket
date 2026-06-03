package controller;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import model.ChuyenTau;
import model.GaTau;
import service.TripService;

@WebServlet("/TripController")
public class TripController extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private final TripService tripService = new TripService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        String action = request.getParameter("action");

        if ("search".equals(action)) {
            hienThiFormTimKiem(request, response);
        } else if ("detail".equals(action)) {
            hienThiChiTietChuyen(request, response);
        } else {
            hienThiDanhSachChuyen(request, response);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        String action = request.getParameter("action");

        if ("search".equals(action)) {
            timKiemChuyenTau(request, response);
        } else {
            doGet(request, response);
        }
    }

    private void hienThiFormTimKiem(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        List<GaTau> stations = tripService.getAllStations();
        request.setAttribute("stations", stations);
        request.getRequestDispatcher("/WEB-INF/view/search-trip.jsp").forward(request, response);
    }

    private void hienThiDanhSachChuyen(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        List<ChuyenTau> trips = tripService.getAllAvailableTrips();
        request.setAttribute("trips", trips);
        request.getRequestDispatcher("/WEB-INF/view/trip-list.jsp").forward(request, response);
    }

    private void hienThiChiTietChuyen(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String id = request.getParameter("id");
        ChuyenTau trip = tripService.getTripById(id);

        if (trip == null) {
            request.setAttribute("message", "Không tìm thấy chuyến tàu");
            request.getRequestDispatcher("/WEB-INF/view/error.jsp").forward(request, response);
            return;
        }

        request.setAttribute("trip", trip);
        request.getRequestDispatcher("/WEB-INF/view/trip-detail.jsp").forward(request, response);
    }

    private void timKiemChuyenTau(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            String gaDiId = request.getParameter("gaDiId");
            String gaDenId = request.getParameter("gaDenId");
            String ngayDiStr = request.getParameter("ngayDi");

            String error = null;
            List<ChuyenTau> trips = null;

            if (gaDiId == null || gaDiId.trim().isEmpty()
                    || gaDenId == null || gaDenId.trim().isEmpty()
                    || gaDiId.equals(gaDenId)) {
                error = "Vui lòng chọn ga đi và ga đến khác nhau";
            } else if (ngayDiStr == null || ngayDiStr.trim().isEmpty()) {
                error = "Vui lòng chọn ngày đi";
            } else {
                LocalDate ngayDi = LocalDate.parse(ngayDiStr);
                trips = tripService.searchTrips(gaDiId, gaDenId, ngayDi);

                if (trips == null || trips.isEmpty()) {
                    error = "Không tìm thấy chuyến tàu phù hợp";
                }
            }

            List<GaTau> stations = tripService.getAllStations();
            request.setAttribute("stations", stations);
            request.setAttribute("trips", trips);
            request.setAttribute("error", error);
            request.setAttribute("gaDiId", gaDiId);
            request.setAttribute("gaDenId", gaDenId);
            request.setAttribute("ngayDi", ngayDiStr);

            request.getRequestDispatcher("/WEB-INF/view/search-trip.jsp").forward(request, response);

        } catch (Exception e) {
            e.printStackTrace();
            request.setAttribute("message", "Lỗi tìm chuyến: " + e.getMessage());
            request.getRequestDispatcher("/WEB-INF/view/error.jsp").forward(request, response);
        }
    }
}
