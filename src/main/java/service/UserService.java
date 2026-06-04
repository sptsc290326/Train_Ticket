package service;

import model.User;
import util.HibernateUtil;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class UserService {
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public User findById(String id) {
        EntityManager em = HibernateUtil.getEntityManager();
        try {
            return em.find(User.class, id);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        } finally {
            em.close();
        }
    }

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

    public boolean existsByEmailExceptId(String email, String userId) {
        EntityManager em = HibernateUtil.getEntityManager();
        try {
            TypedQuery<Long> query = em.createQuery(
                    "SELECT COUNT(u) FROM User u WHERE u.email = :email AND u.id <> :userId", Long.class);
            query.setParameter("email", email);
            query.setParameter("userId", userId);
            return query.getSingleResult() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        } finally {
            em.close();
        }
    }

    public boolean existsBySdt(String sdt) {
        EntityManager em = HibernateUtil.getEntityManager();
        try {
            TypedQuery<Long> query = em.createQuery("SELECT COUNT(u) FROM User u WHERE u.sdt = :sdt", Long.class);
            query.setParameter("sdt", sdt);
            return query.getSingleResult() > 0;
        } catch (Exception e) {
            return false;
        } finally {
            em.close();
        }
    }

    public boolean existsBySdtExceptId(String sdt, String userId) {
        EntityManager em = HibernateUtil.getEntityManager();
        try {
            TypedQuery<Long> query = em.createQuery(
                    "SELECT COUNT(u) FROM User u WHERE u.sdt = :sdt AND u.id <> :userId", Long.class);
            query.setParameter("sdt", sdt);
            query.setParameter("userId", userId);
            return query.getSingleResult() > 0;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        } finally {
            em.close();
        }
    }

    public void save(User user) {
        String encodedPassword = passwordEncoder.encode(user.getMatKhau());
        user.setMatKhau(encodedPassword);

        EntityManager em = HibernateUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            em.persist(user);
            em.getTransaction().commit();
        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            e.printStackTrace();
            throw e;
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
        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            e.printStackTrace();
            throw e;
        } finally {
            em.close();
        }
    }

    public void updatePassword(String userId, String newRawPassword) {
        EntityManager em = HibernateUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            User user = em.find(User.class, userId);
            if (user == null) {
                throw new IllegalArgumentException("Tai khoan khong ton tai");
            }
            user.setMatKhau(passwordEncoder.encode(newRawPassword));
            em.merge(user);
            em.getTransaction().commit();
        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            e.printStackTrace();
            throw e;
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
