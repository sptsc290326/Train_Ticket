<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Đăng ký</title>
</head>
<body>

<h2>Đăng ký tài khoản</h2>

<%
    String error = (String) request.getAttribute("error");
    if (error != null) {
%>
    <p style="color:red;"><%= error %></p>
<%
    }
%>

<form action="<%= request.getContextPath() %>/RegisterController" method="post">
    <p>
        <label>Họ tên</label><br>
        <input type="text" name="hoTen" required>
    </p>

    <p>
        <label>Email</label><br>
        <input type="email" name="email" required>
    </p>

    <p>
        <label>Số điện thoại</label><br>
        <input type="text" name="sdt">
    </p>

    <p>
        <label>Mật khẩu</label><br>
        <input type="password" name="matKhau" required>
    </p>

    <p>
        <label>Nhập lại mật khẩu</label><br>
        <input type="password" name="nhapLaiMatKhau" required>
    </p>

    <p>
        <label>CCCD</label><br>
        <input type="text" name="cccd">
    </p>

    <p>
        <label>Ngày sinh</label><br>
        <input type="date" name="ngaySinh">
    </p>

    <p>
        <label>Giới tính</label><br>
        <select name="gioiTinh">
            <option value="true">Nam</option>
            <option value="false">Nữ</option>
        </select>
    </p>

    <button type="submit">Đăng ký</button>
</form>

<p>
    Đã có tài khoản?
    <a href="<%= request.getContextPath() %>/LoginController">Đăng nhập</a>
</p>

</body>
</html>
