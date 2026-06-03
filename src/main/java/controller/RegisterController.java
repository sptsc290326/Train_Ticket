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

    private final UserService userService = new UserService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.getRequestDispatcher("/WEB-INF/view/register.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        String hoTen = trim(request.getParameter("hoTen"));
        String email = trim(request.getParameter("email"));
        String sdt = trim(request.getParameter("sdt"));
        String matKhau = request.getParameter("matKhau");
        String nhapLaiMatKhau = request.getParameter("nhapLaiMatKhau");
        String cccd = trim(request.getParameter("cccd"));
        String ngaySinhStr = trim(request.getParameter("ngaySinh"));
        String gioiTinhStr = trim(request.getParameter("gioiTinh"));

        if (isBlank(hoTen)) {
            forwardError(request, response, "Họ tên không được để trống");
            return;
        }

        if (isBlank(email)) {
            forwardError(request, response, "Email không được để trống");
            return;
        }

        if (matKhau == null || matKhau.length() < 6) {
            forwardError(request, response, "Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        if (nhapLaiMatKhau != null && !matKhau.equals(nhapLaiMatKhau)) {
            forwardError(request, response, "Mật khẩu nhập lại không khớp");
            return;
        }

        if (userService.existsByEmail(email)) {
            forwardError(request, response, "Email đã được đăng ký");
            return;
        }

        if (!isBlank(sdt) && userService.existsBySdt(sdt)) {
            forwardError(request, response, "Số điện thoại đã được đăng ký");
            return;
        }

        try {
            User user = new User();
            user.setId(taoMaUserMoi());
            user.setHoTen(hoTen);
            user.setEmail(email);
            user.setSdt(nullIfBlank(sdt));
            user.setMatKhau(matKhau);
            user.setCCCD(nullIfBlank(cccd));
            user.setVaiTro("KHACH_HANG");

            if (!isBlank(ngaySinhStr)) {
                user.setNgaySinh(java.sql.Date.valueOf(LocalDate.parse(ngaySinhStr)));
            }

            if (!isBlank(gioiTinhStr)) {
                user.setGioiTinh(Boolean.parseBoolean(gioiTinhStr));
            }

            userService.save(user);
            response.sendRedirect(request.getContextPath()
                    + "/LoginController?success=Đăng ký thành công, vui lòng đăng nhập");

        } catch (Exception e) {
            e.printStackTrace();
            forwardError(request, response, "Đăng ký thất bại: " + e.getMessage());
        }
    }

    private String taoMaUserMoi() {
        String lastId = userService.getLastId();
        int newIdNum = 1;

        if (lastId != null && lastId.length() > 1) {
            try {
                newIdNum = Integer.parseInt(lastId.substring(1)) + 1;
            } catch (NumberFormatException ignored) {
                newIdNum = 1;
            }
        }

        return String.format("U%02d", newIdNum);
    }

    private void forwardError(HttpServletRequest request, HttpServletResponse response, String error)
            throws ServletException, IOException {
        request.setAttribute("error", error);
        request.getRequestDispatcher("/WEB-INF/view/register.jsp").forward(request, response);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String trim(String value) {
        return value == null ? null : value.trim();
    }

    private String nullIfBlank(String value) {
        return isBlank(value) ? null : value.trim();
    }
}
