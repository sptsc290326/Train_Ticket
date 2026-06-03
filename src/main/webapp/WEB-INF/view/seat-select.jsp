<%@ page import="java.util.List" %>
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<%
    List<Object[]> seats = (List<Object[]>) request.getAttribute("seats");
    String chuyenTauId = (String) request.getAttribute("chuyenTauId");

    String userId = (String) session.getAttribute("userId");
    if (userId == null || userId.trim().isEmpty()) {
        userId = request.getParameter("userId");
    }
    if (userId == null || userId.trim().isEmpty()) {
        userId = "U02"; // user demo khi chưa làm luồng đăng nhập hoàn chỉnh
    }
%>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Chọn ghế</title>
</head>
<body>

<h2>Danh sách ghế của chuyến: <%= chuyenTauId %></h2>
<p>Người đặt hiện tại: <%= userId %></p>

<%
    if (seats == null || seats.isEmpty()) {
%>
    <p>Không có ghế nào.</p>
<%
    } else {
%>
<table border="1" cellpadding="8" cellspacing="0">
    <tr>
        <th>Mã ghế chuyến</th>
        <th>Mã ghế</th>
        <th>Vị trí</th>
        <th>Toa</th>
        <th>Loại toa</th>
        <th>Giá</th>
        <th>Trạng thái</th>
        <th>Thao tác</th>
    </tr>
    <%
        for (Object[] s : seats) {
            String idGheChuyen = String.valueOf(s[0]);
            String trangThai = String.valueOf(s[6]);
    %>
    <tr>
        <td><%= s[0] %></td>
        <td><%= s[1] %></td>
        <td><%= s[2] %></td>
        <td><%= s[3] %></td>
        <td><%= s[4] %></td>
        <td><%= s[5] %></td>
        <td><%= s[6] %></td>
        <td>
            <%
                if ("TRONG".equals(trangThai)) {
            %>
                <a href="<%= request.getContextPath() %>/booking/create?userId=<%= userId %>&seatIds=<%= idGheChuyen %>">Chọn</a>
            <%
                } else {
            %>
                Không chọn được
            <%
                }
            %>
        </td>
    </tr>
    <%
        }
    %>
</table>
<%
    }
%>

<p><a href="<%= request.getContextPath() %>/TripController?action=list">Quay lại danh sách chuyến</a></p>

</body>
</html>
