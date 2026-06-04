package controller.api;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import com.google.gson.JsonObject;

import model.User;
import service.UserService;

@WebServlet(urlPatterns = { "/api/auth/login", "/api/auth/register", "/api/auth/logout", "/api/auth/me" })
public class ApiAuthController extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private final UserService userService = new UserService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String path = request.getServletPath();

        if ("/api/auth/me".equals(path)) {
            me(request, response);
            return;
        }

        ApiUtil.notFound(response, "API khong ton tai");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        String path = request.getServletPath();

        if ("/api/auth/login".equals(path)) {
            login(request, response);
        } else if ("/api/auth/register".equals(path)) {
            register(request, response);
        } else if ("/api/auth/logout".equals(path)) {
            logout(request, response);
        } else {
            ApiUtil.notFound(response, "API khong ton tai");
        }
    }

    private void me(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            HttpSession session = request.getSession(false);
            if (session == null || session.getAttribute("userId") == null) {
                ApiUtil.unauthorized(response, "Chua dang nhap");
                return;
            }

            String userId = String.valueOf(session.getAttribute("userId"));
            User user = userService.findById(userId);
            if (user == null) {
                session.invalidate();
                ApiUtil.unauthorized(response, "Tai khoan khong con ton tai");
                return;
            }

            session.setAttribute("hoTen", user.getHoTen());
            session.setAttribute("vaiTro", user.getVaiTro());
            ApiUtil.ok(response, userToMap(user));
        } catch (Exception e) {
            e.printStackTrace();
            ApiUtil.serverError(response, "Loi lay thong tin tai khoan: " + e.getMessage());
        }
    }

    private void login(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            JsonObject json = ApiUtil.readJson(request);

            String email = ApiUtil.getString(json, "email");
            if (ApiUtil.isBlank(email)) {
                email = ApiUtil.getString(json, "username");
            }

            String password = ApiUtil.getString(json, "password");
            if (ApiUtil.isBlank(password)) {
                password = ApiUtil.getString(json, "matKhau");
            }

            if (ApiUtil.isBlank(email) || ApiUtil.isBlank(password)) {
                ApiUtil.badRequest(response, "Email va mat khau khong duoc de trong");
                return;
            }

            User user = userService.findByEmail(email);
            if (user == null || !userService.checkPassword(password, user.getMatKhau())) {
                ApiUtil.unauthorized(response, "Email hoac mat khau khong chinh xac");
                return;
            }

            HttpSession session = request.getSession(true);
            session.setAttribute("userId", user.getId());
            session.setAttribute("hoTen", user.getHoTen());
            session.setAttribute("vaiTro", user.getVaiTro());

            ApiUtil.ok(response, userToMap(user));
        } catch (Exception e) {
            e.printStackTrace();
            ApiUtil.serverError(response, "Loi dang nhap: " + e.getMessage());
        }
    }

    private void register(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            JsonObject json = ApiUtil.readJson(request);

            String hoTen = firstNotBlank(ApiUtil.getString(json, "hoTen"), ApiUtil.getString(json, "fullName"));
            String email = ApiUtil.getString(json, "email");
            String sdt = firstNotBlank(ApiUtil.getString(json, "sdt"), ApiUtil.getString(json, "phone"));
            String matKhau = firstNotBlank(ApiUtil.getString(json, "matKhau"), ApiUtil.getString(json, "password"));
            String nhapLaiMatKhau = firstNotBlank(ApiUtil.getString(json, "nhapLaiMatKhau"), ApiUtil.getString(json, "confirmPassword"));
            String cccd = firstNotBlank(ApiUtil.getString(json, "cccd"), ApiUtil.getString(json, "CCCD"));
            String ngaySinhStr = firstNotBlank(ApiUtil.getString(json, "ngaySinh"), ApiUtil.getString(json, "dob"));
            String gioiTinhStr = firstNotBlank(ApiUtil.getString(json, "gioiTinh"), ApiUtil.getString(json, "gender"));

            if (ApiUtil.isBlank(hoTen)) {
                ApiUtil.badRequest(response, "Ho ten khong duoc de trong");
                return;
            }
            if (ApiUtil.isBlank(email)) {
                ApiUtil.badRequest(response, "Email khong duoc de trong");
                return;
            }
            if (matKhau == null || matKhau.length() < 6) {
                ApiUtil.badRequest(response, "Mat khau phai co it nhat 6 ky tu");
                return;
            }
            if (!ApiUtil.isBlank(nhapLaiMatKhau) && !matKhau.equals(nhapLaiMatKhau)) {
                ApiUtil.badRequest(response, "Mat khau nhap lai khong khop");
                return;
            }
            if (userService.existsByEmail(email)) {
                ApiUtil.badRequest(response, "Email da duoc dang ky");
                return;
            }
            if (!ApiUtil.isBlank(sdt) && userService.existsBySdt(sdt)) {
                ApiUtil.badRequest(response, "So dien thoai da duoc dang ky");
                return;
            }

            User user = new User();
            user.setId(taoMaUserMoi());
            user.setHoTen(hoTen);
            user.setEmail(email);
            user.setSdt(emptyToNull(sdt));
            user.setMatKhau(matKhau);
            user.setCCCD(emptyToNull(cccd));
            user.setVaiTro("KHACH_HANG");

            if (!ApiUtil.isBlank(ngaySinhStr)) {
                user.setNgaySinh(java.sql.Date.valueOf(LocalDate.parse(ngaySinhStr)));
            }
            user.setGioiTinh(parseGender(gioiTinhStr));

            userService.save(user);
            ApiUtil.created(response, userToMap(user));
        } catch (Exception e) {
            e.printStackTrace();
            ApiUtil.serverError(response, "Loi dang ky: " + e.getMessage());
        }
    }

    private void logout(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        ApiUtil.ok(response, "Da dang xuat");
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

    public static Map<String, Object> userToMap(User user) {
        Map<String, Object> data = new HashMap<String, Object>();
        data.put("id", user.getId());
        data.put("hoTen", user.getHoTen());
        data.put("email", user.getEmail());
        data.put("sdt", user.getSdt());
        data.put("CCCD", user.getCCCD());
        data.put("gioiTinh", user.getGioiTinh());
        data.put("vaiTro", user.getVaiTro());

        if (user.getNgaySinh() != null) {
            data.put("ngaySinh", new SimpleDateFormat("yyyy-MM-dd").format(user.getNgaySinh()));
        } else {
            data.put("ngaySinh", null);
        }

        return data;
    }

    public static Boolean parseGender(String value) {
        if (ApiUtil.isBlank(value)) return null;
        String v = value.trim().toLowerCase();
        if ("true".equals(v) || "1".equals(v) || "male".equals(v) || "nam".equals(v)) return Boolean.TRUE;
        if ("false".equals(v) || "0".equals(v) || "female".equals(v) || "nu".equals(v) || "nữ".equals(v)) return Boolean.FALSE;
        return null;
    }

    private String firstNotBlank(String a, String b) {
        return !ApiUtil.isBlank(a) ? a : b;
    }

    private String emptyToNull(String value) {
        return ApiUtil.isBlank(value) ? null : value.trim();
    }
}
