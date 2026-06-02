package controller;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import service.TrainTickService;

@WebServlet("/ProfileController")
public class ProfileController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private TrainTickService service = new TrainTickService();

    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        
        String id = request.getParameter("userId"); // Nhận 'USER01' từ SQL
        String name = request.getParameter("hoTen");
        String phone = request.getParameter("sdt");
        String email = request.getParameter("email");
        
        boolean success = service.updateProfile(id, name, phone, email);
        String message = success ? "Cập nhật hồ sơ thành công cho tài khoản " + id : "Lỗi: Không tìm thấy người dùng!";
        
        request.setAttribute("msg", message);
        request.getRequestDispatcher("index.jsp").forward(request, response);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        doPost(request, response);
    }
}