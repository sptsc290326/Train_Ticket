package util;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;

public class HibernateUtil {
	private static final EntityManagerFactory emf =Persistence.createEntityManagerFactory("TrainTick");
	private HibernateUtil() {
	}
	public static EntityManager getEntityManager() {
        return emf.createEntityManager();
    }
	public static void close() {
        if (emf != null && emf.isOpen()) {
            emf.close();
        }
    }
}
