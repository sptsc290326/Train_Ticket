<%@page import="java.util.List"%>
<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%@ page import="model.Ve" %>
<%
    List<Ve> dsVe = (List<Ve>) request.getAttribute("dsVe");
    String userId = (String) request.getAttribute("userId");
%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Danh sách vé</title>
</head>
<body>
	<h2>Danh sách vé của người dùng: <%= userId %></h2>
	
	<%if (dsVe == null || dsVe.isEmpty()) {
%>
	    <p>Chưa có vé nào.</p>
	<%
	    } else {
	%>
	
	<table border="1" cellpadding="8" cellspacing="0">
	    <tr>
	        <th>Mã vé</th>
	        <th>Ngày đặt</th>
	        <th>Tổng tiền</th>
	        <th>Trạng thái</th>
	        <th>Chi tiết</th>
	    </tr>
	
	    <%
	        for (Ve ve : dsVe) {
	    %>
	        <tr>
	            <td><%= ve.getId() %></td>
	            <td><%= ve.getNgayDat() %></td>
	            <td><%= ve.getTongTien() %></td>
	            <td><%= ve.getTrangThaiVe() %></td>
	            <td>
	                <a href="<%= request.getContextPath() %>/ticket/detail?idVe=<%= ve.getId() %>">
	                    Xem
	                </a>
	            </td>
	        </tr>
	    <%
	        }
	    %>
	</table>
	
	<%
	    }
	%>
	
	<br>
	<a href="<%= request.getContextPath() %>/index.jsp">Về trang chủ</a>
</body>
</html>