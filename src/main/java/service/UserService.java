package service;

import model.User;
import util.HibernateUtil;
import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class UserService {
    
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User findByEmail(String email) {
        EntityManager em = HibernateUtil.getEntityManager();
        try {
            TypedQuery<User> query = em.createQuery("FROM User WHERE email = :email", User.class);
            query.setParameter("email", email);
            return query.getResultList().stream().findFirst().orElse(null);
        } catch (Exception e) {
            e.printStackTrace(); 
            return null;
        } finally {
            em.close();
        }
    }

    public boolean existsByEmail(String email) {
        return findByEmail(email) != null;
    }

    public boolean existsBySdt(String sdt) {
        EntityManager em = HibernateUtil.getEntityManager();
        try {
            TypedQuery<Long> query = em.createQuery("SELECT COUNT(*) FROM User WHERE sdt = :sdt", Long.class);
            query.setParameter("sdt", sdt);
            return query.getSingleResult() > 0;
        } catch (Exception e) {
            return false;
        } finally {
            em.close();
        }
    }


    public void save(User user) {
        String encodedPassword = passwordEncoder.encode(user.getMatKhau());
        user.setMatKhau(encodedPassword);
        System.out.println("=== Mật khẩu đã mã hóa: " + encodedPassword);
        
        EntityManager em = HibernateUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            em.persist(user);
            em.getTransaction().commit();
            System.out.println("=== Lưu user thành công!");
        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            System.out.println("=== LỖI khi lưu: " + e.getMessage());
            e.printStackTrace();
        } finally {
            em.close();
        }
    }
    
    public String getLastId() {
        EntityManager em = HibernateUtil.getEntityManager();
        try {
            TypedQuery<String> query = em.createQuery("SELECT u.id FROM User u ORDER BY u.id DESC", String.class);
            query.setMaxResults(1);
            return query.getResultList().stream().findFirst().orElse(null);
        } catch (Exception e) {
            return null;
        } finally {
            em.close();
        }
    }
    
    public boolean checkPassword(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }
    
    public void update(User user) {
        EntityManager em = HibernateUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            em.merge(user);
            em.getTransaction().commit();
            System.out.println("=== Cập nhật user thành công: " + user.getEmail());
        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            System.out.println("=== LỖI cập nhật: " + e.getMessage());
            e.printStackTrace();
        } finally {
            em.close();
        }
    }
    
    public User findByResetToken(String token) {
        EntityManager em = HibernateUtil.getEntityManager();
        try {
            TypedQuery<User> query = em.createQuery("FROM User WHERE resetToken = :token", User.class);
            query.setParameter("token", token);
            return query.getResultList().stream().findFirst().orElse(null);
        } catch (Exception e) {
            return null;
        } finally {
            em.close();
        }
    }
}