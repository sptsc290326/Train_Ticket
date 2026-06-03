package controller.api;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import model.HanhKhach;
import model.Ve;
import service.BookingService;

@WebServlet("/api/booking/create")
public class ApiBookingController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private final BookingService bookingService = new BookingService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        try {
            JsonObject json = ApiUtil.readJson(request);
            String userId = ApiUtil.getString(json, "userId");
            if (ApiUtil.isBlank(userId)) {
                Object sessionUserId = request.getSession(false) == null ? null : request.getSession(false).getAttribute("userId");
                userId = sessionUserId == null ? null : String.valueOf(sessionUserId);
            }

            List<String> seatIds = readSeatIds(json);
            List<HanhKhach> passengers = readPassengers(json, seatIds.size());

            if (ApiUtil.isBlank(userId)) {
                ApiUtil.badRequest(response, "Thieu ma nguoi dat");
                return;
            }
            if (seatIds.isEmpty()) {
                ApiUtil.badRequest(response, "Chua chon ghe");
                return;
            }
            if (seatIds.size() != passengers.size()) {
                ApiUtil.badRequest(response, "So ghe va so hanh khach khong khop");
                return;
            }

            Ve ve = bookingService.taoVe(userId, seatIds, passengers);
            if (ve == null) {
                ApiUtil.badRequest(response, "Tao ve that bai");
                return;
            }

            Map<String, Object> data = new HashMap<String, Object>();
            data.put("idVe", ve.getId());
            data.put("tongTien", ve.getTongTien() == null ? "0" : ve.getTongTien().toPlainString());
            data.put("trangThaiVe", ve.getTrangThaiVe());
            ApiUtil.created(response, data);
        } catch (Exception e) {
            e.printStackTrace();
            ApiUtil.serverError(response, "Loi tao ve: " + e.getMessage());
        }
    }

    private List<String> readSeatIds(JsonObject json) {
        List<String> seatIds = new ArrayList<String>();
        if (json.has("seatIds") && json.get("seatIds").isJsonArray()) {
            for (JsonElement e : json.getAsJsonArray("seatIds")) {
                if (!e.isJsonNull()) {
                    seatIds.add(e.getAsString());
                }
            }
        } else {
            String seatIdsText = ApiUtil.getString(json, "seatIds");
            if (!ApiUtil.isBlank(seatIdsText)) {
                for (String id : seatIdsText.split(",")) {
                    if (!ApiUtil.isBlank(id)) {
                        seatIds.add(id.trim());
                    }
                }
            }
        }
        return seatIds;
    }

    private List<HanhKhach> readPassengers(JsonObject json, int seatCount) throws Exception {
        List<HanhKhach> passengers = new ArrayList<HanhKhach>();
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

        JsonArray arr = json.has("passengers") && json.get("passengers").isJsonArray()
                ? json.getAsJsonArray("passengers") : new JsonArray();

        for (int i = 0; i < arr.size(); i++) {
            JsonObject p = arr.get(i).getAsJsonObject();
            HanhKhach hk = new HanhKhach();
            hk.setHoTen(ApiUtil.getString(p, "hoTen"));
            hk.setCCCD(emptyToNull(firstNotBlank(ApiUtil.getString(p, "CCCD"), ApiUtil.getString(p, "cccd"))));
            hk.setSdt(emptyToNull(ApiUtil.getString(p, "sdt")));
            String ngaySinh = ApiUtil.getString(p, "ngaySinh");
            if (!ApiUtil.isBlank(ngaySinh)) {
                hk.setNgaySinh(sdf.parse(ngaySinh));
            }
            passengers.add(hk);
        }

        while (passengers.size() < seatCount) {
            HanhKhach hk = new HanhKhach();
            hk.setHoTen("Hanh khach " + (passengers.size() + 1));
            passengers.add(hk);
        }

        return passengers;
    }

    private String firstNotBlank(String a, String b) {
        return !ApiUtil.isBlank(a) ? a : b;
    }

    private String emptyToNull(String value) {
        return ApiUtil.isBlank(value) ? null : value.trim();
    }
}
