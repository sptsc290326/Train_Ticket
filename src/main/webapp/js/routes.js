/* ==========================================================================
   G7 TRAINTICK - routes.js (Cập nhật CSS mới)
   Xử lý hiển thị danh sách chuyến tàu và đồng bộ bộ lọc tự động
   ========================================================================== */

/* ---- THÔNG BÁO POPUP TOAST ---- */
function showToast(msg, type = 'info') {
  const existing = document.querySelector('.toast-msg');
  if (existing) existing.remove();

  const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', info: 'fa-circle-info' };
  const t = document.createElement('div');
  t.className = `toast-msg ${type}`;
  t.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${msg}`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

/* ---- DỮ LIỆU MẪU CHUYẾN TÀU ---- */
const mockTrains = [
  { id: 'SE1',  name: 'SE1',  dep: '06:00', arr: '12:30', dur: '6g30',  seats: 24, price: '1.200.000đ', coach: 'Ngồi mềm' },
  { id: 'SE3',  name: 'SE3',  dep: '08:15', arr: '14:00', dur: '5g45',  seats: 12, price: '1.150.000đ', coach: 'Ngồi cứng' },
  { id: 'SE5',  name: 'SE5',  dep: '11:30', arr: '18:45', dur: '7g15',  seats: 36, price: '1.300.000đ', coach: 'Ngồi mềm' },
  { id: 'SE7',  name: 'SE7',  dep: '14:15', arr: '20:15', dur: '6g00',  seats: 0,  price: '1.180.000đ', coach: 'Nằm mềm' },
  { id: 'SE19', name: 'SE19', dep: '19:00', arr: '05:30', dur: '10g30', seats: 20, price: '850.000đ',   coach: 'Nằm điều hòa' },
];

/* ---- ĐIỀU HƯỚNG SANG TRANG TICKETS ---- */
function selectTrain(maTau, gioDi, giaVe) {
  localStorage.setItem("maTau", maTau);
  localStorage.setItem("gioDi", gioDi);
  localStorage.setItem("giaVe", giaVe);
  window.location.href = "tickets.html";
}

/* ---- HÀM LỌC CHUYẾN TÀU ĐỘNG (Đồng bộ CSS mới) ---- */
function renderSearchResults(params) {
  const from = params.get('from') || 'Sài Gòn';
  const to   = params.get('to')   || 'Hà Nội';
  const date = params.get('date') || '';

  const container = document.getElementById('trainResults');
  if (!container) return;

  // 1. Lọc theo Giờ khởi hành
  const filterAllGio = document.getElementById('tất-cả-gio')?.checked;
  let activeGios = [];
  if (!filterAllGio) {
    if (document.getElementById('sang')?.checked) activeGios.push('sang');
    if (document.getElementById('chieu')?.checked) activeGios.push('chieu');
    if (document.getElementById('toi')?.checked) activeGios.push('toi');
    if (document.getElementById('dem')?.checked) activeGios.push('dem');
  }

  // 2. Lọc theo Loại ghế
  const filterAllGhe = document.getElementById('all-seat')?.checked;
  let activeGhes = [];
  if (!filterAllGhe) {
    if (document.getElementById('cung')?.checked) activeGhes.push('Ngồi cứng');
    if (document.getElementById('mem')?.checked) activeGhes.push('Ngồi mềm');
    if (document.getElementById('giuong-cung')?.checked) activeGhes.push('Nằm cứng', 'Nằm mềm');
    if (document.getElementById('giuong-mem')?.checked) activeGhes.push('Nằm mềm', 'Nằm điều hòa');
  }

  // 3. Lọc theo Mức giá
  const filterAllGia = document.getElementById('all-price')?.checked;
  let activeGias = [];
  if (!filterAllGia) {
    if (document.getElementById('price-1')?.checked) activeGias.push('duoi-500');
    if (document.getElementById('price-2')?.checked) activeGias.push('500-1000');
    if (document.getElementById('price-3')?.checked) activeGias.push('1000-1500');
    if (document.getElementById('price-4')?.checked) activeGias.push('tren-1500');
  }

  // Thực hiện lọc mảng chuyến tàu
  let filteredTrains = mockTrains.filter(t => {
    let hour = parseInt(t.dep.split(':')[0]);
    let trainPeriod = 'dem';
    if (hour >= 6 && hour < 12) trainPeriod = 'sang';
    else if (hour >= 12 && hour < 18) trainPeriod = 'chieu';
    else if (hour >= 18 && hour < 24) trainPeriod = 'toi';

    if (!filterAllGio && activeGios.length > 0 && !activeGios.includes(trainPeriod)) return false;
    if (!filterAllGhe && activeGhes.length > 0 && !activeGhes.includes(t.coach)) return false;

    let priceNum = parseInt(t.price.replace(/\./g, '').replace('đ', '')) || 0;
    if (!filterAllGia && activeGias.length > 0) {
      let matchPrice = false;
      if (activeGias.includes('duoi-500') && priceNum < 500000) matchPrice = true;
      if (activeGias.includes('500-1000') && priceNum >= 500000 && priceNum <= 1000000) matchPrice = true;
      if (activeGias.includes('1000-1500') && priceNum >= 1000000 && priceNum <= 1500000) matchPrice = true;
      if (activeGias.includes('tren-1500') && priceNum > 1500000) matchPrice = true;
      if (!matchPrice) return false;
    }
    return true;
  });

  if (filteredTrains.length === 0) {
    container.innerHTML = `<div class="text-center p-5 text-muted"><i class="fa-solid fa-train-slash fs-2 mb-2 d-block"></i>Không tìm thấy chuyến tàu nào phù hợp với bộ lọc!</div>`;
    return;
  }

  // ĐÃ ĐỒNG BỘ: Sử dụng toàn bộ cấu trúc class CSS mới của bạn (.train-result-card, .route-timeline, .duration-line...)
  container.innerHTML = filteredTrains.map(t => {
    const isHetCho = t.seats === 0;
    return `
      <div class="train-result-card mb-3" style="${isHetCho ? 'opacity: 0.85;' : ''}">
        <div class="row align-items-center text-center text-md-start">
          <div class="col-md-3 mb-3 mb-md-0">
            <div class="d-flex align-items-center gap-2 justify-content-center justify-content-md-start">
              <i class="fa-solid fa-train ${isHetCho ? 'text-secondary' : 'text-primary'} fs-4"></i>
              <h4 class="fw-bold mb-0 ${isHetCho ? 'text-secondary' : ''}">${t.name}</h4>
            </div>
            <span class="train-badge mt-2">
              ${isHetCho ? 'Hết chỗ' : (t.seats < 15 ? 'Sắp hết chỗ' : 'Còn nhiều chỗ')}
            </span>
          </div>
          <div class="col-md-6 mb-3 mb-md-0">
            <div class="route-timeline px-2">
              <div>
                <div class="time-node ${isHetCho ? 'text-secondary' : ''}">${t.dep}</div>
                <div class="station-name">${from}</div>
              </div>
              <div class="duration-line">
                <span class="duration-text"><i class="fa-regular fa-clock me-1"></i>${t.dur}</span>
              </div>
              <div>
                <div class="time-node ${isHetCho ? 'text-secondary' : ''}">${t.arr}</div>
                <div class="station-name">${to}</div>
              </div>
            </div>
            <div class="${isHetCho ? 'text-danger' : 'text-muted'} small mt-2">
              <i class="fa-solid fa-couch me-1"></i>${isHetCho ? 'Còn 0 ghế trống' : `Còn ${t.seats} ghế trống (${t.coach})`}
            </div>
          </div>
          <div class="col-md-3 text-md-end text-center">
            <div class="small text-muted mb-1">Giá từ</div>
            <div class="price-display ${isHetCho ? 'text-secondary' : ''} mb-3">${t.price}</div>
            ${isHetCho 
              ? `<button class="btn btn-secondary w-100 rounded-3 py-2 disabled" style="background-color: #ebd197; border:none; color:#fff;">Hết chỗ</button>`
              : `<button class="btn text-white fw-bold w-100 rounded-3 py-2" onclick="selectTrain('${t.id}', '${t.dep}', '${t.price}')" style="background-color: #f4b71a;">Chọn chuyến</button>`
            }
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ---- KHỞI CHẠY KHU VỰC TRANG ROUTES ---- */
document.addEventListener("DOMContentLoaded", function() {
    const params = new URLSearchParams(window.location.search);
    const barRoute       = document.getElementById("bar-route");
    const barDate        = document.getElementById("bar-date");
    const barPassengers  = document.getElementById("bar-passengers");

    if (barRoute) {
        const gaDi      = params.get('from') || 'Sài Gòn';
        const gaDen     = params.get('to') || 'Hà Nội';
        const ngayDi    = params.get('date') || '2026-05-15';
        const hanhKhach = params.get('persons') || '1';

        localStorage.setItem("gaDi", gaDi);
        localStorage.setItem("gaDen", gaDen);
        localStorage.setItem("ngayDi", ngayDi);
        localStorage.setItem("hanhKhach", hanhKhach);

        barRoute.innerText = `${gaDi} ➜ ${gaDen}`;
        barPassengers.innerText = `${hanhKhach} hành khách`;
        
        const parts = ngayDi.split("-");
        barDate.innerText = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : ngayDi;

        renderSearchResults(params);

        const allCheckboxes = document.querySelectorAll('.filter-sidebar input[type="checkbox"]');
        allCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                const currentParams = new URLSearchParams(window.location.search);
                renderSearchResults(currentParams);
            });
        });
    }
});