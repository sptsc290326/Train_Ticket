package service;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.LockModeType;

import model.ChiTietVe;
import model.GheChuyen;
import model.HanhKhach;
import model.User;
import model.Ve;
import util.HibernateUtil;

public class BookingService {
	private String taoMa(EntityManager em, String maChu, String tenEntity) {
	    String jpql = "SELECT e.id FROM " + tenEntity + " e WHERE e.id LIKE :maChu";
	    List<String> dsMa = em.createQuery(jpql, String.class).setParameter("maChu", maChu + "%").getResultList();
	    int max = 0;
	    for (String ma : dsMa) {
	        try {
	            String maSo = ma.substring(maChu.length());
	            int so = Integer.parseInt(maSo);

	            if (so > max) {
	                max = so;
	            }
	        } catch (Exception e) {
	            // Bỏ qua mã sai định dạng
	        }
	    }

	    return maChu + (max + 1);
	}
	public boolean giuGhe(String idGheChuyen) {
	    EntityManager em = HibernateUtil.getEntityManager();
	    EntityTransaction tx = em.getTransaction();

	    try {
	        tx.begin();

	        GheChuyen gheChuyen = em.find(
	            GheChuyen.class,
	            idGheChuyen,
	            LockModeType.PESSIMISTIC_WRITE
	        );

	        if (gheChuyen == null) {
	            tx.rollback();
	            return false;
	        }

	        if (!"TRONG".equals(gheChuyen.getTrangThaiGheNgoi())) {
	            tx.rollback();
	            return false;
	        }

	        gheChuyen.setTrangThaiGheNgoi("DANG_GIU");

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
	public Ve taoVe(String idNguoiDat, List<String> dsGhe, List<HanhKhach> dsHanhKhach) {
	    EntityManager em = HibernateUtil.getEntityManager();
	    EntityTransaction tx = em.getTransaction();

	    try {
	        tx.begin();

	        if (dsGhe == null || dsHanhKhach == null) {
	            throw new RuntimeException("Danh sach ghe hoac hanh khach bi rong");
	        }

	        if (dsGhe.size() != dsHanhKhach.size()) {
	            throw new RuntimeException("So luong ghe va hanh khach khong khop");
	        }

	        User nguoiDat = em.find(User.class, idNguoiDat);

	        if (nguoiDat == null) {
	            throw new RuntimeException("Khong tim thay nguoi dat ve");
	        }

	        Ve ve = new Ve();
	        ve.setId(taoMa(em, "VE", "Ve"));
	        ve.setNguoiDat(nguoiDat);
	        ve.setNgayDat(new Date());
	        ve.setTongTien(BigDecimal.ZERO);
	        ve.setTrangThaiVe("CHO_THANH_TOAN");

	        em.persist(ve);

	        BigDecimal tongTien = BigDecimal.ZERO;

	        for (int i = 0; i < dsGhe.size(); i++) {
	            String idGheChuyen = dsGhe.get(i);

	            GheChuyen gheChuyen = em.find(
	                GheChuyen.class,
	                idGheChuyen,
	                LockModeType.PESSIMISTIC_WRITE
	            );

	            if (gheChuyen == null) {
	                throw new RuntimeException("Khong tim thay ghe: " + idGheChuyen);
	            }

	            if (!"TRONG".equals(gheChuyen.getTrangThaiGheNgoi())
	                    && !"DANG_GIU".equals(gheChuyen.getTrangThaiGheNgoi())) {
	                throw new RuntimeException("Ghe khong con trong: " + idGheChuyen);
	            }

	            gheChuyen.setTrangThaiGheNgoi("DANG_GIU");

	            HanhKhach hanhKhach = dsHanhKhach.get(i);
	            hanhKhach.setId(taoMa(em, "HK", "HanhKhach"));
	            hanhKhach.setNguoiDatVe(nguoiDat);

	            em.persist(hanhKhach);

	            BigDecimal donGia = gheChuyen.getGia();
	            BigDecimal thanhTien = donGia;
	            ChiTietVe chiTietVe = new ChiTietVe();
	            chiTietVe.setId(taoMa(em, "CTV", "ChiTietVe"));
	            chiTietVe.setVe(ve);
	            chiTietVe.setHanhKhach(hanhKhach);
	            chiTietVe.setGheChuyen(gheChuyen);
	            chiTietVe.setDonGia(donGia);
	            chiTietVe.setThanhTien(thanhTien);

	            em.persist(chiTietVe);

	            tongTien = tongTien.add(thanhTien);
	        }

	        ve.setTongTien(tongTien);

	        tx.commit();
	        return ve;

	    } catch (Exception e) {
	        if (tx.isActive()) {
	            tx.rollback();
	        }

	        e.printStackTrace();
	        return null;

	    } finally {
	        em.close();
	    }
	}
}

