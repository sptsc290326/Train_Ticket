package controller;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import service.TrainTickService;

@WebServlet(urlPatterns = { "/ProfileController", "/profile/update" })
public class ProfileController extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private TrainTickService service = new TrainTickService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        String userId = request.getParameter("userId");
        String name = request.getParameter("hoTen");
        String phone = request.getParameter("sdt");
        String email = request.getParameter("email");

        boolean success = service.updateProfile(userId, name, phone, email);

        String message;
        if (success) {
            message = "Cập nhật hồ sơ thành công cho tài khoản " + userId;
        } else {
            message = "Cập nhật hồ sơ thất bại. Không tìm thấy người dùng.";
        }

        request.setAttribute("msg", message);
        request.getRequestDispatcher("/index.jsp").forward(request, response);
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.sendRedirect(request.getContextPath() + "/index.jsp");
    }
}
