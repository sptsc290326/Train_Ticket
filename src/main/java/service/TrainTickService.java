package service;

import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import java.math.BigDecimal;
import java.util.Date;
import util.HibernateUtil;
import model.*;

public class TrainTickService {

    // 1. Cập nhật hồ sơ
    public boolean updateProfile(String userId, String name, String phone, String email) {
        EntityManager em = HibernateUtil.getEntityManager();
        EntityTransaction tx = em.getTransaction();
        try {
            tx.begin();
            User user = em.find(User.class, userId);
            if (user != null) {
                user.setHoTen(name);
                user.setSoDienThoai(phone);
                user.setEmail(email);
                em.merge(user);
                tx.commit();
                return true;
            }
        } catch (Exception e) {
            if (tx.isActive()) tx.rollback();
            e.printStackTrace();
        } finally { em.close(); }
        return false;
    }

    // 2. Thanh toán hóa đơn đặt vé
    public boolean processPayment(String payId, String ticketId, String method, double amount) {
        EntityManager em = HibernateUtil.getEntityManager();
        EntityTransaction tx = em.getTransaction();
        try {
            tx.begin();
            Ve ve = em.find(Ve.class, ticketId);
            if (ve != null) {
                ThanhToan tt = new ThanhToan();
                tt.setId(payId);
                tt.setVe(ve);
                tt.setPhuongThuc(method);
                tt.setTongTien(BigDecimal.valueOf(amount));
                tt.setNgayThanhToan(new Date());
                tt.setTrangThai("THANH_CONG");
                
                ve.setTrangThai("DA_THANH_TOAN");
                
                em.persist(tt);
                em.merge(ve);
                tx.commit();
                return true;
            }
        } catch (Exception e) {
            if (tx.isActive()) tx.rollback();
            e.printStackTrace();
        } finally { em.close(); }
        return false;
    }

    // 3. Hủy vé tàu
    public boolean cancelTicket(String ticketId) {
        EntityManager em = HibernateUtil.getEntityManager();
        EntityTransaction tx = em.getTransaction();
        try {
            tx.begin();
            Ve ve = em.find(Ve.class, ticketId);
            if (ve != null) {
                ve.setTrangThai("DA_HUY");
                em.merge(ve);
                tx.commit();
                return true;
            }
        } catch (Exception e) {
            if (tx.isActive()) tx.rollback();
            e.printStackTrace();
        } finally { em.close(); }
        return false;
    }

    // 4. Gửi đánh giá dịch vụ
    public boolean createReview(String reviewId, String userId, String trainId, int stars, String content) {
        EntityManager em = HibernateUtil.getEntityManager();
        EntityTransaction tx = em.getTransaction();
        try {
            tx.begin();
            User user = em.find(User.class, userId);
            if (user != null) {
                DanhGia dg = new DanhGia();
                dg.setId(reviewId);
                dg.setUser(user);
                dg.setIdChuyenTau(trainId);
                dg.setSoSao(stars);
                dg.setNoiDung(content);
                dg.setNgayDanhGia(new Date());
                
                em.persist(dg);
                tx.commit();
                return true;
            }
        } catch (Exception e) {
            if (tx.isActive()) tx.rollback();
            e.printStackTrace();
        } finally { em.close(); }
        return false;
    }

    // 5. Phản hồi đánh giá
    public boolean replyReview(String reviewId, String replyContent) {
        EntityManager em = HibernateUtil.getEntityManager();
        EntityTransaction tx = em.getTransaction();
        try {
            tx.begin();
            DanhGia dg = em.find(DanhGia.class, reviewId);
            if (dg != null) {
                dg.setPhanHoi(replyContent);
                em.merge(dg);
                tx.commit();
                return true;
            }
        } catch (Exception e) {
            if (tx.isActive()) tx.rollback();
            e.printStackTrace();
        } finally { em.close(); }
        return false;
    }
}