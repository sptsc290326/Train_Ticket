package controller.api;

import java.io.IOException;
import java.time.LocalDate;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.JsonObject;

import model.User;
import service.UserService;

@WebServlet(urlPatterns = { "/api/users/profile", "/api/users/profile/password" })
public class ApiUserController extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private final UserService userService = new UserService();

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        String path = request.getServletPath();

        if ("/api/users/profile".equals(path)) {
            updateProfile(request, response);
        } else if ("/api/users/profile/password".equals(path)) {
            updatePassword(request, response);
        } else {
            ApiUtil.notFound(response, "API khong ton tai");
        }
    }

    private User getCurrentUser(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            ApiUtil.unauthorized(response, "Chua dang nhap");
            return null;
        }

        User user = userService.findById(String.valueOf(session.getAttribute("userId")));
        if (user == null) {
            session.invalidate();
            ApiUtil.unauthorized(response, "Tai khoan khong con ton tai");
            return null;
        }

        return user;
    }

    private void updateProfile(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            User user = getCurrentUser(request, response);
            if (user == null) return;

            JsonObject json = ApiUtil.readJson(request);

            String hoTen = firstNotBlank(ApiUtil.getString(json, "hoTen"), ApiUtil.getString(json, "fullName"));
            String email = ApiUtil.getString(json, "email");
            String sdt = firstNotBlank(ApiUtil.getString(json, "sdt"), ApiUtil.getString(json, "phone"));
            String ngaySinhStr = firstNotBlank(ApiUtil.getString(json, "ngaySinh"), ApiUtil.getString(json, "dob"));
            String gioiTinhStr = firstNotBlank(ApiUtil.getString(json, "gioiTinh"), ApiUtil.getString(json, "gender"));
            String cccd = firstNotBlank(ApiUtil.getString(json, "cccd"), ApiUtil.getString(json, "CCCD"));

            if (ApiUtil.isBlank(hoTen)) {
                ApiUtil.badRequest(response, "Ho ten khong duoc de trong");
                return;
            }
            if (ApiUtil.isBlank(email)) {
                ApiUtil.badRequest(response, "Email khong duoc de trong");
                return;
            }
            if (userService.existsByEmailExceptId(email, user.getId())) {
                ApiUtil.badRequest(response, "Email da duoc su dung boi tai khoan khac");
                return;
            }
            if (!ApiUtil.isBlank(sdt) && userService.existsBySdtExceptId(sdt, user.getId())) {
                ApiUtil.badRequest(response, "So dien thoai da duoc su dung boi tai khoan khac");
                return;
            }

            user.setHoTen(hoTen);
            user.setEmail(email);
            user.setSdt(ApiUtil.isBlank(sdt) ? null : sdt);
            if (cccd != null) user.setCCCD(ApiUtil.isBlank(cccd) ? null : cccd);

            if (!ApiUtil.isBlank(ngaySinhStr)) {
                user.setNgaySinh(java.sql.Date.valueOf(LocalDate.parse(ngaySinhStr)));
            } else {
                user.setNgaySinh(null);
            }
            user.setGioiTinh(ApiAuthController.parseGender(gioiTinhStr));

            userService.update(user);

            HttpSession session = request.getSession(false);
            if (session != null) {
                session.setAttribute("hoTen", user.getHoTen());
                session.setAttribute("vaiTro", user.getVaiTro());
            }

            ApiUtil.ok(response, ApiAuthController.userToMap(user));
        } catch (Exception e) {
            e.printStackTrace();
            ApiUtil.serverError(response, "Loi cap nhat profile: " + e.getMessage());
        }
    }

    private void updatePassword(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            User user = getCurrentUser(request, response);
            if (user == null) return;

            JsonObject json = ApiUtil.readJson(request);
            String currentPassword = firstNotBlank(ApiUtil.getString(json, "currentPassword"), ApiUtil.getString(json, "matKhauCu"));
            String newPassword = firstNotBlank(ApiUtil.getString(json, "newPassword"), ApiUtil.getString(json, "matKhauMoi"));

            if (ApiUtil.isBlank(currentPassword) || ApiUtil.isBlank(newPassword)) {
                ApiUtil.badRequest(response, "Mat khau khong duoc de trong");
                return;
            }
            if (!userService.checkPassword(currentPassword, user.getMatKhau())) {
                ApiUtil.badRequest(response, "Mat khau hien tai khong dung");
                return;
            }
            if (newPassword.length() <= 6) {
                ApiUtil.badRequest(response, "Mat khau moi phai dai hon 6 ky tu");
                return;
            }

            userService.updatePassword(user.getId(), newPassword);
            ApiUtil.ok(response, "Doi mat khau thanh cong");
        } catch (Exception e) {
            e.printStackTrace();
            ApiUtil.serverError(response, "Loi doi mat khau: " + e.getMessage());
        }
    }

    private String firstNotBlank(String a, String b) {
        return !ApiUtil.isBlank(a) ? a : b;
    }
}
