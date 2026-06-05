/* HTML/JS frontend connector for Java Servlet JSON API */
const API_BASE = "api";

function ttCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch (e) {
    return null;
  }
}

async function ttApi(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  let json = {};
  try {
    json = await res.json();
  } catch (e) {
    json = { success: false, message: "Server không trả JSON hợp lệ" };
  }
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `HTTP ${res.status}`);
  }
  return json.data;
}

function ttMoney(value) {
  const n = Number(value || 0);
  return n.toLocaleString("vi-VN") + "đ";
}

function ttDate(dateText) {
  if (!dateText) return "";
  const d = new Date(dateText);
  if (Number.isNaN(d.getTime())) return dateText;
  return d.toLocaleDateString("vi-VN");
}

function ttTime(dateText) {
  if (!dateText) return "";
  const d = new Date(dateText);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function ttDuration(startText, endText) {
  const s = new Date(startText);
  const e = new Date(endText);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "";
  const min = Math.max(0, Math.round((e - s) / 60000));
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}g${String(m).padStart(2, "0")}`;
}

function ttToast(msg, type = "info") {
  if (type === "error") {
    alert(msg);
    return;
  }

  if (typeof showToast === "function") {
    return showToast(msg, type);
  }

  alert(msg);
}

async function ttLoadStations() {
  try {
    const stations = await ttApi("/stations");
    window.__ttStations = stations || [];
    const dl = document.getElementById("stationList");
    if (dl) {
      dl.innerHTML = window.__ttStations.map(s => `<option value="${s.tenGa}"></option>`).join("");
    }
  } catch (e) {
    console.warn(e.message);
  }
}

function ttStationIdByName(name) {
  const stations = window.__ttStations || [];
  const found = stations.find(s => s.tenGa === name || s.id === name);
  return found ? found.id : "";
}

window.login = async function login() {
  const username = document.getElementById("username")?.value.trim();
  const password = document.getElementById("password")?.value.trim();
  const error = document.getElementById("usernameError");
  if (error) error.innerHTML = "";
  if (!username || !password) {
    if (error) error.innerHTML = "Vui lòng nhập email và mật khẩu";
    else alert("Vui lòng nhập email và mật khẩu");
    return;
  }
  try {
    const user = await ttApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: username, password }),
    });
    localStorage.setItem("isLogin", "true");
    localStorage.setItem("role", user.vaiTro || "KHACH_HANG");
    localStorage.setItem("currentUser", JSON.stringify(user));
    window.location.href = (user.vaiTro === "ADMIN") ? "admin.html" : "home.html";
  } catch (e) {
    if (error) error.innerHTML = e.message;
    else alert(e.message);
  }
};

window.register = async function register() {
  const name = document.getElementById("regName")?.value.trim();
  const email = document.getElementById("regEmail")?.value.trim();
  const phone = document.getElementById("regPhone")?.value.trim();
  const password = document.getElementById("regPassword")?.value || "";
  const confirm = document.getElementById("regPasswordConfirm")?.value || "";
  const agree = document.getElementById("agreeTerms")?.checked;

  if (typeof validateName === "function" && !validateName(true)) return;
  if (typeof validateEmail === "function" && !validateEmail(true)) return;
  if (typeof validatePhone === "function" && !validatePhone(true)) return;
  if (typeof validatePassword === "function" && !validatePassword(true)) return;
  if (typeof validateConfirm === "function" && !validateConfirm(true)) return;
  if (!agree) {
    const termsError = document.getElementById("termsError");
    if (termsError) termsError.style.display = "flex";
    return;
  }

  try {
    await ttApi("/auth/register", {
      method: "POST",
      body: JSON.stringify({ hoTen: name, email, sdt: phone, matKhau: password, nhapLaiMatKhau: confirm }),
    });
    alert("Đăng ký thành công. Vui lòng đăng nhập.");
    window.location.href = "login.html";
  } catch (e) {
    alert(e.message);
  }
};

window.logout = async function logout() {
  try { await ttApi("/auth/logout", { method: "POST", body: "{}" }); } catch (e) {}
  localStorage.removeItem("isLogin");
  localStorage.removeItem("role");
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
};

window.searchTrains = async function searchTrains() {
  if (!window.__ttStations) await ttLoadStations();
  
  let from = document.getElementById("fromStation")?.value.trim() || "";
  let to = document.getElementById("toStation")?.value.trim() || "";
  const date = document.getElementById("departDate")?.value || "";
  const persons = document.getElementById("numPersons")?.value || "1";
  
  if (from && !from.startsWith("Ga ")) {
    from = "Ga " + from;
  }
  if (to && !to.startsWith("Ga ")) {
    to = "Ga " + to;
  }
  

  if (from === "" || from === "Ga ") {
    ttToast("Vui lòng nhập ga đi", "error");
    return;
  }
  if (to === "" || to === "Ga ") {
    ttToast("Vui lòng nhập ga đến", "error");
    return;
  }
  if (from === to) {
    ttToast("Ga đi và ga đến không được giống nhau", "error");
    return;
  }
  if (date === "") {
    ttToast("Vui lòng chọn ngày khởi hành", "error");
    return;
  }
  
  localStorage.setItem("hanhKhach", persons);
  
  const params = new URLSearchParams({
    from: from,
    to: to,
    gaDiId: ttStationIdByName(from),
    gaDenId: ttStationIdByName(to),
    date: date,
    persons: persons,
  });
  
  const routesUrl = `routes.html?${params.toString()}`;
  localStorage.setItem("lastRoutesUrl", routesUrl);
  window.location.href = routesUrl;
};

window.viewRoute = async function viewRoute(from, to) {
  if (!window.__ttStations) await ttLoadStations();
  const today = new Date().toISOString().split("T")[0];
  const params = new URLSearchParams({
    from,
    to,
    gaDiId: ttStationIdByName(from),
    gaDenId: ttStationIdByName(to),
    date: today,
    persons: "1",
  });
  window.location.href = `routes.html?${params.toString()}`;
};
window.selectTrain = function selectTrain(chuyenTauId, gioDi, giaText) {
  const urlParams = new URLSearchParams(window.location.search);
  const gaDi = urlParams.get("gaDi") || urlParams.get("from") || "";
  const gaDen = urlParams.get("gaDen") || urlParams.get("to") || "";
  const ngayDi = urlParams.get("ngayDi") || urlParams.get("date") || "";
  const persons = urlParams.get("persons") || localStorage.getItem("hanhKhach") || "1";
  
  let foundTrip = null;
  if (window.__lastTrips && window.__lastTrips.length > 0) {
    foundTrip = window.__lastTrips.find(t => t.id === chuyenTauId);
  }
  
  let tenTau = chuyenTauId;
  if (foundTrip && foundTrip.tenTau) {
    tenTau = foundTrip.tenTau;
  }
  
  let ngayGioKhoiHanh = null;
  
  if (foundTrip && foundTrip.ngayGioKhoiHanh) {
    ngayGioKhoiHanh = foundTrip.ngayGioKhoiHanh;
  } 
  else if (gioDi && ngayDi) {
    // XỬ LÝ ĐÚNG ĐỊNH DẠNG GIỜ
    let gioChuan = gioDi;
    // Nếu gioDi đã có định dạng HH:MM, chỉ lấy phần giờ và phút
    if (gioDi.includes(':')) {
      // Giữ nguyên vì đã đúng định dạng HH:MM
      gioChuan = gioDi;
    }
    // Tạo chuỗi đúng định dạng: YYYY-MM-DDTHH:MM:SS
    ngayGioKhoiHanh = `${ngayDi}T${gioChuan}:00`;
  }
  else if (ngayDi) {
    ngayGioKhoiHanh = `${ngayDi}T00:00:00`;
  }
  else {
    ngayGioKhoiHanh = new Date().toISOString();
  }

  localStorage.setItem("hanhKhach", persons);
  localStorage.setItem("lastRoutesUrl", `routes.html${window.location.search || ""}`);
  localStorage.setItem("chuyenTauId", chuyenTauId);
  localStorage.removeItem("selectedSeatIds");
  localStorage.removeItem("selectedSeats");
  localStorage.removeItem("selectedSeatPrices");
  localStorage.removeItem("selectedTicketTotal");
  localStorage.removeItem("createdTicket");
  localStorage.removeItem("idVe");
  
  const tripData = {
    id: chuyenTauId,
    tenTau: tenTau,
    gaDi: gaDi,
    gaDen: gaDen,
    ngayGioKhoiHanh: ngayGioKhoiHanh,
    ngayGioDen: foundTrip ? (foundTrip.ngayGioDen || "") : "",
    giaThapNhat: giaText ? parseFloat(String(giaText).replace(/[^0-9]/g, '')) : 0
  };
  
  localStorage.setItem("selectedTrip", JSON.stringify(tripData));
  localStorage.setItem("maTau", tenTau);
  
  const gioDaDinhDang = ttTime(ngayGioKhoiHanh);
  localStorage.setItem("gioDi", gioDaDinhDang);
  localStorage.setItem("gaDi", gaDi);
  localStorage.setItem("gaDen", gaDen);
  localStorage.setItem("ngayDi", ngayGioKhoiHanh ? ngayGioKhoiHanh.substring(0, 10) : "");
  
  console.log("Chuyến tàu đã chọn:", {
    id: chuyenTauId,
    tenTau: tenTau,
    gioKhoiHanh: gioDaDinhDang,
    ngayDi: ngayDi,
    gaDi: gaDi,
    gaDen: gaDen,
    ngayGioKhoiHanhRaw: ngayGioKhoiHanh
  });
  
  window.location.href = `tickets.html?chuyenTauId=${encodeURIComponent(chuyenTauId)}`;
};
function ttGetCoachTabs() {
  let tabsWrap = document.getElementById("coach-tabs");
  if (tabsWrap) return tabsWrap;

  const seatGrid = document.querySelector(".seat-grid-container");
  const legend = seatGrid?.previousElementSibling;
  const card = seatGrid?.closest(".p-4.bg-white, .p-4");
  if (!card) return null;

  tabsWrap = document.createElement("div");
  tabsWrap.id = "coach-tabs";
  tabsWrap.className = "d-flex gap-2 mb-4 overflow-x-auto pb-1";

  if (legend && legend.parentElement === card) {
    card.insertBefore(tabsWrap, legend);
  } else if (seatGrid && seatGrid.parentElement === card) {
    card.insertBefore(tabsWrap, seatGrid);
  } else {
    card.appendChild(tabsWrap);
  }
  return tabsWrap;
}

function ttRenderCoachTabs(coaches, activeCoach) {
  const tabsWrap = ttGetCoachTabs();
  if (!tabsWrap || !Array.isArray(coaches) || coaches.length === 0) return;

  const normalizedCoaches = [...new Set(coaches.map(c => String(c)))].sort((a, b) => Number(a) - Number(b));
  window.__ttCoaches = normalizedCoaches;
  const active = String(activeCoach || window.__ttCurrentCoach || normalizedCoaches[0]);
  window.__ttCurrentCoach = active;

  tabsWrap.innerHTML = normalizedCoaches
    .map(c => `<button type="button" class="btn-coach-tab ${String(c) === active ? "active" : ""}" data-coach="${c}">Toa ${c}</button>`)
    .join("");

  tabsWrap.querySelectorAll(".btn-coach-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const coach = btn.dataset.coach;
      localStorage.removeItem("selectedSeatIds");
      localStorage.removeItem("selectedSeats");
      localStorage.removeItem("selectedSeatPrices");
      ttRenderCoachTabs(window.__ttCoaches || normalizedCoaches, coach);
      ttRenderSeatsForCoach(coach);
    });
  });
}

function ttShowMissingSeatModal(maxSeats, selectedCount) {
  const missingCount = maxSeats - selectedCount;

  alert(
    `Bạn đang chọn thiếu ${missingCount} chỗ!\n\n` +
    `Hiện tại chỉ có ${selectedCount} chỗ / ${maxSeats} hành khách được chọn.\n` +
    `Bạn vui lòng chọn thêm chỗ.`
  );
}

function ttEnsureCoachTabs() {
  const coaches = window.__ttCoaches || [];
  const tabsWrap = ttGetCoachTabs();
  if (!tabsWrap || coaches.length === 0) return;

  const buttons = tabsWrap.querySelectorAll(".btn-coach-tab");
  const hasWrongText = tabsWrap.textContent.trim() === "Chưa chọn ghế";
  if (hasWrongText || buttons.length !== coaches.length) {
    ttRenderCoachTabs(coaches, window.__ttCurrentCoach || coaches[0]);
  }
}

function ttWatchCoachTabs() {
  const tabsWrap = ttGetCoachTabs();
  if (!tabsWrap || tabsWrap.dataset.watched === "true") return;
  tabsWrap.dataset.watched = "true";

  const observer = new MutationObserver(() => {
    const coaches = window.__ttCoaches || [];
    if (!coaches.length) return;
    const buttons = tabsWrap.querySelectorAll(".btn-coach-tab");
    const hasWrongText = tabsWrap.textContent.trim() === "Chưa chọn ghế";
    if (hasWrongText || buttons.length !== coaches.length) {
      ttRenderCoachTabs(coaches, window.__ttCurrentCoach || coaches[0]);
    }
  });

  observer.observe(tabsWrap, { childList: true, subtree: true, characterData: true });
}


function ttRenderSeatsForCoach(coach) {
  const seatGrid = document.querySelector(".seat-grid-container");
  if (!seatGrid || !coach) return;
  window.__ttCurrentCoach = String(coach);
  const summaryCoach = document.getElementById("summary-coach");
  if (summaryCoach) summaryCoach.innerText = `Toa ${coach}`;
  const seats = (window.__ttSeats || []).filter(s => String(s.soToa) === String(coach));
  const selectedIds = new Set(JSON.parse(localStorage.getItem("selectedSeatIds") || "[]"));
  const rows = [];
  for (let i = 0; i < seats.length; i += 4) rows.push(seats.slice(i, i + 4));
  seatGrid.innerHTML = `<div class="text-center text-muted small mb-4"><i class="fa-solid fa-arrow-left me-1"></i> Đầu tàu</div>` + rows.map(row => `
    <div class="seat-row">
      ${row.map((s, idx) => `${idx === 2 ? "<div></div>" : ""}<div class="seat-box ${s.trangThaiGheNgoi !== "TRONG" ? "occupied" : ""} ${selectedIds.has(s.idGheChuyen) ? "selected" : ""}" data-seat-id="${s.idGheChuyen}" data-seat-label="T${s.soToa}-${s.viTriGhe}" data-price="${s.gia || 0}">${s.viTriGhe}</div>`).join("")}
    </div>`).join("");

  seatGrid.querySelectorAll(".seat-box:not(.occupied)").forEach(el => {
    el.addEventListener("click", () => {
      const id = el.dataset.seatId;
      const label = el.dataset.seatLabel;
      const price = Number(el.dataset.price || 0);
      let selected = JSON.parse(localStorage.getItem("selectedSeatIds") || "[]");
      let labels = JSON.parse(localStorage.getItem("selectedSeats") || "[]");
      let prices = JSON.parse(localStorage.getItem("selectedSeatPrices") || "{}");
      const maxSeats = Number(localStorage.getItem("hanhKhach") || "1");
      if (selected.includes(id)) {
        selected = selected.filter(x => x !== id);
        labels = labels.filter(x => x !== label);
        delete prices[id];
        el.classList.remove("selected");
      } else {
        if (selected.length >= maxSeats) {
          const removedId = selected.shift();
          labels.shift();
      
          if (removedId) {
            delete prices[removedId];
      
            const oldSeatEl = document.querySelector(
              `.seat-box[data-seat-id="${removedId}"]`
            );
      
            if (oldSeatEl) {
              oldSeatEl.classList.remove("selected");
            }
          }
        }
      
        selected.push(id);
        labels.push(label);
        prices[id] = price;
        el.classList.add("selected");
      }
      localStorage.setItem("selectedSeatIds", JSON.stringify(selected));
      localStorage.setItem("selectedSeats", JSON.stringify(labels));
      localStorage.setItem("selectedSeatPrices", JSON.stringify(prices));
      ttUpdateSeatSummary();
    });
  });
  ttUpdateSeatSummary();
}

function ttUpdateSeatSummary() {
  const ids = JSON.parse(localStorage.getItem("selectedSeatIds") || "[]");
  const labels = JSON.parse(localStorage.getItem("selectedSeats") || "[]");
  const prices = JSON.parse(localStorage.getItem("selectedSeatPrices") || "{}");
  const total = ids.reduce((sum, id) => sum + Number(prices[id] || 0), 0);
  localStorage.setItem("selectedSeatCount", String(ids.length));
  localStorage.setItem("selectedTicketTotal", String(total));

  const badgeBox = document.getElementById("selected-seat-box");
  if (badgeBox) {
    badgeBox.innerHTML = labels.length
      ? labels.map(l => `<span class="badge-seat-tag">${l}</span>`).join("")
      : `<span class="text-muted small">Chưa chọn ghế</span>`;
  }
  const strongs = document.querySelectorAll(".d-flex.justify-content-between.mb-2.small strong");
  strongs.forEach(s => s.innerText = String(ids.length));
  const priceEl = document.querySelector(".d-flex.justify-content-between.mb-3.small strong");
  if (priceEl) priceEl.innerText = ttMoney(total);
  const totalEl = document.querySelector("h4.text-warning");
  if (totalEl) totalEl.innerText = ttMoney(total);
}

async function ttGetLoginUser() {
  let user = ttCurrentUser();

  try {
    const apiUser = await ttApi("/auth/me");
    if (apiUser) {
      user = apiUser;
      localStorage.setItem("currentUser", JSON.stringify(apiUser));
    }
  } catch (e) {
    console.warn("Không lấy được user từ /auth/me, dùng currentUser trong localStorage");
  }

  return user;
}

async function ttInitInformationPage() {
  const continueBtn = document.getElementById("continueBtn");
  if (!continueBtn) return;
  const labels = JSON.parse(localStorage.getItem("selectedSeats") || "[]");
  const total = Number(localStorage.getItem("selectedTicketTotal") || 0);
  const trip = JSON.parse(localStorage.getItem("selectedTrip") || "{}");
  
  const user = await ttGetLoginUser();

  if (user) {
    const bookerName = document.getElementById("bookerName");
    const phone = document.getElementById("phone");
    const email = document.getElementById("email");
  
    if (bookerName && !bookerName.value.trim()) {
      bookerName.value = user.hoTen || user.fullName || "";
    }
  
    if (phone && !phone.value.trim()) {
      phone.value = user.sdt || user.phone || "";
    }
  
    if (email && !email.value.trim()) {
      email.value = user.email || "";
    }
  }

  const summarySeats = document.getElementById("selectedSeatsSummary");
  if (summarySeats) summarySeats.innerHTML = labels.map(l => `<em>${l}</em>`).join("");
  document.getElementById("selectedSeatCount") && (document.getElementById("selectedSeatCount").innerText = String(labels.length));
  document.getElementById("informationTotal") && (document.getElementById("informationTotal").innerText = ttMoney(total));
  const blocks = document.querySelectorAll(".summary-block strong");
  if (blocks[0]) blocks[0].innerText = `${trip.gaDi || ""} → ${trip.gaDen || ""}`;
  if (blocks[1]) blocks[1].innerText = `${ttDate(trip.ngayGioKhoiHanh)} - ${ttTime(trip.ngayGioKhoiHanh)}`;

  const panel = document.querySelector(".passengers-panel");
  const template = document.querySelector(".passenger-card");
  if (panel && template && labels.length > 0) {
    panel.querySelectorAll(".passenger-card").forEach(x => x.remove());
    labels.forEach((label, i) => {
      const card = template.cloneNode(true);
      card.querySelector("h3").innerText = `Hành khách ${i + 1} - Ghế ${label}`;
      card.querySelectorAll("input").forEach(inp => inp.value = "");
      panel.insertBefore(card, panel.querySelector(".save-line"));
    });
  }

  const newBtn = continueBtn.cloneNode(true);
  continueBtn.parentNode.replaceChild(newBtn, continueBtn);
  newBtn.addEventListener("click", async () => {
    const user = ttCurrentUser();
    if (!user) {
      alert("Vui lòng đăng nhập trước khi đặt vé");
      window.location.href = "login.html";
      return;
    }
    const seatIds = JSON.parse(localStorage.getItem("selectedSeatIds") || "[]");
    const bookerName = document.getElementById("bookerName")?.value.trim();
    const phone = document.getElementById("phone")?.value.trim();
    const email = document.getElementById("email")?.value.trim();
    
    if (!bookerName || !phone || !email) {
      alert("Vui lòng nhập đủ thông tin người đặt vé");
      return;
    }
    const passengers = [...document.querySelectorAll(".passenger-card")].map(card => ({
      hoTen: card.querySelector(".passenger-name")?.value.trim(),
      ngaySinh: card.querySelector(".birth-date")?.value,
      CCCD: card.querySelector(".cccd")?.value.trim(),
      sdt: document.getElementById("phone")?.value.trim(),
    }));
    if (seatIds.length === 0 || passengers.some(p => !p.hoTen)) {
      alert("Vui lòng nhập đủ thông tin hành khách");
      return;
    }
    try {
      const ve = await ttApi("/booking/create", {
        method: "POST",
        body: JSON.stringify({ userId: user.id, seatIds, passengers }),
      });
      localStorage.setItem("createdTicket", JSON.stringify(ve));
      localStorage.setItem("idVe", ve.idVe);
      localStorage.setItem("selectedTicketTotal", ve.tongTien || String(total));
      window.location.href = "payment.html";
    } catch (e) {
      alert(e.message);
    }
  });
}

async function ttInitTicketsPage() {
  const seatGrid = document.querySelector(".seat-grid-container");
  if (!seatGrid) return;
  const params = new URLSearchParams(window.location.search);
  const tripId = params.get("chuyenTauId") || localStorage.getItem("chuyenTauId");
  let trip = JSON.parse(localStorage.getItem("selectedTrip") || "{}");
  if (!tripId) return;

  if (!trip.ngayGioKhoiHanh || !trip.gaDi) {
    try {
      const tripDetail = await ttApi(`/trips/detail?id=${encodeURIComponent(tripId)}`);
      if (tripDetail) {
        trip = {
          id: tripId,
          tenTau: tripDetail.tenTau,
          gaDi: tripDetail.gaDi,
          gaDen: tripDetail.gaDen,
          ngayGioKhoiHanh: tripDetail.ngayGioKhoiHanh,
          ngayGioDen: tripDetail.ngayGioDen
        };
        localStorage.setItem("selectedTrip", JSON.stringify(trip));
        localStorage.setItem("gioDi", ttTime(trip.ngayGioKhoiHanh));
        localStorage.setItem("gaDi", trip.gaDi);
        localStorage.setItem("gaDen", trip.gaDen);
        localStorage.setItem("ngayDi", trip.ngayGioKhoiHanh ? trip.ngayGioKhoiHanh.substring(0, 10) : "");
      }
    } catch(e) {
      console.log("Không lấy được chi tiết chuyến tàu:", e);
    }
  }

  localStorage.removeItem("selectedSeatIds");
  localStorage.removeItem("selectedSeats");
  localStorage.removeItem("selectedSeatPrices");
  localStorage.removeItem("selectedTicketTotal");

  document.getElementById("display-route") && (document.getElementById("display-route").innerText = `${trip.tenTau || trip.idTau || tripId} - ${trip.gaDi || ""} ➜ ${trip.gaDen || ""}`);
  document.getElementById("display-date") && (document.getElementById("display-date").innerText = `${ttDate(trip.ngayGioKhoiHanh)} • ${ttTime(trip.ngayGioKhoiHanh)}`);
  document.getElementById("summary-route") && (document.getElementById("summary-route").innerText = `${trip.gaDi || ""} ➜ ${trip.gaDen || ""}`);
  document.getElementById("summary-date") && (document.getElementById("summary-date").innerText = `${ttDate(trip.ngayGioKhoiHanh)} - ${ttTime(trip.ngayGioKhoiHanh)}`);
  document.getElementById("summary-train") && (document.getElementById("summary-train").innerText = trip.tenTau || trip.idTau || tripId);

  try {
    const seats = await ttApi(`/seats?chuyenTauId=${encodeURIComponent(tripId)}`);
    window.__ttSeats = (seats || []).sort((a, b) => {
      return Number(a.soToa) - Number(b.soToa)
          || Number(a.viTriGhe) - Number(b.viTriGhe);
    });
    const coaches = [...new Set(window.__ttSeats.map(s => String(s.soToa)))].sort((a, b) => Number(a) - Number(b));
    window.__ttCoaches = coaches;
    ttRenderCoachTabs(coaches, coaches[0]);
    ttWatchCoachTabs();
    ttRenderSeatsForCoach(coaches[0]);
  } catch (e) {
    seatGrid.innerHTML = `<div class="text-center text-danger p-4">${e.message}</div>`;
  }

  const continueBtn = document.getElementById("continue-seat-btn");
  if (continueBtn) {
    continueBtn.onclick = null;
    continueBtn.removeAttribute("onclick");
    continueBtn.addEventListener("click", () => {
      const ids = JSON.parse(localStorage.getItem("selectedSeatIds") || "[]");
      const maxSeats = Number(localStorage.getItem("hanhKhach") || "1");
      
      if (ids.length < maxSeats) {
        ttShowMissingSeatModal(maxSeats, ids.length);
        return;
      }
      
      ttToast("Đặt chỗ thành công! Đang chuyển sang cổng thanh toán...", "success");
      setTimeout(() => {
        window.location.href = "information.html";
      }, 600);
    });
  }
  const backBtn = document.getElementById("back-to-routes-btn");
  if (backBtn) {
    backBtn.onclick = null;
    backBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const url = localStorage.getItem("lastRoutesUrl") || "routes.html";
      window.location.href = url;
    });
  }
}

function ttGetCurrentUserIdForTickets() {
  const user = ttCurrentUser();
  return user && user.id ? user.id : "";
}

function ttDetectTicketStatusGroup() {
  const page = location.pathname.split("/").pop();

  if (page === "tickets-upcoming.html") return "upcoming";
  if (page === "tickets-pending.html") return "pending";
  if (page === "tickets-cancelled.html") return "cancelled";
  if (page === "tickets-completed.html") return "completed"; 
  return "";
}

async function ttInitMyTicketsPage() {
  const container = document.getElementById("ticketListContainer");
  const statusGroup = ttDetectTicketStatusGroup();

  if (!container || !statusGroup) return;

  const userId = ttGetCurrentUserIdForTickets();
  if (!userId) {
    container.innerHTML = `
      <section class="ticket-card panel">
        <div class="text-muted p-4">Vui lòng đăng nhập để xem vé.</div>
      </section>
    `;
    return;
  }

  container.innerHTML = `<div class="text-center p-5">Đang tải dữ liệu...</div>`;

  try {
    await ttLoadTicketCounts(userId);

    const tickets = await ttApi(
      `/tickets?userId=${encodeURIComponent(userId)}&statusGroup=${encodeURIComponent(statusGroup)}`
    );

    if (!tickets || tickets.length === 0) {
      container.innerHTML = `
        <section class="ticket-card panel">
          <div class="text-muted p-4">Không có vé trong mục này.</div>
        </section>
      `;
      return;
    }

    container.innerHTML = tickets.map(t => ttRenderMyTicketCard(t, statusGroup)).join("");
  } catch (e) {
    container.innerHTML = `
      <section class="ticket-card panel">
        <div class="alert alert-danger m-4">${ttEscapeHtml(e.message)}</div>
      </section>
    `;
  }
}

async function ttLoadTicketCounts(userId) {
  const groups = ["upcoming", "pending", "cancelled", "completed"];

  const results = await Promise.allSettled(
    groups.map(g =>
      ttApi(`/tickets?userId=${encodeURIComponent(userId)}&statusGroup=${g}`)
    )
  );

  groups.forEach((g, i) => {
    const el = document.getElementById(`${g}Count`);
    if (!el) return;

    const list = results[i].status === "fulfilled" ? results[i].value || [] : [];
    el.innerText = `(${list.length})`;
  });
}

function ttRenderMyTicketCard(ticket, statusGroup) {
  const id = ttEscapeHtml(ticket.id || ticket.idVe || "");
  const tenTau = ttEscapeHtml(ticket.tenTau || ticket.idChuyenTau || "Chưa rõ");
  const gaDi = ttEscapeHtml(ticket.gaDi || "Ga đi");
  const gaDen = ttEscapeHtml(ticket.gaDen || "Ga đến");
  const ghe = ttEscapeHtml(ticket.ghe || ticket.viTriGhe || "Chưa rõ");
  const ngayGio = ttFormatTicketDateTime(ticket.ngayGioKhoiHanh || ticket.ngayDat);
  const price = ttMoney(ticket.tongTien);

  let statusText = "Sắp đi";
  let statusClass = "green";
  let actionButtons = `
    <a class="outline-btn" href="ticket-detail.html?idVe=${encodeURIComponent(id)}">
      <i class="bi bi-download"></i>Xem chi tiết
    </a>
    <button class="primary-btn" type="button" onclick="ttCancelTicket('${id}')">
      Hủy vé
    </button>
  `;

  if (statusGroup === "pending") {
    statusText = "Chờ thanh toán";
    statusClass = "orange";
    actionButtons = `
      <a class="primary-btn" href="payment.html?ticketId=${encodeURIComponent(id)}">
        Thanh toán ngay
      </a>
    `;
  }

  if (statusGroup === "cancelled") {
    statusText = "Đã hủy";
    statusClass = "red";
    actionButtons = `
      <a class="outline-btn" href="ticket-detail.html?idVe=${encodeURIComponent(id)}">
        <i class="bi bi-download"></i>Xem chi tiết
      </a>
    `;
  }

  if (statusGroup === "completed") {
    statusText = "Đã hoàn thành";
    statusClass = "plain";
    actionButtons = `
      <a class="outline-btn" href="ticket-detail.html?idVe=${encodeURIComponent(id)}">
        <i class="bi bi-download"></i>Xem chi tiết
      </a>
    `;
    const reviewButton = ticket.hasReview
      ? `<button class="outline-btn review-btn" type="button" disabled>Đã đánh giá</button>`
      : `<a class="outline-btn review-btn text-center" href="reviews.html?idVe=${encodeURIComponent(id)}">Đánh giá</a>`;
    actionButtons += reviewButton;
  }

  return `
    <section class="ticket-card panel">
      <div class="ticket-main">
        <div class="ticket-col code-col">
          <div class="ticket-label icon-label">
            <i class="bi bi-ticket-perforated"></i><span>Mã vé</span>
          </div>
          <h3>${id}</h3>
          <span class="mini-label">Chuyến tàu</span><strong>${tenTau}</strong>
          <span class="mini-label date-label">Ngày giờ</span>
          <p><i class="bi bi-calendar3"></i>${ngayGio}</p>
        </div>

        <div class="ticket-col route-col">
          <span class="mini-label">Tuyến</span>
          <p><i class="bi bi-geo-alt-fill"></i>${gaDi} → ${gaDen}</p>
          <span class="mini-label seat-title">Ghế</span>
          <div class="seat-list"><em>${ghe}</em></div>
        </div>

        <div class="ticket-actions">
          <span class="ticket-status ${statusClass}">${statusText}</span>
          <div class="ticket-button-group">
            ${actionButtons}
          </div>
        </div>
      </div>

      <div class="ticket-line"></div>
      <div class="ticket-price">${price}</div>
    </section>
  `;
}
async function ttCancelTicket(ticketId) {
  if (!ticketId) return;

  if (!confirm("Bạn chắc chắn muốn hủy vé này?")) return;

  try {
    await ttApi("/tickets/cancel", {
      method: "POST",
      body: JSON.stringify({ ticketId })
    });

    alert("Hủy vé thành công");
    ttInitMyTicketsPage();
  } catch (e) {
    alert(e.message);
  }
}

function ttFormatTicketDateTime(value) {
  if (!value) return "Chưa rõ";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return ttEscapeHtml(String(value));

  return (
    d.toLocaleDateString("vi-VN") +
    " - " +
    d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  );
}

function ttEscapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function ttInitPaymentPage() {
  const payBtn = document.getElementById("payNowBtn");
  if (!payBtn) return;
  
  const urlParams = new URLSearchParams(window.location.search);
  const ticketIdFromUrl = urlParams.get("ticketId") || urlParams.get("idVe");
  
  let labels = JSON.parse(localStorage.getItem("selectedSeats") || "[]");
  let ticket = JSON.parse(localStorage.getItem("createdTicket") || "{}");
  let amount = Number(ticket.tongTien || localStorage.getItem("selectedTicketTotal") || 0);
  let trip = JSON.parse(localStorage.getItem("selectedTrip") || "{}");
  
  if (ticketIdFromUrl && !ticket.idVe) {
    const summaryDateTime = document.getElementById("summaryDateTime");
    if (summaryDateTime) summaryDateTime.innerText = "Đang tải thông tin vé...";
    
    ttApi(`/tickets/detail?idVe=${encodeURIComponent(ticketIdFromUrl)}`)
      .then(ticketDetail => {
        if (ticketDetail) {
          ticket = ticketDetail;
          amount = Number(ticket.tongTien || 0);
          
          if (ticket.ghe) {
            labels = ticket.ghe.split(',').map(s => s.trim());
          } else if (ticket.chiTietVe && ticket.chiTietVe.length > 0) {
            labels = ticket.chiTietVe.map(c => `T${c.soToa}-${c.viTriGhe}`);
          }
          
          trip = {
            tenTau: ticket.tenTau,
            gaDi: ticket.gaDi,
            gaDen: ticket.gaDen,
            ngayGioKhoiHanh: ticket.ngayGioKhoiHanh
          };
          
          updatePaymentUI(labels, ticket, amount, trip, ticketIdFromUrl);
        }
      })
      .catch(e => {
        console.error("Lỗi lấy chi tiết vé:", e);
        const summaryDateTime = document.getElementById("summaryDateTime");
        if (summaryDateTime) summaryDateTime.innerText = "Không thể tải thông tin vé";
        alert("Không thể tải thông tin vé: " + e.message);
      });
  } else {
    updatePaymentUI(labels, ticket, amount, trip, ticketIdFromUrl);
  }
  
  const newBtn = payBtn.cloneNode(true);
  payBtn.parentNode.replaceChild(newBtn, payBtn);
  newBtn.addEventListener("click", async () => {
    let ticketId = ticketIdFromUrl || ticket.idVe || localStorage.getItem("idVe");
    
    if (!ticketId) {
      alert("Chưa có vé để thanh toán");
      return;
    }
    
    let finalAmount = amount;
    if (finalAmount === 0 && ticket.tongTien) {
      finalAmount = Number(ticket.tongTien);
    }
    
    try {
      await ttApi("/payment/process", {
        method: "POST",
        body: JSON.stringify({ ticketId, method: "QR_DEMO", amount: finalAmount }),
      });
      localStorage.setItem("paidTicketId", ticketId);
      alert("Thanh toán thành công");
      window.location.href = `ticket-detail.html?idVe=${encodeURIComponent(ticketId)}`;
    } catch (e) {
      alert(e.message);
    }
  });
}

function updatePaymentUI(labels, ticket, amount, trip, ticketId) {
  const paymentSeatsSummary = document.getElementById("paymentSeatsSummary");
  if (paymentSeatsSummary) {
    paymentSeatsSummary.innerHTML = labels.map(l => `<em>${l}</em>`).join("");
  }
  
  const paymentTicketLabel = document.getElementById("paymentTicketLabel");
  if (paymentTicketLabel) {
    paymentTicketLabel.innerText = `Giá vé (${labels.length} vé)`;
  }
  
  const paymentTicketPrice = document.getElementById("paymentTicketPrice");
  if (paymentTicketPrice) {
    paymentTicketPrice.innerText = ttMoney(amount);
  }
  
  const serviceFee = document.getElementById("serviceFee");
  if (serviceFee) {
    serviceFee.innerText = "0đ";
  }
  
  const finalTotal = document.getElementById("finalTotal");
  if (finalTotal) {
    finalTotal.innerText = ttMoney(amount);
  }
  
  const holdCode = document.getElementById("holdCode");
  if (holdCode && ticketId) {
    holdCode.innerText = ticketId + "-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  
  const summaryTrain = document.getElementById("summaryTrain");
  const summaryRoute = document.getElementById("summaryRoute"); 
  const summaryDateTime = document.getElementById("summaryDateTime");
  
  if (summaryTrain && trip.tenTau) {
    summaryTrain.innerText = trip.tenTau;
  }
  
  if (summaryRoute && trip.gaDi && trip.gaDen) {
    summaryRoute.innerText = `${trip.gaDi} → ${trip.gaDen}`;
  }
  
  if (summaryDateTime) {
    if (trip.ngayGioKhoiHanh) {
      summaryDateTime.innerText = `${ttDate(trip.ngayGioKhoiHanh)} - ${ttTime(trip.ngayGioKhoiHanh)}`;
    } else {
      const ngayDi = localStorage.getItem("ngayDi") || "";
      const gioDi = localStorage.getItem("gioDi") || "";
      if (ngayDi && gioDi) {
        const parts = ngayDi.split("-");
        const ngayFormatted = parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : ngayDi;
        summaryDateTime.innerText = `${ngayFormatted} - ${gioDi}`;
      }
    }
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const page = location.pathname.split("/").pop();

  if (page === "home.html" || page === "routes.html") {
    ttLoadStations();
  }

  const searchBtn = document.getElementById("searchTrainBtn");
  if (searchBtn) {
    searchBtn.onclick = null;
    searchBtn.addEventListener("click", window.searchTrains);
  }

  ttInitTicketsPage();
  ttInitInformationPage();
  ttInitPaymentPage();
  ttInitMyTicketsPage();
});