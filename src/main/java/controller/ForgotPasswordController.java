package controller;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.UUID;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import model.User;
import service.UserService;

@WebServlet("/ForgotPasswordController")
public class ForgotPasswordController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private UserService userService = new UserService();

    public ForgotPasswordController() {
        super();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.getRequestDispatcher("/WEB-INF/view/forgot-password.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String email = request.getParameter("email");
        
        if (email == null || email.trim().isEmpty()) {
            request.setAttribute("error", "Vui lòng nhập email");
            request.getRequestDispatcher("/WEB-INF/view/forgot-password.jsp").forward(request, response);
            return;
        }
        
        User user = userService.findByEmail(email);
        
        if (user == null) {
            request.setAttribute("error", "Email không tồn tại trong hệ thống");
            request.getRequestDispatcher("/WEB-INF/view/forgot-password.jsp").forward(request, response);
            return;
        }
        

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setTokenExpiry(LocalDateTime.now().plusHours(1));
        userService.update(user);

        String resetLink = request.getScheme() + "://" + request.getServerName() + ":" + 
                           request.getServerPort() + request.getContextPath() + 
                           "/ResetPasswordController?token=" + token;
        
        System.out.println("========================================");
        System.out.println("LINK ĐẶT LẠI MẬT KHẨU CHO: " + email);
        System.out.println(resetLink);
        System.out.println("========================================");
        
        request.setAttribute("message", "Link đặt lại mật khẩu đã được gửi (kiểm tra console log)");
        request.getRequestDispatcher("/WEB-INF/view/forgot-password.jsp").forward(request, response);
    }
}