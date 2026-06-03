package service;

import java.math.BigDecimal;
import java.util.Date;
import java.math.RoundingMode;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.LockModeType;

import model.ChiTietVe;
import model.DanhGia;
import model.GheChuyen;
import model.ThanhToan;
import model.User;
import model.Ve;
import util.HibernateUtil;

public class TrainTickService {

    public boolean updateProfile(String userId, String name, String phone, String email) {
        EntityManager em = HibernateUtil.getEntityManager();
        EntityTransaction tx = em.getTransaction();

        try {
            tx.begin();

            User user = em.find(User.class, userId, LockModeType.PESSIMISTIC_WRITE);
            if (user == null) {
                tx.rollback();
                return false;
            }

            if (!isBlank(name)) {
                user.setHoTen(name.trim());
            }
            if (!isBlank(phone)) {
                user.setSdt(phone.trim());
            }
            if (!isBlank(email)) {
                user.setEmail(email.trim());
            }

            tx.commit();
            return true;

        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            e.printStackTrace();
            return false;

        } finally {
            em.close();
        }
    }

    public boolean processPayment(String payId, String ticketId, String method, double amount) {
        EntityManager em = HibernateUtil.getEntityManager();
        EntityTransaction tx = em.getTransaction();

        try {
            tx.begin();

            Ve ve = em.find(Ve.class, ticketId, LockModeType.PESSIMISTIC_WRITE);
            if (ve == null) {
                tx.rollback();
                return false;
            }

            if (!"CHO_THANH_TOAN".equals(ve.getTrangThaiVe())) {
                tx.rollback();
                return false;
            }

            BigDecimal soTienGuiLen = BigDecimal.valueOf(amount).setScale(2, RoundingMode.HALF_UP);
            BigDecimal tongTienVe = ve.getTongTien() == null
                    ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                    : ve.getTongTien().setScale(2, RoundingMode.HALF_UP);

            if (soTienGuiLen.compareTo(tongTienVe) != 0) {
                tx.rollback();
                return false;
            }

            Long soLanThanhToanThanhCong = em.createQuery(
                    "SELECT COUNT(t) FROM ThanhToan t WHERE t.ve.id = :idVe AND t.trangThai = :trangThai",
                    Long.class)
                    .setParameter("idVe", ticketId)
                    .setParameter("trangThai", "THANH_CONG")
                    .getSingleResult();

            if (soLanThanhToanThanhCong != null && soLanThanhToanThanhCong > 0) {
                tx.rollback();
                return false;
            }

            ThanhToan thanhToan = new ThanhToan();
            thanhToan.setId(isBlank(payId) ? taoMa(em, "TT", "ThanhToan") : payId.trim());
            thanhToan.setVe(ve);
            thanhToan.setPhuongThuc(isBlank(method) ? "QR_DEMO" : method.trim());
            thanhToan.setTongTien(tongTienVe);
            thanhToan.setNgayThanhToan(new Date());
            thanhToan.setTrangThai("THANH_CONG");

            ve.setTrangThaiVe("DA_THANH_TOAN");

            List<ChiTietVe> dsChiTietVe = layChiTietVeTheoVe(em, ticketId);
            for (ChiTietVe chiTietVe : dsChiTietVe) {
                GheChuyen gheChuyen = chiTietVe.getGheChuyen();
                if (gheChuyen != null) {
                    gheChuyen.setTrangThaiGheNgoi("DA_BAN");
                }
            }

            em.persist(thanhToan);
            tx.commit();
            return true;

        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            e.printStackTrace();
            return false;

        } finally {
            em.close();
        }
    }

    public boolean cancelTicket(String ticketId) {
        EntityManager em = HibernateUtil.getEntityManager();
        EntityTransaction tx = em.getTransaction();

        try {
            tx.begin();

            Ve ve = em.find(Ve.class, ticketId, LockModeType.PESSIMISTIC_WRITE);
            if (ve == null) {
                tx.rollback();
                return false;
            }

            if (!"CHO_THANH_TOAN".equals(ve.getTrangThaiVe())) {
                tx.rollback();
                return false;
            }

            ve.setTrangThaiVe("DA_HUY");

            List<ChiTietVe> dsChiTietVe = layChiTietVeTheoVe(em, ticketId);
            for (ChiTietVe chiTietVe : dsChiTietVe) {
                GheChuyen gheChuyen = chiTietVe.getGheChuyen();
                if (gheChuyen != null) {
                    gheChuyen.setTrangThaiGheNgoi("TRONG");
                }
            }

            tx.commit();
            return true;

        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            e.printStackTrace();
            return false;

        } finally {
            em.close();
        }
    }

    public boolean createReview(String reviewId, String ticketId, int stars, String content) {
        EntityManager em = HibernateUtil.getEntityManager();
        EntityTransaction tx = em.getTransaction();

        try {
            tx.begin();

            if (stars < 1 || stars > 5) {
                tx.rollback();
                return false;
            }

            Ve ve = em.find(Ve.class, ticketId);
            if (ve == null || !"HOAN_THANH".equals(ve.getTrangThaiVe())) {
                tx.rollback();
                return false;
            }

            Long soDanhGia = em.createQuery(
                    "SELECT COUNT(d) FROM DanhGia d WHERE d.ve.id = :idVe", Long.class)
                    .setParameter("idVe", ticketId)
                    .getSingleResult();

            if (soDanhGia != null && soDanhGia > 0) {
                tx.rollback();
                return false;
            }

            DanhGia danhGia = new DanhGia();
            danhGia.setId(isBlank(reviewId) ? taoMa(em, "DG", "DanhGia") : reviewId.trim());
            danhGia.setVe(ve);
            danhGia.setSoSao(stars);
            danhGia.setNoiDung(content);
            danhGia.setThoiGianDanhGia(new Date());

            em.persist(danhGia);
            tx.commit();
            return true;

        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            e.printStackTrace();
            return false;

        } finally {
            em.close();
        }
    }

    public boolean replyReview(String reviewId, String replyContent) {
        return replyReview(reviewId, null, replyContent);
    }

    public boolean replyReview(String reviewId, String adminId, String replyContent) {
        EntityManager em = HibernateUtil.getEntityManager();
        EntityTransaction tx = em.getTransaction();

        try {
            tx.begin();

            DanhGia danhGia = em.find(DanhGia.class, reviewId, LockModeType.PESSIMISTIC_WRITE);
            if (danhGia == null) {
                tx.rollback();
                return false;
            }

            if (!isBlank(adminId)) {
                User admin = em.find(User.class, adminId.trim());
                if (admin == null || !"ADMIN".equals(admin.getVaiTro())) {
                    tx.rollback();
                    return false;
                }
                danhGia.setAdminPhanHoi(admin);
            }

            danhGia.setPhanHoi(replyContent);
            danhGia.setThoiGianPhanHoi(new Date());

            tx.commit();
            return true;

        } catch (Exception e) {
            if (tx.isActive()) {
                tx.rollback();
            }
            e.printStackTrace();
            return false;

        } finally {
            em.close();
        }
    }

    private List<ChiTietVe> layChiTietVeTheoVe(EntityManager em, String idVe) {
        return em.createQuery(
                "SELECT c FROM ChiTietVe c WHERE c.ve.id = :idVe", ChiTietVe.class)
                .setParameter("idVe", idVe)
                .getResultList();
    }

    private String taoMa(EntityManager em, String prefix, String entityName) {
        String jpql = "SELECT e.id FROM " + entityName + " e WHERE e.id LIKE :prefix";
        List<String> dsMa = em.createQuery(jpql, String.class)
                .setParameter("prefix", prefix + "%")
                .getResultList();

        int max = 0;
        for (String ma : dsMa) {
            try {
                int so = Integer.parseInt(ma.substring(prefix.length()));
                if (so > max) {
                    max = so;
                }
            } catch (Exception ignored) {
            }
        }

        return prefix + (max + 1);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
