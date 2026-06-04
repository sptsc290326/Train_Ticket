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
  if (typeof showToast === "function") return showToast(msg, type);
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

// Override old hardcoded login()
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

// Override old register()
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

// Override home search to pass real query params to routes.html
window.searchTrains = async function searchTrains() {
  if (!window.__ttStations) await ttLoadStations();
  const from = document.getElementById("fromStation")?.value.trim() || "";
  const to = document.getElementById("toStation")?.value.trim() || "";
  const date = document.getElementById("departDate")?.value || "";
  const persons = document.getElementById("numPersons")?.value || "1";
  const params = new URLSearchParams({
    from,
    to,
    gaDiId: ttStationIdByName(from),
    gaDenId: ttStationIdByName(to),
    date,
    persons,
  });
  window.location.href = `routes.html?${params.toString()}`;
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

// Override routes.js renderer: load trips from /api/trips instead of mockTrains
window.renderSearchResults = async function renderSearchResults(params) {
  const container = document.getElementById("trainResults");
  if (!container) return;

  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const gaDiId = params.get("gaDiId") || "";
  const gaDenId = params.get("gaDenId") || "";
  const date = params.get("date") || params.get("ngayDi") || "";

  container.innerHTML = `<div class="text-center p-5 text-muted">Đang tải dữ liệu chuyến tàu...</div>`;
  try {
    const q = new URLSearchParams();
    if (gaDiId) q.set("gaDiId", gaDiId);
    if (gaDenId) q.set("gaDenId", gaDenId);
    if (from && !gaDiId) q.set("gaDi", from);
    if (to && !gaDenId) q.set("gaDen", to);
    if (date) q.set("ngayDi", date);

    const trips = await ttApi(`/trips?${q.toString()}`);
    window.__lastTrips = trips || [];
    if (!trips || trips.length === 0) {
      container.innerHTML = `<div class="text-center p-5 text-muted"><i class="fa-solid fa-train-slash fs-2 mb-2 d-block"></i>Không tìm thấy chuyến tàu phù hợp.</div>`;
      return;
    }

    container.innerHTML = trips.map(t => {
      const dep = ttTime(t.ngayGioKhoiHanh);
      const arr = ttTime(t.ngayGioDen);
      const dur = ttDuration(t.ngayGioKhoiHanh, t.ngayGioDen);
      const gaDi = t.gaDi || from || "Ga đi";
      const gaDen = t.gaDen || to || "Ga đến";
      return `
        <div class="train-result-card mb-3">
          <div class="row align-items-center text-center text-md-start">
            <div class="col-md-3 mb-3 mb-md-0">
              <div class="d-flex align-items-center gap-2 justify-content-center justify-content-md-start">
                <i class="fa-solid fa-train text-primary fs-4"></i>
                <h4 class="fw-bold mb-0">${t.tenTau || t.idTau || t.id}</h4>
              </div>
              <span class="train-badge mt-2">Mở bán</span>
            </div>
            <div class="col-md-6 mb-3 mb-md-0">
              <div class="route-timeline px-2">
                <div><div class="time-node">${dep}</div><div class="station-name">${gaDi}</div></div>
                <div class="duration-line"><span class="duration-text"><i class="fa-regular fa-clock me-1"></i>${dur}</span></div>
                <div><div class="time-node">${arr}</div><div class="station-name">${gaDen}</div></div>
              </div>
              <div class="text-muted small mt-2"><i class="fa-solid fa-route me-1"></i>${t.tenTuyenDuong || ""}</div>
            </div>
            <div class="col-md-3 text-md-end text-center">
              <div class="small text-muted mb-1">Ngày đi</div>
              <div class="price-display mb-3">${ttDate(t.ngayGioKhoiHanh)}</div>
              <button class="btn text-white fw-bold w-100 rounded-3 py-2" onclick="selectTrain('${t.id}')" style="background-color:#f4b71a;">Chọn chuyến</button>
            </div>
          </div>
        </div>`;
    }).join("");
  } catch (e) {
    container.innerHTML = `<div class="text-center p-5 text-danger">${e.message}</div>`;
  }
};

window.selectTrain = function selectTrain(chuyenTauId) {
  const trip = (window.__lastTrips || []).find(t => t.id === chuyenTauId) || { id: chuyenTauId };
  localStorage.setItem("chuyenTauId", chuyenTauId);
  localStorage.removeItem("selectedSeatIds");
  localStorage.removeItem("selectedSeats");
  localStorage.removeItem("selectedSeatPrices");
  localStorage.removeItem("selectedTicketTotal");
  localStorage.removeItem("createdTicket");
  localStorage.removeItem("idVe");
  localStorage.setItem("selectedTrip", JSON.stringify(trip));
  localStorage.setItem("maTau", trip.tenTau || trip.idTau || chuyenTauId);
  localStorage.setItem("gioDi", ttTime(trip.ngayGioKhoiHanh));
  localStorage.setItem("gaDi", trip.gaDi || localStorage.getItem("gaDi") || "");
  localStorage.setItem("gaDen", trip.gaDen || localStorage.getItem("gaDen") || "");
  localStorage.setItem("ngayDi", trip.ngayGioKhoiHanh ? trip.ngayGioKhoiHanh.substring(0, 10) : "");
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

async function ttInitTicketsPage() {
  const seatGrid = document.querySelector(".seat-grid-container");
  if (!seatGrid) return;
  const params = new URLSearchParams(window.location.search);
  const tripId = params.get("chuyenTauId") || localStorage.getItem("chuyenTauId");
  const trip = JSON.parse(localStorage.getItem("selectedTrip") || "{}");
  if (!tripId) return;

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
      if (ids.length === 0) {
        ttToast("Vui lòng chọn ít nhất một ghế", "error");
        return;
      }
      ttToast("Đặt chỗ thành công! Đang chuyển sang cổng thanh toán...", "success");
      setTimeout(() => {
        window.location.href = "information.html";
      }, 600);
    });
  }
}

function ttRenderSeatsForCoach(coach) {
  const seatGrid = document.querySelector(".seat-grid-container");
  if (!seatGrid || !coach) return;
  window.__ttCurrentCoach = String(coach);
  ttEnsureCoachTabs();
  ttWatchCoachTabs();
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
      if (selected.includes(id)) {
        selected = selected.filter(x => x !== id);
        labels = labels.filter(x => x !== label);
        delete prices[id];
        el.classList.remove("selected");
      } else {
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
  ttEnsureCoachTabs();
  const strongs = document.querySelectorAll(".d-flex.justify-content-between.mb-2.small strong");
  strongs.forEach(s => s.innerText = String(ids.length));
  const priceEl = document.querySelector(".d-flex.justify-content-between.mb-3.small strong");
  if (priceEl) priceEl.innerText = ttMoney(total);
  const totalEl = document.querySelector("h4.text-warning");
  if (totalEl) totalEl.innerText = ttMoney(total);
}

function ttInitInformationPage() {
  const continueBtn = document.getElementById("continueBtn");
  if (!continueBtn) return;
  const labels = JSON.parse(localStorage.getItem("selectedSeats") || "[]");
  const total = Number(localStorage.getItem("selectedTicketTotal") || 0);
  const trip = JSON.parse(localStorage.getItem("selectedTrip") || "{}");

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

function ttInitPaymentPage() {
  const payBtn = document.getElementById("payNowBtn");
  if (!payBtn) return;
  const labels = JSON.parse(localStorage.getItem("selectedSeats") || "[]");
  const ticket = JSON.parse(localStorage.getItem("createdTicket") || "{}");
  const amount = Number(ticket.tongTien || localStorage.getItem("selectedTicketTotal") || 0);
  document.getElementById("paymentSeatsSummary") && (document.getElementById("paymentSeatsSummary").innerHTML = labels.map(l => `<em>${l}</em>`).join(""));
  document.getElementById("paymentTicketLabel") && (document.getElementById("paymentTicketLabel").innerText = `Giá vé (${labels.length} vé)`);
  document.getElementById("paymentTicketPrice") && (document.getElementById("paymentTicketPrice").innerText = ttMoney(amount));
  document.getElementById("serviceFee") && (document.getElementById("serviceFee").innerText = "0đ");
  document.getElementById("finalTotal") && (document.getElementById("finalTotal").innerText = ttMoney(amount));

  const newBtn = payBtn.cloneNode(true);
  payBtn.parentNode.replaceChild(newBtn, payBtn);
  newBtn.addEventListener("click", async () => {
    const ticketId = ticket.idVe || localStorage.getItem("idVe");
    if (!ticketId) {
      alert("Chưa có vé để thanh toán");
      return;
    }
    try {
      await ttApi("/payment/process", {
        method: "POST",
        body: JSON.stringify({ ticketId, method: "QR_DEMO", amount }),
      });
      localStorage.setItem("paidTicketId", ticketId);
      alert("Thanh toán thành công");
      window.location.href = "ticket-detail.html";
    } catch (e) {
      alert(e.message);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  ttLoadStations();
  const searchBtn = document.getElementById("searchTrainBtn");
  if (searchBtn) {
    searchBtn.onclick = null;
    searchBtn.addEventListener("click", window.searchTrains);
  }
  ttInitTicketsPage();
  ttInitInformationPage();
  ttInitPaymentPage();
});
