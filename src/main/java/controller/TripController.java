package controller;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import model.ChuyenTau;
import model.GaTau;
import service.TripService;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/TripController")
public class TripController extends HttpServlet {
    private TripService tripService = new TripService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        String action = request.getParameter("action");
        
        if ("search".equals(action)) {
            List<GaTau> stations = tripService.getAllStations();
            request.setAttribute("stations", stations);
            request.getRequestDispatcher("/WEB-INF/view/search-trip.jsp").forward(request, response);
            
        } else if ("list".equals(action)) {
            List<ChuyenTau> trips = tripService.getAllAvailableTrips();
            request.setAttribute("trips", trips);
            request.getRequestDispatcher("/WEB-INF/view/trip-list.jsp").forward(request, response);
            
        } else if ("detail".equals(action)) {
            String id = request.getParameter("id");
            ChuyenTau trip = tripService.getTripById(id);
            request.setAttribute("trip", trip);
            request.getRequestDispatcher("/WEB-INF/view/trip-detail.jsp").forward(request, response);
            
        } else {
            List<ChuyenTau> trips = tripService.getAllAvailableTrips();
            request.setAttribute("trips", trips);
            request.getRequestDispatcher("/WEB-INF/view/trip-list.jsp").forward(request, response);
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        String action = request.getParameter("action");
        
        if ("search".equals(action)) {
            String gaDiId = request.getParameter("gaDiId");
            String gaDenId = request.getParameter("gaDenId");
            String ngayDiStr = request.getParameter("ngayDi");
            
            List<ChuyenTau> trips = null;
            String error = null;
            
            if (gaDiId == null || gaDenId == null || gaDiId.equals(gaDenId)) {
                error = "Vui lòng chọn ga đi và ga đến khác nhau";
            } else if (ngayDiStr == null || ngayDiStr.isEmpty()) {
                error = "Vui lòng chọn ngày đi";
            } else {
                LocalDate ngayDi = LocalDate.parse(ngayDiStr, DateTimeFormatter.ISO_LOCAL_DATE);
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
        } else {
            doGet(request, response);
        }
    }
}