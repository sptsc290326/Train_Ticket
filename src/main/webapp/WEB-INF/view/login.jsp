<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Đăng nhập</title>
</head>
<body>

<h2>Đăng nhập</h2>

<%
    String error = (String) request.getAttribute("error");
    if (error != null) {
%>
    <p style="color:red;"><%= error %></p>
<%
    }
%>

<%
    String success = request.getParameter("success");
    if (success != null) {
%>
    <p style="color:green;">Đăng ký thành công, vui lòng đăng nhập.</p>
<%
    }
%>

<form action="<%= request.getContextPath() %>/LoginController" method="post">
    <p>
        <label>Email hoặc SĐT</label><br>
        <input type="text" name="email" required>
    </p>

    <p>
        <label>Mật khẩu</label><br>
        <input type="password" name="password" required>
    </p>

    <button type="submit">Đăng nhập</button>
</form>

<p>
    <a href="<%= request.getContextPath() %>/ForgotPasswordController">Quên mật khẩu?</a>
</p>

<p>
    Chưa có tài khoản?
    <a href="<%= request.getContextPath() %>/RegisterController">Đăng ký</a>
</p>

<p>
    <a href="<%= request.getContextPath() %>/TripController?action=list">Xem chuyến tàu</a>
</p>

</body>
</html>
