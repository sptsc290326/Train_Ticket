package service;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.EntityManager;

import model.ChiTietVe;
import model.Ve;
import util.HibernateUtil;

public class TicketService {
    public List<Ve> layVeTheoNguoiDat(String idNguoiDat) {
        EntityManager em = HibernateUtil.getEntityManager();

        try {
            String jpql = "SELECT v FROM Ve v WHERE v.nguoiDat.id = :idNguoiDat ORDER BY v.ngayDat DESC";

            return em.createQuery(jpql, Ve.class)
                    .setParameter("idNguoiDat", idNguoiDat)
                    .getResultList();

        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<Ve>();

        } finally {
            em.close();
        }
    }

    public Ve layChiTietVe(String idVe) {
        EntityManager em = HibernateUtil.getEntityManager();

        try {
            return em.find(Ve.class, idVe);

        } catch (Exception e) {
            e.printStackTrace();
            return null;

        } finally {
            em.close();
        }
    }

    public List<ChiTietVe> layDSChiTietVe(String idVe) {
        EntityManager em = HibernateUtil.getEntityManager();

        try {
            String jpql = "SELECT c FROM ChiTietVe c WHERE c.ve.id = :idVe";

            return em.createQuery(jpql, ChiTietVe.class).setParameter("idVe", idVe).getResultList();

        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<ChiTietVe>();

        } finally {
            em.close();
        }
    }
}
