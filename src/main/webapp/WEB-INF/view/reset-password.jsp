<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%
    String token = (String) request.getAttribute("token");
    String error = (String) request.getAttribute("error");
%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Đặt lại mật khẩu</title>
</head>
<body>
    <h2>Đặt lại mật khẩu</h2>

    <% if (error != null) { %>
        <p style="color:red;"><%= error %></p>
    <% } %>

    <form action="<%= request.getContextPath() %>/ResetPasswordController" method="post">
        <input type="hidden" name="token" value="<%= token %>">

        <label>Mật khẩu mới</label><br>
        <input type="password" name="newPassword" required><br><br>

        <label>Nhập lại mật khẩu mới</label><br>
        <input type="password" name="confirmPassword" required><br><br>

        <button type="submit">Đặt lại mật khẩu</button>
    </form>
</body>
</html>
