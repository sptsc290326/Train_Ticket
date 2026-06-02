<%@ page import="java.util.List" %>
<%@ page import="model.Ve" %>
<%@ page import="model.ChiTietVe" %>
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<%
    Ve ve = (Ve) request.getAttribute("ve");
    List<ChiTietVe> dsChiTietVe = (List<ChiTietVe>) request.getAttribute("dsChiTietVe");
%>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Chi tiết vé</title>
</head>
<body>

	<%
	    if (ve == null) {
	%>
	    <h2>Không tìm thấy vé</h2>
	<%
	    } else {
	%>
	
	<h2>Chi tiết vé</h2>
	
	<p><b>Mã vé:</b> <%= ve.getId() %></p>
	<p><b>Người đặt:</b> <%= ve.getNguoiDat().getHoTen() %></p>
	<p><b>Ngày đặt:</b> <%= ve.getNgayDat() %></p>
	<p><b>Tổng tiền:</b> <%= ve.getTongTien() %></p>
	<p><b>Trạng thái:</b> <%= ve.getTrangThaiVe() %></p>
	
	<h3>Danh sách hành khách và ghế</h3>
	
	<table border="1" cellpadding="8" cellspacing="0">
	    <tr>
	        <th>Mã chi tiết</th>
	        <th>Hành khách</th>
	        <th>CCCD</th>
	        <th>SĐT</th>
	        <th>Mã ghế chuyến</th>
	        <th>Đơn giá</th>
	        <th>Thành tiền</th>
	    </tr>
	
	    <%
	        if (dsChiTietVe != null) {
	            for (ChiTietVe ct : dsChiTietVe) {
	    %>
	        <tr>
	            <td><%= ct.getId() %></td>
	            <td><%= ct.getHanhKhach().getHoTen() %></td>
	            <td><%= ct.getHanhKhach().getCCCD() %></td>
	            <td><%= ct.getHanhKhach().getSdt() %></td>
	            <td><%= ct.getGheChuyen().getId() %></td>
	            <td><%= ct.getDonGia() %></td>
	            <td><%= ct.getThanhTien() %></td>
	        </tr>
	    <%
	            }
	        }
	    %>
	</table>
	
	<br>
	<a href="<%= request.getContextPath() %>/ticket/list?userId=<%= ve.getNguoiDat().getId() %>">
	    Quay lại danh sách vé
	</a>
	
	<%
	    }
	%>

</body>
</html>