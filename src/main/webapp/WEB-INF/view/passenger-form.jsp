<%@page import="java.util.List"%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
    
<%
    String userId = (String) request.getAttribute("userId");
    List<String> seatIds = (List<String>) request.getAttribute("seatIds");

    if (seatIds == null || seatIds.isEmpty()) {
%>
        <h3>Không có ghế nào được chọn</h3>
        <a href="index.jsp">Quay lại</a>
<%
        return;
    }
%>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Nhập hành khách</title>
</head>
<body>
	<h2>Nhập thông tin hành khách</h2>

	<form action="<%= request.getContextPath() %>/booking/create" method="post">

    <input type="hidden" name="userId" value="<%= userId %>">

    <%
        for (int i = 0; i < seatIds.size(); i++) {
            String seatId = seatIds.get(i);
    %>

        <hr>

        <h3>Hành khách <%= i + 1 %> - Ghế <%= seatId %></h3>

        <input type="hidden" name="seatIds" value="<%= seatId %>">

        Họ tên:<input type="text" name="hoTen" required>
        <br>

        CCCD:<input type="text" name="CCCD">
        <br>

        Ngày sinh:<input type="date" name="ngaySinh">
        <br>

        Số điện thoại:<input type="text" name="sdt">
        <br>

    <%
        }
    %>

    <button type="submit">Tạo vé</button>
    </form>
</body>
</html>