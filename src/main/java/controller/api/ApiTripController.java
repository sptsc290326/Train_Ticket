package controller.api;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import model.ChuyenTau;
import model.GaTau;
import model.TuyenDuong;
import service.TripService;
import util.HibernateUtil;

@WebServlet(urlPatterns = { "/api/stations", "/api/trips", "/api/trips/detail" })
public class ApiTripController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private final TripService tripService = new TripService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        String path = request.getServletPath();

        try { 
            if ("/api/stations".equals(path)) {
                stations(response);
            } else if ("/api/trips".equals(path)) {
                trips(request, response);
            } else if ("/api/trips/detail".equals(path)) {
                tripDetail(request, response);
            } else {
                ApiUtil.notFound(response, "API khong ton tai");
            }
        } catch (Exception e) {
            e.printStackTrace();
            ApiUtil.serverError(response, "Loi API chuyen tau: " + e.getMessage());
        }
    }

    private void stations(HttpServletResponse response) throws IOException {
        List<GaTau> stations = tripService.getAllStations();
        List<Map<String, Object>> data = new ArrayList<Map<String, Object>>();
        if (stations != null) {
            for (GaTau ga : stations) {
                Map<String, Object> item = new HashMap<String, Object>();
                item.put("id", ga.getId());
                item.put("tenGa", ga.getTenGa());
                item.put("sdt", ga.getSdt());
                item.put("diaChi", ga.getDiaChi());
                data.add(item);
            }
        }
        ApiUtil.ok(response, data);
    }

    private void trips(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String gaDiId = trim(request.getParameter("gaDiId"));
        String gaDenId = trim(request.getParameter("gaDenId"));
        String gaDi = trim(request.getParameter("gaDi"));
        String gaDen = trim(request.getParameter("gaDen"));
        String ngayDiStr = trim(request.getParameter("ngayDi"));
        if (ApiUtil.isBlank(ngayDiStr)) {
            ngayDiStr = trim(request.getParameter("date"));
        }

        List<ChuyenTau> trips;
        if (!ApiUtil.isBlank(gaDiId) && !ApiUtil.isBlank(gaDenId) && !ApiUtil.isBlank(ngayDiStr)) {
            trips = tripService.searchTrips(gaDiId, gaDenId, LocalDate.parse(ngayDiStr));
        } else if (!ApiUtil.isBlank(gaDi) && !ApiUtil.isBlank(gaDen) && !ApiUtil.isBlank(ngayDiStr)) {
            List<GaTau> stations = tripService.getAllStations();
            String resolvedGaDiId = resolveStationId(stations, gaDi);
            String resolvedGaDenId = resolveStationId(stations, gaDen);
            if (ApiUtil.isBlank(resolvedGaDiId) || ApiUtil.isBlank(resolvedGaDenId)) {
                ApiUtil.badRequest(response, "Khong tim thay ga di hoac ga den");
                return;
            }
            trips = tripService.searchTrips(resolvedGaDiId, resolvedGaDenId, LocalDate.parse(ngayDiStr));
        } else {
            trips = tripService.getAllAvailableTrips();
        }

        List<Map<String, Object>> data = new ArrayList<Map<String, Object>>();
        if (trips != null) {
            for (ChuyenTau trip : trips) {
                Map<String, Object> item = tripToMap(trip);
                
                BigDecimal minPrice = getMinPriceForTrip(trip.getId());
                if (minPrice != null) {
                    item.put("giaThapNhat", minPrice);
                }
                
                data.add(item);
            }
        }
        ApiUtil.ok(response, data);
    }

    private BigDecimal getMinPriceForTrip(String chuyenTauId) {
        EntityManager em = HibernateUtil.getEntityManager();
        try {
            String sql = "SELECT MIN(gia) FROM GheChuyen WHERE idChuyenTau = ?";
            Query query = em.createNativeQuery(sql);
            query.setParameter(1, chuyenTauId);
            Object result = query.getSingleResult();
            
            if (result == null) return null;
            if (result instanceof BigDecimal) {
                return (BigDecimal) result;
            }
            if (result instanceof Double) {
                return BigDecimal.valueOf((Double) result);
            }
            if (result instanceof Integer) {
                return BigDecimal.valueOf((Integer) result);
            }
            return new BigDecimal(result.toString());
        } catch (Exception e) {
            e.printStackTrace();  
            return null;
        } finally {
            em.close();
        }
    }

    private void tripDetail(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String id = trim(request.getParameter("id"));
        if (ApiUtil.isBlank(id)) {
            ApiUtil.badRequest(response, "Thieu ma chuyen tau");
            return;
        }
        ChuyenTau trip = tripService.getTripById(id);
        if (trip == null) {
            ApiUtil.notFound(response, "Khong tim thay chuyen tau");
            return;
        }
        ApiUtil.ok(response, tripToMap(trip));
    }

    private Map<String, Object> tripToMap(ChuyenTau trip) {
        Map<String, Object> item = new HashMap<String, Object>();
        item.put("id", trip.getId());
        item.put("ngayGioKhoiHanh", trip.getNgayGioKhoiHanh());
        item.put("ngayGioDen", trip.getNgayGioDen());
        item.put("trangThaiChuyen", trip.getTrangThaiChuyen());

        if (trip.getTau() != null) {
            item.put("idTau", trip.getTau().getId());
            item.put("tenTau", trip.getTau().getTenTau());
        }

        TuyenDuong td = trip.getTuyenDuong();
        if (td != null) {
            item.put("idTuyenDuong", td.getId());
            item.put("tenTuyenDuong", td.getTenTD());
            item.put("khoangCach", bd(td.getKhoangCach()));
            if (td.getGaDi() != null) {
                item.put("idGaDi", td.getGaDi().getId());
                item.put("gaDi", td.getGaDi().getTenGa());
            }
            if (td.getGaDen() != null) {
                item.put("idGaDen", td.getGaDen().getId());
                item.put("gaDen", td.getGaDen().getTenGa());
            }
        }
        return item;
    }

    private String resolveStationId(List<GaTau> stations, String value) {
        if (stations == null || value == null) {
            return null;
        }
        String normalized = value.trim().toLowerCase();
        for (GaTau ga : stations) {
            if (ga.getId().equalsIgnoreCase(value) || ga.getTenGa().trim().toLowerCase().equals(normalized)) {
                return ga.getId();
            }
        }
        return null;
    }

    private String bd(BigDecimal value) {
        return value == null ? null : value.toPlainString();
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }
}
