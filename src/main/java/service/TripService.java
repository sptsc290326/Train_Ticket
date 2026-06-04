package service;

import model.ChuyenTau;
import model.GaTau;
import util.HibernateUtil;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import javax.persistence.Query;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

public class TripService {

    public List<GaTau> getAllStations() {
        EntityManager em = HibernateUtil.getEntityManager();
        try {
            TypedQuery<GaTau> query = em.createQuery("FROM GaTau ORDER BY tenGa", GaTau.class);
            return query.getResultList();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        } finally {
            em.close();
        }
    }

    public List<ChuyenTau> searchTrips(String gaDiId, String gaDenId, LocalDate ngayDi) {
        EntityManager em = HibernateUtil.getEntityManager();
        try {
            Date startOfDay = Date.from(ngayDi.atStartOfDay(ZoneId.systemDefault()).toInstant());
            Date endOfDay = Date.from(ngayDi.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant());

            String hql = "SELECT DISTINCT ct FROM ChuyenTau ct " +
                         "JOIN FETCH ct.tuyenDuong td " +
                         "JOIN FETCH ct.tau " +
                         "WHERE td.gaDi.id = :gaDiId " +
                         "AND td.gaDen.id = :gaDenId " +
                         "AND ct.ngayGioKhoiHanh >= :startOfDay AND ct.ngayGioKhoiHanh < :endOfDay " +
                         "AND ct.trangThaiChuyen = 'MO_BAN' " +
                         "ORDER BY ct.ngayGioKhoiHanh";

            TypedQuery<ChuyenTau> query = em.createQuery(hql, ChuyenTau.class);
            query.setParameter("gaDiId", gaDiId);
            query.setParameter("gaDenId", gaDenId);
            query.setParameter("startOfDay", startOfDay);
            query.setParameter("endOfDay", endOfDay);
            return query.getResultList();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        } finally {
            em.close();
        }
    }

    public List<ChuyenTau> getAllAvailableTrips() {
        EntityManager em = HibernateUtil.getEntityManager();
        try {
            TypedQuery<ChuyenTau> query = em.createQuery(
                "SELECT DISTINCT ct FROM ChuyenTau ct " +
                "JOIN FETCH ct.tuyenDuong td " +
                "JOIN FETCH ct.tau " +
                "WHERE ct.trangThaiChuyen = 'MO_BAN' " +
                "ORDER BY ct.ngayGioKhoiHanh", 
                ChuyenTau.class);
            return query.getResultList();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        } finally {
            em.close();
        }
    }

    public ChuyenTau getTripById(String id) {
        EntityManager em = HibernateUtil.getEntityManager();
        try {
            return em.find(ChuyenTau.class, id);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        } finally {
            em.close();
        }
    }

    @SuppressWarnings("unchecked")
    public List<Object[]> getSeatsByTrip(String chuyenTauId) {
        EntityManager em = HibernateUtil.getEntityManager();
        try {
            String sql = "SELECT gc.id, gc.idGhe, g.viTriGhe, t.soToa, t.loaiToa, gc.gia, gc.trangThaiGheNgoi " +
                         "FROM GheChuyen gc " +
                         "JOIN GheNgoi g ON gc.idGhe = g.id " +
                         "JOIN ToaTau t ON g.idToa = t.id " +
                         "WHERE gc.idChuyenTau = :chuyenTauId " +
                         "ORDER BY t.soToa, CAST(g.viTriGhe AS UNSIGNED)";

            Query query = em.createNativeQuery(sql);
            query.setParameter("chuyenTauId", chuyenTauId);
            return (List<Object[]>) query.getResultList();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        } finally {
            em.close();
        }
    }
}