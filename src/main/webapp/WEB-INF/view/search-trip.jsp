<%@ page import="java.util.List" %>
<%@ page import="model.GaTau" %>
<%@ page import="model.ChuyenTau" %>
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<%
    List<GaTau> stations = (List<GaTau>) request.getAttribute("stations");
    List<ChuyenTau> trips = (List<ChuyenTau>) request.getAttribute("trips");
    String error = (String) request.getAttribute("error");
    String gaDiId = (String) request.getAttribute("gaDiId");
    String gaDenId = (String) request.getAttribute("gaDenId");
    String ngayDi = (String) request.getAttribute("ngayDi");
%>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Tìm chuyến tàu</title>
</head>
<body>

<h2>Tìm chuyến tàu</h2>

<form action="<%= request.getContextPath() %>/TripController" method="post">
    <input type="hidden" name="action" value="search">

    <p>
        <label>Ga đi</label><br>
        <select name="gaDiId" required>
            <option value="">-- Chọn ga đi --</option>
            <%
                if (stations != null) {
                    for (GaTau ga : stations) {
                        String selected = ga.getId().equals(gaDiId) ? "selected" : "";
            %>
                <option value="<%= ga.getId() %>" <%= selected %>><%= ga.getTenGa() %></option>
            <%
                    }
                }
            %>
        </select>
    </p>

    <p>
        <label>Ga đến</label><br>
        <select name="gaDenId" required>
            <option value="">-- Chọn ga đến --</option>
            <%
                if (stations != null) {
                    for (GaTau ga : stations) {
                        String selected = ga.getId().equals(gaDenId) ? "selected" : "";
            %>
                <option value="<%= ga.getId() %>" <%= selected %>><%= ga.getTenGa() %></option>
            <%
                    }
                }
            %>
        </select>
    </p>

    <p>
        <label>Ngày đi</label><br>
        <input type="date" name="ngayDi" value="<%= ngayDi != null ? ngayDi : "" %>" required>
    </p>

    <button type="submit">Tìm chuyến</button>
</form>

<%
    if (error != null) {
%>
    <p style="color:red;"><%= error %></p>
<%
    }
%>

<h3>Kết quả</h3>

<%
    if (trips != null && !trips.isEmpty()) {
%>
<table border="1" cellpadding="8" cellspacing="0">
    <tr>
        <th>Mã chuyến</th>
        <th>Tàu</th>
        <th>Tuyến</th>
        <th>Khởi hành</th>
        <th>Đến</th>
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
        <td><%= ct.getNgayGioKhoiHanh() %></td>
        <td><%= ct.getNgayGioDen() %></td>
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

<p>
    <a href="<%= request.getContextPath() %>/TripController?action=list">Xem tất cả chuyến đang mở bán</a>
</p>

</body>
</html>
