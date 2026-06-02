package controller;

import java.io.IOException;
import java.time.LocalDateTime;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import model.User;
import service.UserService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@WebServlet("/ResetPasswordController")
public class ResetPasswordController extends HttpServlet {
    private UserService userService = new UserService();
    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        
        String token = req.getParameter("token");
        User user = userService.findByResetToken(token);
        
        if (user == null || user.getTokenExpiry() == null || user.getTokenExpiry().isBefore(LocalDateTime.now())) {
            req.setAttribute("error", "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn");
            req.getRequestDispatcher("/WEB-INF/view/forgot-password.jsp").forward(req, resp);
            return;
        }
        
        req.setAttribute("token", token);
        req.getRequestDispatcher("/WEB-INF/view/reset-password.jsp").forward(req, resp);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        
        String token = req.getParameter("token");
        String newPassword = req.getParameter("newPassword");
        String confirmPassword = req.getParameter("confirmPassword");
        
        if (!newPassword.equals(confirmPassword)) {
            req.setAttribute("error", "Mật khẩu xác nhận không khớp");
            req.setAttribute("token", token);
            req.getRequestDispatcher("/WEB-INF/view/reset-password.jsp").forward(req, resp);
            return;
        }
        
        if (newPassword.length() < 6) {
            req.setAttribute("error", "Mật khẩu phải có ít nhất 6 ký tự");
            req.setAttribute("token", token);
            req.getRequestDispatcher("/WEB-INF/view/reset-password.jsp").forward(req, resp);
            return;
        }
        
        User user = userService.findByResetToken(token);
        
        if (user == null || user.getTokenExpiry() == null || user.getTokenExpiry().isBefore(LocalDateTime.now())) {
            req.setAttribute("error", "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn");
            req.getRequestDispatcher("/WEB-INF/view/forgot-password.jsp").forward(req, resp);
            return;
        }
        
        user.setMatKhau(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setTokenExpiry(null);
        userService.update(user);
        
        req.setAttribute("message", "Đặt lại mật khẩu thành công! Vui lòng đăng nhập.");
        req.getRequestDispatcher("/WEB-INF/view/login.jsp").forward(req, resp);
    }
}