package controller.api;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.JsonObject;

import service.BookingService;
import service.TripService;

@WebServlet(urlPatterns = { "/api/seats", "/api/booking/hold-seat" })
public class ApiSeatController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private final TripService tripService = new TripService();
    private final BookingService bookingService = new BookingService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String path = request.getServletPath();
        if ("/api/seats".equals(path)) {
            seats(request, response);
        } else {
            ApiUtil.notFound(response, "API khong ton tai");
        }
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String path = request.getServletPath();
        if ("/api/booking/hold-seat".equals(path)) {
            holdSeat(request, response);
        } else {
            ApiUtil.notFound(response, "API khong ton tai");
        }
    }

    private void seats(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String chuyenTauId = request.getParameter("chuyenTauId");
        if (ApiUtil.isBlank(chuyenTauId)) {
            chuyenTauId = request.getParameter("tripId");
        }
        if (ApiUtil.isBlank(chuyenTauId)) {
            ApiUtil.badRequest(response, "Thieu ma chuyen tau");
            return;
        }

        List<Object[]> rows = tripService.getSeatsByTrip(chuyenTauId);
        List<Map<String, Object>> data = new ArrayList<Map<String, Object>>();
        if (rows != null) {
            for (Object[] r : rows) {
                Map<String, Object> item = new HashMap<String, Object>();
                item.put("idGheChuyen", str(r[0]));
                item.put("idGhe", str(r[1]));
                item.put("viTriGhe", str(r[2]));
                item.put("soToa", r[3]);
                item.put("loaiToa", str(r[4]));
                item.put("gia", str(r[5]));
                item.put("trangThaiGheNgoi", str(r[6]));
                data.add(item);
            }
        }
        ApiUtil.ok(response, data);
    }

    private void holdSeat(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            JsonObject json = ApiUtil.readJson(request);
            String idGheChuyen = ApiUtil.getString(json, "idGheChuyen");
            if (ApiUtil.isBlank(idGheChuyen)) {
                idGheChuyen = request.getParameter("idGheChuyen");
            }
            if (ApiUtil.isBlank(idGheChuyen)) {
                ApiUtil.badRequest(response, "Thieu ma ghe chuyen");
                return;
            }
            boolean success = bookingService.giuGhe(idGheChuyen);
            if (!success) {
                ApiUtil.badRequest(response, "Ghe khong ton tai hoac khong con trong");
                return;
            }
            Map<String, Object> data = new HashMap<String, Object>();
            data.put("idGheChuyen", idGheChuyen);
            ApiUtil.ok(response, data);
        } catch (Exception e) {
            e.printStackTrace();
            ApiUtil.serverError(response, "Loi giu ghe: " + e.getMessage());
        }
    }

    private String str(Object obj) {
        return obj == null ? null : String.valueOf(obj);
    }
}
