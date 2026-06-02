function detectBaseUrl() {
    const input = document.getElementById('baseUrl');
    const parts = window.location.pathname.split('/').filter(Boolean);

    if (window.location.port === '8080' && parts.length > 0) {
        input.value = window.location.origin + '/' + parts[0];
    }
}

function getBaseUrl() {
    return document.getElementById('baseUrl').value.replace(/\/$/, '');
}

function backendUrl(path) {
    return getBaseUrl() + path;
}

function getSeatList() {
    return document.getElementById('seatIds').value
        .split(',')
        .map(item => item.trim())
        .filter(item => item.length > 0);
}

function createHiddenInput(name, value) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    return input;
}

function buildPassengerFields() {
    const container = document.getElementById('passengerContainer');
    const seats = getSeatList();

    container.innerHTML = '';

    if (seats.length === 0) {
        alert('Bạn chưa nhập ghế. Ví dụ: GC001 hoặc GC001,GC002');
        return;
    }

    seats.forEach((seatId, index) => {
        const box = document.createElement('div');
        box.className = 'passenger-box';

        box.innerHTML = `
            <h3>Hành khách ${index + 1} - Ghế ${seatId}</h3>
            <input type="hidden" name="seatIds" value="${seatId}">

            <label>Họ tên</label>
            <input name="hoTen" type="text" value="Nguyen Van A ${index + 1}" required>

            <label>CCCD</label>
            <input name="CCCD" type="text" value="09900000000${index + 1}">

            <label>Ngày sinh</label>
            <input name="ngaySinh" type="date" value="2000-01-01">

            <label>Số điện thoại</label>
            <input name="sdt" type="text" value="090000000${index + 1}">
        `;

        container.appendChild(box);
    });
}

async function holdSeatByFetch() {
    const result = document.getElementById('holdSeatResult');
    const idGheChuyen = document.getElementById('holdSeatId').value.trim();

    if (!idGheChuyen) {
        result.textContent = 'Chưa nhập mã ghế chuyến.';
        return;
    }

    const url = backendUrl('/booking/hold-seat?idGheChuyen=' + encodeURIComponent(idGheChuyen));

    result.textContent = 'Đang gửi: ' + url;

    try {
        const response = await fetch(url, {
            method: 'POST'
        });

        const text = await response.text();
        result.textContent = text;
    } catch (error) {
        result.textContent = 'Fetch lỗi. Nếu bạn mở bằng VS Code Live Server, lỗi này thường do CORS. Hãy dán file vào webapp và chạy qua Tomcat.\n\n' + error;
    }
}

function loadTicketList() {
    const userId = document.getElementById('listUserId').value.trim();
    document.getElementById('backendFrame').src = backendUrl('/ticket/list?userId=' + encodeURIComponent(userId));
}

function openTicketList() {
    const userId = document.getElementById('listUserId').value.trim();
    window.open(backendUrl('/ticket/list?userId=' + encodeURIComponent(userId)), '_blank');
}

function loadTicketDetail() {
    const idVe = document.getElementById('ticketId').value.trim();
    document.getElementById('backendFrame').src = backendUrl('/ticket/detail?idVe=' + encodeURIComponent(idVe));
}

function openTicketDetail() {
    const idVe = document.getElementById('ticketId').value.trim();
    window.open(backendUrl('/ticket/detail?idVe=' + encodeURIComponent(idVe)), '_blank');
}

function setupForms() {
    const holdSeatForm = document.getElementById('holdSeatForm');
    holdSeatForm.addEventListener('submit', function () {
        const idGheChuyen = document.getElementById('holdSeatId').value.trim();
        holdSeatForm.action = backendUrl('/booking/hold-seat?idGheChuyen=' + encodeURIComponent(idGheChuyen));
    });

    const bookingForm = document.getElementById('bookingForm');
    bookingForm.addEventListener('submit', function (event) {
        const passengerContainer = document.getElementById('passengerContainer');

        if (passengerContainer.children.length === 0) {
            event.preventDefault();
            alert('Bấm "Tạo ô nhập hành khách" trước khi gửi tạo vé.');
            return;
        }

        bookingForm.action = backendUrl('/booking/create');
    });
}

window.addEventListener('DOMContentLoaded', function () {
    detectBaseUrl();
    setupForms();
    buildPassengerFields();

    document.getElementById('buildPassengerBtn').addEventListener('click', buildPassengerFields);
    document.getElementById('holdSeatFetchBtn').addEventListener('click', holdSeatByFetch);
    document.getElementById('loadTicketListBtn').addEventListener('click', loadTicketList);
    document.getElementById('openTicketListBtn').addEventListener('click', openTicketList);
    document.getElementById('loadTicketDetailBtn').addEventListener('click', loadTicketDetail);
    document.getElementById('openTicketDetailBtn').addEventListener('click', openTicketDetail);
});
