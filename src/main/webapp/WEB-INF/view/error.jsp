<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%
    String message = (String) request.getAttribute("message");
    if (message == null) {
        message = "Đã xảy ra lỗi.";
    }
%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Lỗi</title>
</head>
<body>
    <h2>Lỗi</h2>
    <p><%= message %></p>
    <a href="<%= request.getContextPath() %>/TripController?action=list">Quay lại danh sách chuyến</a>
</body>
</html>
