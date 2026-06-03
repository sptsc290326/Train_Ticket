<%@ page import="java.util.List" %>
<%@ page import="model.ChuyenTau" %>
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<%
    List<ChuyenTau> trips = (List<ChuyenTau>) request.getAttribute("trips");
%>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Danh sách chuyến tàu</title>
</head>
<body>

<h2>Danh sách chuyến tàu đang mở bán</h2>

<p>
    <a href="<%= request.getContextPath() %>/TripController?action=search">Tìm chuyến tàu</a>
</p>

<%
    if (trips == null || trips.isEmpty()) {
%>
    <p>Không có chuyến tàu nào.</p>
<%
    } else {
%>
<table border="1" cellpadding="8" cellspacing="0">
    <tr>
        <th>Mã chuyến</th>
        <th>Tàu</th>
        <th>Tuyến</th>
        <th>Ga đi</th>
        <th>Ga đến</th>
        <th>Khởi hành</th>
        <th>Trạng thái</th>
        <th>Thao tác</th>
    </tr>
    <%
        for (ChuyenTau ct : trips) {
    %>
    <tr>
        <td><%= ct.getId() %></td>
        <td><%= ct.getTau().getTenTau() %></td>
        <td><%= ct.getTuyenDuong().getTenTD() %></td>
        <td><%= ct.getTuyenDuong().getGaDi().getTenGa() %></td>
        <td><%= ct.getTuyenDuong().getGaDen().getTenGa() %></td>
        <td><%= ct.getNgayGioKhoiHanh() %></td>
        <td><%= ct.getTrangThaiChuyen() %></td>
        <td>
            <a href="<%= request.getContextPath() %>/SeatController?chuyenTauId=<%= ct.getId() %>">Xem ghế</a>
        </td>
    </tr>
    <%
        }
    %>
</table>
<%
    }
%>

</body>
</html>
