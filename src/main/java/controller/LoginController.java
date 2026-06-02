package controller;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import model.User;
import service.UserService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@WebServlet("/LoginController")
public class LoginController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private UserService userService = new UserService();
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public LoginController() {
        super();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.getRequestDispatcher("/WEB-INF/view/login.jsp").forward(request, response);
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        System.out.println("=== BẮT ĐẦU ĐĂNG NHẬP ===");
        
        String email = request.getParameter("email");
        String password = request.getParameter("password");

        System.out.println("=== Email: " + email);
        System.out.println("=== Password nhập: " + password);

        User user = userService.findByEmail(email);
        
        System.out.println("=== Tìm thấy user: " + (user != null ? user.getEmail() : "null"));
        
        boolean passwordMatch = false;
        if (user != null) {
            System.out.println("=== Password trong DB: " + user.getMatKhau());
            passwordMatch = passwordEncoder.matches(password, user.getMatKhau());
            System.out.println("=== So sánh BCrypt: " + (passwordMatch ? "ĐÚNG" : "SAI"));
        }

        if (user == null || !passwordMatch) {
            System.out.println("=== ĐĂNG NHẬP THẤT BẠI!");
            request.setAttribute("error", "Email hoặc mật khẩu không chính xác");
            request.getRequestDispatcher("/WEB-INF/view/login.jsp").forward(request, response);
            return;
        }

        System.out.println("=== ĐĂNG NHẬP THÀNH CÔNG!");
        HttpSession session = request.getSession();
        session.setAttribute("userId", user.getId());
        session.setAttribute("hoTen", user.getHoTen());
        session.setAttribute("vaiTro", user.getVaiTro());

        response.sendRedirect(request.getContextPath() + "/HomeController");
    }
}