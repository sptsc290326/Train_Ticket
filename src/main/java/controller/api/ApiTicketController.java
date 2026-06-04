package controller.api;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.persistence.EntityManager;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import model.ChiTietVe;
import model.Ve;
import service.TicketService;
import service.TrainTickService;
import util.HibernateUtil;

@WebServlet(urlPatterns = { "/api/tickets", "/api/tickets/detail", "/api/tickets/cancel" })
public class ApiTicketController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private final TicketService ticketService = new TicketService();
    private final TrainTickService trainTickService = new TrainTickService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        String path = request.getServletPath();

        if ("/api/tickets".equals(path)) {
            list(request, response);
        } else if ("/api/tickets/detail".equals(path)) {
            detail(request, response);
        } else {
            ApiUtil.notFound(response, "API khong ton tai");
        }
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        String path = request.getServletPath();

        if ("/api/tickets/cancel".equals(path)) {
            cancelTicket(request, response);
        } else {
            ApiUtil.notFound(response, "API khong ton tai");
        }
    }

    private void list(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String userId = request.getParameter("userId");
        if (ApiUtil.isBlank(userId)) {
            Object sessionUserId = request.getSession(false) == null ? null : request.getSession(false).getAttribute("userId");
            userId = sessionUserId == null ? null : String.valueOf(sessionUserId);
        }
        if (ApiUtil.isBlank(userId)) {
            ApiUtil.badRequest(response, "Thieu ma nguoi dung");
            return;
        }

        String statusGroup = request.getParameter("statusGroup");
        String status = request.getParameter("status");

        EntityManager em = HibernateUtil.getEntityManager();
        try {
            StringBuilder sql = new StringBuilder();
            sql.append("SELECT v.ID, v.ngayDat, v.tongTien, v.trangThaiVe, ");
            sql.append("u.ID AS idNguoiDat, u.hoTen AS tenNguoiDat, ");
            sql.append("ct.ID AS idChuyenTau, tau.tenTau, gaDi.tenGa AS gaDi, gaDen.tenGa AS gaDen, ");
            sql.append("ct.ngayGioKhoiHanh, ct.ngayGioDen, ");
            sql.append("GROUP_CONCAT(DISTINCT CONCAT('T', toa.soToa, '-', gn.viTriGhe) ORDER BY toa.soToa, gn.viTriGhe SEPARATOR ', ') AS ghe, ");
            sql.append("COUNT(DISTINCT dg.ID) AS soDanhGia ");
            sql.append("FROM `Ve` v ");
            sql.append("JOIN `User` u ON v.idNguoiDat = u.ID ");
            sql.append("LEFT JOIN `ChiTietVe` ctv ON ctv.idVe = v.ID ");
            sql.append("LEFT JOIN `GheChuyen` gc ON ctv.idGheChuyen = gc.ID ");
            sql.append("LEFT JOIN `GheNgoi` gn ON gc.idGhe = gn.ID ");
            sql.append("LEFT JOIN `ToaTau` toa ON gn.idToa = toa.ID ");
            sql.append("LEFT JOIN `ChuyenTau` ct ON gc.idChuyenTau = ct.ID ");
            sql.append("LEFT JOIN `Tau` tau ON ct.idTau = tau.ID ");
            sql.append("LEFT JOIN `TuyenDuong` td ON ct.idTuyenDuong = td.ID ");
            sql.append("LEFT JOIN `GaTau` gaDi ON td.idGaDi = gaDi.ID ");
            sql.append("LEFT JOIN `GaTau` gaDen ON td.idGaDen = gaDen.ID ");
            sql.append("LEFT JOIN `DanhGia` dg ON dg.idVe = v.ID ");
            sql.append("WHERE v.idNguoiDat = ? ");

            if ("upcoming".equalsIgnoreCase(statusGroup)) {
                sql.append("AND UPPER(v.trangThaiVe) = 'DA_THANH_TOAN' ");
                sql.append("AND ct.ngayGioKhoiHanh > NOW() ");
            } else if ("pending".equalsIgnoreCase(statusGroup)) {
                sql.append("AND UPPER(v.trangThaiVe) = 'CHO_THANH_TOAN' ");
            } else if ("cancelled".equalsIgnoreCase(statusGroup)) {
                sql.append("AND UPPER(v.trangThaiVe) = 'DA_HUY' ");
            } else if ("completed".equalsIgnoreCase(statusGroup)) {
                sql.append("AND UPPER(v.trangThaiVe) = 'HOAN_THANH' ");
            } else if (!ApiUtil.isBlank(status)) {
                sql.append("AND UPPER(v.trangThaiVe) = UPPER(?) ");
            }

            sql.append("GROUP BY v.ID, v.ngayDat, v.tongTien, v.trangThaiVe, u.ID, u.hoTen, ");
            sql.append("ct.ID, tau.tenTau, gaDi.tenGa, gaDen.tenGa, ct.ngayGioKhoiHanh, ct.ngayGioDen ");
            sql.append("ORDER BY v.ngayDat DESC, v.ID DESC");

            javax.persistence.Query query = em.createNativeQuery(sql.toString());
            query.setParameter(1, userId.trim());
            if (ApiUtil.isBlank(statusGroup) && !ApiUtil.isBlank(status)) {
                query.setParameter(2, status.trim());
            }

            List<?> rows = query.getResultList();
            List<Map<String, Object>> data = new ArrayList<Map<String, Object>>();
            for (Object rowObj : rows) {
                Object[] r = (Object[]) rowObj;
                Map<String, Object> item = new HashMap<String, Object>();
                item.put("id", value(r[0]));
                item.put("ngayDat", r[1]);
                item.put("tongTien", value(r[2]));
                item.put("trangThaiVe", value(r[3]));
                item.put("idNguoiDat", value(r[4]));
                item.put("hoTenNguoiDat", value(r[5]));
                item.put("idChuyenTau", value(r[6]));
                item.put("tenTau", value(r[7]));
                item.put("gaDi", value(r[8]));
                item.put("gaDen", value(r[9]));
                item.put("ngayGioKhoiHanh", r[10]);
                item.put("ngayGioDen", r[11]);
                item.put("ghe", value(r[12]));
                int reviewCount = 0;
                if (r[13] instanceof Number) {
                    reviewCount = ((Number) r[13]).intValue();
                } else if (r[13] != null) {
                    try { reviewCount = Integer.parseInt(String.valueOf(r[13])); } catch (Exception ignored) {}
                }
                item.put("hasReview", reviewCount > 0);
                item.put("soDanhGia", reviewCount);
                data.add(item);
            }
            ApiUtil.ok(response, data);
        } catch (Exception e) {
            e.printStackTrace();
            ApiUtil.serverError(response, "Loi lay danh sach ve: " + e.getMessage());
        } finally {
            em.close();
        }
    }
    private void cancelTicket(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String ticketId = request.getParameter("ticketId");

        if (ApiUtil.isBlank(ticketId)) {
            ticketId = request.getParameter("idVe");
        }

        if (ApiUtil.isBlank(ticketId)) {
            try {
                com.google.gson.JsonObject json = ApiUtil.readJson(request);
                ticketId = ApiUtil.getString(json, "ticketId");

                if (ApiUtil.isBlank(ticketId)) {
                    ticketId = ApiUtil.getString(json, "idVe");
                }
            } catch (Exception e) {
            }
        }

        if (ApiUtil.isBlank(ticketId)) {
            ApiUtil.badRequest(response, "Thieu ma ve");
            return;
        }

        boolean success = trainTickService.cancelTicket(ticketId);

        if (!success) {
            ApiUtil.badRequest(response, "Huy ve that bai. Kiem tra ma ve hoac trang thai ve.");
            return;
        }

        Map<String, Object> data = new HashMap<String, Object>();
        data.put("ticketId", ticketId);
        data.put("message", "Huy ve thanh cong");

        ApiUtil.ok(response, data);
    }

    private void detail(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String idVe = request.getParameter("idVe");
        if (ApiUtil.isBlank(idVe)) {
            idVe = request.getParameter("ticketId");
        }
        if (ApiUtil.isBlank(idVe)) {
            ApiUtil.badRequest(response, "Thieu ma ve");
            return;
        }

        Ve ve = ticketService.layChiTietVe(idVe);
        if (ve == null) {
            ApiUtil.notFound(response, "Khong tim thay ve");
            return;
        }
        List<ChiTietVe> details = ticketService.layDSChiTietVe(idVe);
        Map<String, Object> data = ticketToMap(ve);
        List<Map<String, Object>> detailList = new ArrayList<Map<String, Object>>();
        if (details != null) {
            for (ChiTietVe c : details) {
                Map<String, Object> item = new HashMap<String, Object>();
                item.put("id", c.getId());
                item.put("donGia", c.getDonGia() == null ? null : c.getDonGia().toPlainString());
                item.put("thanhTien", c.getThanhTien() == null ? null : c.getThanhTien().toPlainString());
                if (c.getHanhKhach() != null) {
                    item.put("hanhKhachId", c.getHanhKhach().getId());
                    item.put("hoTenHanhKhach", c.getHanhKhach().getHoTen());
                    item.put("cccd", c.getHanhKhach().getCCCD());
                    item.put("sdt", c.getHanhKhach().getSdt());
                }
                if (c.getGheChuyen() != null) {
                    item.put("idGheChuyen", c.getGheChuyen().getId());
                    item.put("idGhe", c.getGheChuyen().getIdGhe());
                    item.put("trangThaiGheNgoi", c.getGheChuyen().getTrangThaiGheNgoi());
                }
                detailList.add(item);
            }
        }
        data.put("chiTietVe", detailList);
        ApiUtil.ok(response, data);
    }

    private Map<String, Object> ticketToMap(Ve ve) {
        Map<String, Object> item = new HashMap<String, Object>();
        item.put("id", ve.getId());
        item.put("ngayDat", ve.getNgayDat());
        item.put("tongTien", ve.getTongTien() == null ? null : ve.getTongTien().toPlainString());
        item.put("trangThaiVe", ve.getTrangThaiVe());
        if (ve.getNguoiDat() != null) {
            item.put("idNguoiDat", ve.getNguoiDat().getId());
            item.put("hoTenNguoiDat", ve.getNguoiDat().getHoTen());
        }
        return item;
    }

    private String value(Object obj) {
        return obj == null ? null : String.valueOf(obj);
    }
}
