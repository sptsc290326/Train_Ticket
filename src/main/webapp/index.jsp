<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Test TrainTick</title>
</head>
<body>

<h2>Test chức năng đặt vé</h2>

<h3>1. Giữ ghế</h3>

<form action="<%= request.getContextPath() %>/booking/hold-seat" method="post">
    <label>Mã ghế chuyến:</label>
    <input type="text" name="idGheChuyen" value="GC001">
    <button type="submit">Giữ ghế</button>
</form>

<hr>

<h3>2. Nhập hành khách để tạo vé</h3>

<a href="<%= request.getContextPath() %>/booking/create?userId=U02&seatIds=GC008">
    Tạo vé với 1 ghế GC008
</a>

<br><br>

<a href="<%= request.getContextPath() %>/booking/create?userId=U02&seatIds=GC001,GC002">
    Tạo vé với 2 ghế GC001, GC002
</a>

<hr>

<h3>3. Xem vé</h3>

<a href="<%= request.getContextPath() %>/ticket/list?userId=U02">
    Xem danh sách vé của U02
</a>

<br><br>

<a href="<%= request.getContextPath() %>/ticket/detail?idVe=VE01">
    Xem chi tiết vé VE01
</a>

</body>
</html>