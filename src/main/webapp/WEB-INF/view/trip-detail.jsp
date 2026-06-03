<%@ page import="model.ChuyenTau" %>
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<%
    ChuyenTau trip = (ChuyenTau) request.getAttribute("trip");
%>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Chi tiết chuyến tàu</title>
</head>
<body>

<%
    if (trip == null) {
%>
    <h2>Không tìm thấy chuyến tàu</h2>
<%
    } else {
%>
    <h2>Chi tiết chuyến tàu</h2>

    <p><b>Mã chuyến:</b> <%= trip.getId() %></p>
    <p><b>Tàu:</b> <%= trip.getTau().getTenTau() %></p>
    <p><b>Tuyến:</b> <%= trip.getTuyenDuong().getTenTD() %></p>
    <p><b>Ga đi:</b> <%= trip.getTuyenDuong().getGaDi().getTenGa() %></p>
    <p><b>Ga đến:</b> <%= trip.getTuyenDuong().getGaDen().getTenGa() %></p>
    <p><b>Khởi hành:</b> <%= trip.getNgayGioKhoiHanh() %></p>
    <p><b>Đến:</b> <%= trip.getNgayGioDen() %></p>
    <p><b>Trạng thái:</b> <%= trip.getTrangThaiChuyen() %></p>

    <a href="<%= request.getContextPath() %>/SeatController?chuyenTauId=<%= trip.getId() %>">Xem ghế</a>
<%
    }
%>

</body>
</html>
