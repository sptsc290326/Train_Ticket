package controller.api;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.LockModeType;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.JsonObject;

import model.DanhGia;
import model.User;
import model.Ve;
import util.HibernateUtil;

@WebServlet(urlPatterns = { "/api/reviews", "/api/reviews/create", "/api/reviews/reply" })
public class ApiReviewController extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");

        if ("/api/reviews".equals(request.getServletPath())) {
            getReviews(request, response);
            return;
        }

        ApiUtil.notFound(response, "API khong ton tai");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");

        String path = request.getServletPath();
        if ("/api/reviews/create".equals(path)) {
            createReview(request, response);
            return;
        }

        if ("/api/reviews/reply".equals(path)) {
            replyReview(request, response);
            return;
        }

        ApiUtil.notFound(response, "API khong ton tai");
    }

    private void getReviews(HttpServletRequest request, HttpServletResponse response) throws IOException {
        EntityManager em = HibernateUtil.getEntityManager();
        try {
            String ticketId = firstNotBlank(request.getParameter("ticketId"), request.getParameter("idVe"));
            String tripId = firstNotBlank(request.getParameter("tripId"), request.getParameter("idChuyenTau"));

            List<DanhGia> reviews;
            if (!ApiUtil.isBlank(ticketId)) {
                reviews = em.createQuery(
                        "SELECT d FROM DanhGia d WHERE d.ve.id = :ticketId ORDER BY d.thoiGianDanhGia DESC",
                        DanhGia.class)
                        .setParameter("ticketId", ticketId.trim())
                        .getResultList();
            } else {
                reviews = em.createQuery(
                        "SELECT d FROM DanhGia d ORDER BY d.thoiGianDanhGia DESC",
                        DanhGia.class)
                        .getResultList();
            }

            List<Map<String, Object>> data = new ArrayList<Map<String, Object>>();
            for (DanhGia review : reviews) {
                Map<String, Object> item = reviewToMap(em, review);
                if (!ApiUtil.isBlank(tripId) && !tripId.trim().equals(String.valueOf(item.get("idChuyenTau")))) {
                    continue;
                }
                data.add(item);
            }

            ApiUtil.ok(response, data);
        } catch (Exception e) {
            e.printStackTrace();
            ApiUtil.serverError(response, "Loi lay danh sach danh gia: " + e.getMessage());
        } finally {
            em.close();
        }
    }

    private void createReview(HttpServletRequest request, HttpServletResponse response) throws IOException {
        EntityManager em = HibernateUtil.getEntityManager();
        EntityTransaction tx = em.getTransaction();

        try {
            JsonObject json = ApiUtil.readJson(request);
            String ticketId = firstNotBlank(ApiUtil.getString(json, "ticketId"), ApiUtil.getString(json, "idVe"));
            String content = firstNotBlank(ApiUtil.getString(json, "content"), ApiUtil.getString(json, "noiDung"));
            String starsText = firstNotBlank(ApiUtil.getString(json, "stars"), ApiUtil.getString(json, "soSao"));

            if (ApiUtil.isBlank(ticketId)) {
                ApiUtil.badRequest(response, "Thieu ma ve de danh gia");
                return;
            }

            if (ApiUtil.isBlank(starsText)) {
                ApiUtil.badRequest(response, "Thieu so sao danh gia");
                return;
            }

            int stars = Integer.parseInt(starsText.trim());
            if (stars < 1 || stars > 5) {
                ApiUtil.badRequest(response, "So sao phai tu 1 den 5");
                return;
            }

            tx.begin();

            Ve ticket = em.find(Ve.class, ticketId.trim(), LockModeType.PESSIMISTIC_WRITE);
            if (ticket == null) {
                tx.rollback();
                ApiUtil.badRequest(response, "Khong tim thay ve");
                return;
            }

            String status = ticket.getTrangThaiVe();
            if (!("HOAN_THANH".equals(status) || "DA_THANH_TOAN".equals(status))) {
                tx.rollback();
                ApiUtil.badRequest(response, "Chi duoc danh gia ve da thanh toan hoac da hoan thanh");
                return;
            }

            Long count = em.createQuery(
                    "SELECT COUNT(d) FROM DanhGia d WHERE d.ve.id = :ticketId", Long.class)
                    .setParameter("ticketId", ticket.getId())
                    .getSingleResult();
            if (count != null && count > 0) {
                tx.rollback();
                ApiUtil.badRequest(response, "Ve nay da duoc danh gia. Moi ve chi duoc danh gia 1 lan.");
                return;
            }

            DanhGia review = new DanhGia();
            review.setId(nextId(em, "DG", "DanhGia"));
            review.setVe(ticket);
            review.setSoSao(stars);
            review.setNoiDung(content);
            review.setThoiGianDanhGia(new Date());

            em.persist(review);
            tx.commit();

            ApiUtil.created(response, reviewToMap(em, review));
        } catch (NumberFormatException e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            ApiUtil.badRequest(response, "So sao khong hop le");
        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            e.printStackTrace();
            ApiUtil.serverError(response, "Loi tao danh gia: " + e.getMessage());
        } finally {
            em.close();
        }
    }

    private void replyReview(HttpServletRequest request, HttpServletResponse response) throws IOException {
        EntityManager em = HibernateUtil.getEntityManager();
        EntityTransaction tx = em.getTransaction();

        try {
            JsonObject json = ApiUtil.readJson(request);
            String reviewId = ApiUtil.getString(json, "reviewId");
            String replyContent = ApiUtil.getString(json, "replyContent");
            String adminId = ApiUtil.getString(json, "adminId");

            if (ApiUtil.isBlank(reviewId)) {
                ApiUtil.badRequest(response, "Thieu ma danh gia");
                return;
            }

            if (ApiUtil.isBlank(replyContent)) {
                ApiUtil.badRequest(response, "Noi dung phan hoi khong duoc de trong");
                return;
            }

            tx.begin();

            DanhGia review = em.find(DanhGia.class, reviewId.trim(), LockModeType.PESSIMISTIC_WRITE);
            if (review == null) {
                tx.rollback();
                ApiUtil.badRequest(response, "Khong tim thay danh gia");
                return;
            }

            if (!ApiUtil.isBlank(review.getPhanHoi())) {
                tx.rollback();
                ApiUtil.badRequest(response, "Danh gia nay da co phan hoi. Moi danh gia chi duoc phan hoi 1 lan.");
                return;
            }

            if (!ApiUtil.isBlank(adminId)) {
                User admin = em.find(User.class, adminId.trim());
                if (admin == null || !"ADMIN".equals(admin.getVaiTro())) {
                    tx.rollback();
                    ApiUtil.badRequest(response, "Tai khoan phan hoi khong phai admin");
                    return;
                }
                review.setAdminPhanHoi(admin);
            }

            review.setPhanHoi(replyContent);
            review.setThoiGianPhanHoi(new Date());
            tx.commit();

            ApiUtil.ok(response, reviewToMap(em, review));
        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            e.printStackTrace();
            ApiUtil.serverError(response, "Loi phan hoi danh gia: " + e.getMessage());
        } finally {
            em.close();
        }
    }

    private Map<String, Object> reviewToMap(EntityManager em, DanhGia review) {
        Map<String, Object> item = new HashMap<String, Object>();
        item.put("id", review.getId());
        item.put("soSao", review.getSoSao());
        item.put("noiDung", review.getNoiDung());
        item.put("phanHoi", review.getPhanHoi());
        item.put("thoiGianDanhGia", review.getThoiGianDanhGia());
        item.put("thoiGianPhanHoi", review.getThoiGianPhanHoi());

        if (review.getVe() != null) {
            item.put("idVe", review.getVe().getId());
            item.put("trangThaiVe", review.getVe().getTrangThaiVe());
            if (review.getVe().getNguoiDat() != null) {
                item.put("idKhachHang", review.getVe().getNguoiDat().getId());
                item.put("tenKhachHang", review.getVe().getNguoiDat().getHoTen());
            }
            addTripInfo(em, item, review.getVe().getId());
        }

        if (review.getAdminPhanHoi() != null) {
            item.put("idAdminPhanHoi", review.getAdminPhanHoi().getId());
            item.put("tenAdminPhanHoi", review.getAdminPhanHoi().getHoTen());
        }

        return item;
    }

    private void addTripInfo(EntityManager em, Map<String, Object> item, String ticketId) {
        try {
            List<?> rows = em.createNativeQuery(
                    "SELECT ct.id, tau.tenTau, gaDi.tenGa, gaDen.tenGa, ct.ngayGioKhoiHanh, ct.ngayGioDen "
                            + "FROM ChiTietVe c "
                            + "JOIN GheChuyen gc ON c.idGheChuyen = gc.id "
                            + "JOIN ChuyenTau ct ON gc.idChuyenTau = ct.id "
                            + "JOIN Tau tau ON ct.idTau = tau.id "
                            + "JOIN TuyenDuong td ON ct.idTuyenDuong = td.id "
                            + "JOIN GaTau gaDi ON td.idGaDi = gaDi.id "
                            + "JOIN GaTau gaDen ON td.idGaDen = gaDen.id "
                            + "WHERE c.idVe = ? "
                            + "ORDER BY c.id ASC LIMIT 1")
                    .setParameter(1, ticketId)
                    .getResultList();

            if (!rows.isEmpty()) {
                Object[] row = (Object[]) rows.get(0);
                item.put("idChuyenTau", value(row[0]));
                item.put("tenTau", value(row[1]));
                item.put("gaDi", value(row[2]));
                item.put("gaDen", value(row[3]));
                item.put("ngayGioKhoiHanh", row[4]);
                item.put("ngayGioDen", row[5]);
            }
        } catch (Exception e) {
            item.put("tripInfoError", e.getMessage());
        }
    }

    private String nextId(EntityManager em, String prefix, String entityName) {
        List<String> ids = em.createQuery(
                "SELECT e.id FROM " + entityName + " e WHERE e.id LIKE :prefix", String.class)
                .setParameter("prefix", prefix + "%")
                .getResultList();

        int max = 0;
        for (String id : ids) {
            try {
                int number = Integer.parseInt(id.substring(prefix.length()));
                if (number > max) {
                    max = number;
                }
            } catch (Exception ignored) {
            }
        }

        return String.format("%s%02d", prefix, max + 1);
    }

    private String firstNotBlank(String a, String b) {
        return !ApiUtil.isBlank(a) ? a : b;
    }

    private String value(Object obj) {
        return obj == null ? null : String.valueOf(obj);
    }
}
