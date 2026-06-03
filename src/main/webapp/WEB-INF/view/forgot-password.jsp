<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Quên mật khẩu</title>
</head>
<body>
    <h2>Quên mật khẩu</h2>

    <%
        String error = (String) request.getAttribute("error");
        String message = (String) request.getAttribute("message");
        String resetLink = (String) request.getAttribute("resetLink");
    %>

    <% if (error != null) { %>
        <p style="color:red;"><%= error %></p>
    <% } %>

    <% if (message != null) { %>
        <p style="color:green;"><%= message %></p>
    <% } %>

    <% if (resetLink != null) { %>
        <p>Link demo:</p>
        <p><a href="<%= resetLink %>"><%= resetLink %></a></p>
    <% } %>

    <form action="<%= request.getContextPath() %>/ForgotPasswordController" method="post">
        <label>Email</label><br>
        <input type="email" name="email" required><br><br>
        <button type="submit">Tạo link đặt lại mật khẩu</button>
    </form>

    <p><a href="<%= request.getContextPath() %>/LoginController">Quay lại đăng nhập</a></p>
</body>
</html>
