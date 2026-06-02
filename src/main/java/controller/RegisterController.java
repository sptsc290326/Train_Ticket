package controller;

import java.io.IOException;
import java.time.LocalDate;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import model.User;
import service.UserService;

@WebServlet("/RegisterController")
public class RegisterController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private UserService userService = new UserService();

    public RegisterController() {
        super();
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.getRequestDispatcher("/WEB-INF/view/register.jsp").forward(request, response);
    }

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        System.out.println("=== 1. BẮT ĐẦU ĐĂNG KÝ ===");
        
        String hoTen = request.getParameter("hoTen");
        String email = request.getParameter("email");
        String sdt = request.getParameter("sdt");
        String matKhau = request.getParameter("matKhau");
        String cccd = request.getParameter("cccd");
        String ngaySinhStr = request.getParameter("ngaySinh");
        String gioiTinhStr = request.getParameter("gioiTinh");

        System.out.println("=== Email: " + email);
        System.out.println("=== Password: " + matKhau);

        if (hoTen == null || hoTen.trim().isEmpty()) {
            request.setAttribute("error", "Họ tên không được để trống");
            request.getRequestDispatcher("/WEB-INF/view/register.jsp").forward(request, response);
            return;
        }
        if (matKhau == null || matKhau.length() < 6) {
            request.setAttribute("error", "Mật khẩu phải có ít nhất 6 ký tự");
            request.getRequestDispatcher("/WEB-INF/view/register.jsp").forward(request, response);
            return;
        }

        System.out.println("=== Kiểm tra email tồn tại...");
        if (userService.existsByEmail(email)) {
            System.out.println("=== Email đã tồn tại!");
            request.setAttribute("error", "Email đã được đăng ký");
            request.getRequestDispatcher("/WEB-INF/view/register.jsp").forward(request, response);
            return;
        }

        System.out.println("=== Tạo user mới...");
        User user = new User();
        user.setHoTen(hoTen);
        user.setEmail(email);
        user.setSdt(sdt);
        user.setMatKhau(matKhau);
        user.setCccd(cccd);
        user.setVaiTro("KHACH_HANG");

        if (ngaySinhStr != null && !ngaySinhStr.isEmpty()) {
            user.setNgaySinh(LocalDate.parse(ngaySinhStr));
        }
        if (gioiTinhStr != null && !gioiTinhStr.isEmpty()) {
            user.setGioiTinh(Boolean.parseBoolean(gioiTinhStr));
        }

        String lastId = userService.getLastId();
        int newIdNum = 1;
        if (lastId != null && lastId.length() > 1) {
            newIdNum = Integer.parseInt(lastId.substring(1)) + 1;
        }
        String newId = String.format("U%02d", newIdNum);
        user.setId(newId);
        System.out.println("=== ID được tạo: " + newId);

        System.out.println("=== Gọi userService.save()...");
        userService.save(user);
        System.out.println("=== Save xong, chuyển hướng về LoginController");

        response.sendRedirect(request.getContextPath() + "/LoginController?success=Đăng ký thành công, vui lòng đăng nhập");
    }
}