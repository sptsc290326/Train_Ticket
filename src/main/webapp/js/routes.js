
function showToast(msg, type = "info") {
  const existing = document.querySelector(".toast-msg");
  if (existing) existing.remove();

  const icons = {
    success: "fa-circle-check",
    error: "fa-circle-xmark",
    info: "fa-circle-info",
  };

  const t = document.createElement("div");
  t.className = `toast-msg ${type}`;
  t.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${msg}`;
  document.body.appendChild(t);

  setTimeout(() => t.remove(), 3200);
}

let originalTrips = [];

document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);

  const barRoute = document.getElementById("bar-route");
  const barDate = document.getElementById("bar-date");
  const barPassengers = document.getElementById("bar-passengers");

  const gaDi = params.get("from") || "Sài Gòn";
  const gaDen = params.get("to") || "Hà Nội";
  const ngayDi = params.get("date") || "";
  const hanhKhach = params.get("persons") || "1";

  localStorage.setItem("gaDi", gaDi);
  localStorage.setItem("gaDen", gaDen);
  localStorage.setItem("ngayDi", ngayDi);
  localStorage.setItem("hanhKhach", hanhKhach);

  if (barRoute) barRoute.innerText = `${gaDi} ➜ ${gaDen}`;
  if (barPassengers) barPassengers.innerText = `${hanhKhach} hành khách`;

  if (barDate) {
    const parts = ngayDi.split("-");
    barDate.innerText =
      parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : ngayDi;
  }

  if (typeof window.renderSearchResults === "function") {
    window.renderSearchResults(new URLSearchParams(window.location.search));
  }
});

function getSelectedFilters() {
  const filters = {
    timeSlots: [],
    priceRanges: []
  };
  
  if (document.getElementById("sang")?.checked) filters.timeSlots.push("sang");
  if (document.getElementById("chieu")?.checked) filters.timeSlots.push("chieu");
  if (document.getElementById("toi")?.checked) filters.timeSlots.push("toi");
  if (document.getElementById("dem")?.checked) filters.timeSlots.push("dem");
  
  if (document.getElementById("price-1")?.checked) filters.priceRanges.push("under500");
  if (document.getElementById("price-2")?.checked) filters.priceRanges.push("500-1000");
  if (document.getElementById("price-3")?.checked) filters.priceRanges.push("1000-1500");
  if (document.getElementById("price-4")?.checked) filters.priceRanges.push("over1500");
  
  return filters;
}

function filterByTime(trip, timeSlot) {
  if (!trip.ngayGioKhoiHanh) return false;
  const hour = new Date(trip.ngayGioKhoiHanh).getHours();
  
  switch(timeSlot) {
    case "sang": return hour >= 6 && hour < 12;
    case "chieu": return hour >= 12 && hour < 18;
    case "toi": return hour >= 18 && hour < 24;
    case "dem": return hour >= 0 && hour < 6;
    default: return true;
  }
}

function filterByPrice(trip, priceRange) {
  let price = 0;
  if (trip.giaThapNhat) {
    price = Number(trip.giaThapNhat) / 1000;
  } else if (trip.giaTu) {
    price = Number(trip.giaTu) / 1000;
  } else {
    price = 0;
  }
  
  switch(priceRange) {
    case "under500": return price < 500;
    case "500-1000": return price >= 500 && price <= 1000;
    case "1000-1500": return price >= 1000 && price <= 1500;
    case "over1500": return price > 1500;
    default: return true;
  }
}

function applyFilters() {
  const filters = getSelectedFilters();
  const isAllTime = document.getElementById("tất-cả-gio")?.checked;
  const isAllPrice = document.getElementById("all-price")?.checked;
  
  if (isAllTime && isAllPrice) {
    if (originalTrips.length > 0) {
      updateFilteredResults(originalTrips);
    }
    return;
  }
  
  let filteredTrips = [...originalTrips];
  
  if (!isAllTime && filters.timeSlots.length > 0) {
    filteredTrips = filteredTrips.filter(trip => 
      filters.timeSlots.some(slot => filterByTime(trip, slot))
    );
  }
  
  if (!isAllPrice && filters.priceRanges.length > 0) {
    filteredTrips = filteredTrips.filter(trip =>
      filters.priceRanges.some(range => filterByPrice(trip, range))
    );
  }
  
  if (filteredTrips.length === 0) {
    const container = document.getElementById("trainResults");
    if (container) {
      container.innerHTML = `<div class="text-center p-5 text-muted">Không tìm thấy chuyến tàu phù hợp với bộ lọc.</div>`;
    }
    return;
  }
  
  updateFilteredResults(filteredTrips);
}

function updateFilteredResults(trips) {
  const container = document.getElementById("trainResults");
  const resultCount = document.getElementById("resultCount");
  
  if (!container) return;
  
  if (!trips || trips.length === 0) {
    container.innerHTML = `<div class="text-center p-5 text-muted">Không tìm thấy chuyến tàu phù hợp với bộ lọc.</div>`;
    if (resultCount) resultCount.innerText = "0";
    return;
  }
  
  if (resultCount) resultCount.innerText = trips.length;
  
  container.innerHTML = trips.map(renderTripCard).join("");
}

function renderTripCard(trip) {
  const dep = ttTime(trip.ngayGioKhoiHanh);
  const arr = ttTime(trip.ngayGioDen);
  const dur = ttDuration(trip.ngayGioKhoiHanh, trip.ngayGioDen);
  const gaDi = trip.gaDi || "Ga đi";
  const gaDen = trip.gaDen || "Ga đến";
  
  let priceValue = 0; 
  if (trip.giaThapNhat) {
    priceValue = Number(trip.giaThapNhat);
  } else if (trip.giaTu) {
    priceValue = Number(trip.giaTu);
  }
  const price = ttMoney(priceValue);
  
  return `
    <div class="train-result-card mb-3">
      <div class="row align-items-center text-center text-md-start">
        <div class="col-md-3 mb-3 mb-md-0">
          <div class="d-flex align-items-center gap-2 justify-content-center justify-content-md-start">
            <i class="fa-solid fa-train text-primary fs-4"></i>
            <h4 class="fw-bold mb-0">${trip.tenTau || trip.idTau || trip.id}</h4>
          </div>
          <span class="train-badge mt-2">Mở bán</span>
        </div>
        <div class="col-md-6 mb-3 mb-md-0">
          <div class="route-timeline px-2">
            <div><div class="time-node">${dep}</div><div class="station-name">${gaDi}</div></div>
            <div class="duration-line"><span class="duration-text"><i class="fa-regular fa-clock me-1"></i>${dur}</span></div>
            <div><div class="time-node">${arr}</div><div class="station-name">${gaDen}</div></div>
          </div>
          <div class="text-muted small mt-2">${trip.tenTuyenDuong || ""}</div>
        </div>
        <div class="col-md-3 text-md-end text-center">
          <div class="small text-muted mb-1">Ngày đi</div>
          <div class="mb-1">${ttDate(trip.ngayGioKhoiHanh)}</div>
          <div class="price-display mb-3">${price}</div>
          <button class="btn text-white fw-bold w-100 rounded-3 py-2" 
                  onclick="selectTrain('${trip.id}', '${dep}', '${priceValue}')" 
                  style="background-color:#f4b71a;">Chọn chuyến</button>
        </div>
      </div>
    </div>
  `;
}
function initAllTimeFilter() {
  const allTimeCheckbox = document.getElementById("tất-cả-gio");
  const timeCheckboxes = ["sang", "chieu", "toi", "dem"].map(id => document.getElementById(id));
  
  if (allTimeCheckbox) {
    allTimeCheckbox.addEventListener("change", function() {
      if (this.checked) {
        timeCheckboxes.forEach(cb => {
          if (cb) cb.checked = false;
        });
        applyFilters();
      }
    });
  }
  
  timeCheckboxes.forEach(cb => {
    if (cb) {
      cb.addEventListener("change", function() {
        const allChecked = timeCheckboxes.every(c => c && c.checked);
        
        if (allChecked && allTimeCheckbox) {
          allTimeCheckbox.checked = true;
          timeCheckboxes.forEach(c => {
            if (c) c.checked = false;
          });
        } else if (allTimeCheckbox && allTimeCheckbox.checked) {
          allTimeCheckbox.checked = false;
        }
        
        applyFilters();
      });
    }
  });
}

function initAllPriceFilter() {
  const allPriceCheckbox = document.getElementById("all-price");
  const priceCheckboxes = ["price-1", "price-2", "price-3", "price-4"].map(id => document.getElementById(id));
  
  if (allPriceCheckbox) {
    allPriceCheckbox.addEventListener("change", function() {
      if (this.checked) {
        priceCheckboxes.forEach(cb => {
          if (cb) cb.checked = false;
        });
        applyFilters();
      }
    });
  }
  
  priceCheckboxes.forEach(cb => {
    if (cb) {
      cb.addEventListener("change", function() {
        const allChecked = priceCheckboxes.every(c => c && c.checked);
        
        if (allChecked && allPriceCheckbox) {
          allPriceCheckbox.checked = true;
          priceCheckboxes.forEach(c => {
            if (c) c.checked = false;
          });
        } else if (allPriceCheckbox && allPriceCheckbox.checked) {
          allPriceCheckbox.checked = false;
        }
        
        applyFilters();
      });
    }
  });
}
function initFilters() {
  const checkboxes = document.querySelectorAll('.filter-sidebar input[type="checkbox"]');
  checkboxes.forEach(cb => {
    cb.removeEventListener("change", applyFilters);
    cb.addEventListener("change", applyFilters);
  });
  
  initAllTimeFilter();
  initAllPriceFilter();
}

function initDefaultFilterState() {
  const timeSlots = ["sang", "chieu", "toi", "dem"];
  timeSlots.forEach(id => {
    const cb = document.getElementById(id);
    if (cb) cb.checked = false;
  });
  
  const priceRanges = ["price-1", "price-2", "price-3", "price-4"];
  priceRanges.forEach(id => {
    const cb = document.getElementById(id);
    if (cb) cb.checked = false;
  });
  
  const seatTypes = ["cung", "mem"];
  seatTypes.forEach(id => {
    const cb = document.getElementById(id);
    if (cb) cb.checked = false;
  });
  
  const allTimeCheckbox = document.getElementById("tất-cả-gio");
  if (allTimeCheckbox) allTimeCheckbox.checked = true;
  
  const allPriceCheckbox = document.getElementById("all-price");
  if (allPriceCheckbox) allPriceCheckbox.checked = true;
  
  const allSeatCheckbox = document.getElementById("all-seat");
  if (allSeatCheckbox) allSeatCheckbox.checked = true;
  
  if (originalTrips.length > 0) {
    updateFilteredResults(originalTrips);
  }
}
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
    
    originalTrips = trips || [];
    
    if (!trips || trips.length === 0) {
      container.innerHTML = `<div class="text-center p-5 text-muted"><i class="fa-solid fa-train-slash fs-2 mb-2 d-block"></i>Không tìm thấy chuyến tàu phù hợp.</div>`;
      return;
    }

    updateFilteredResults(trips);
    
    initDefaultFilterState();
    initFilters();
    
  } catch (e) {
    container.innerHTML = `<div class="text-center p-5 text-danger">${e.message}</div>`;
  }
};
window.selectTrainWithData = function selectTrainWithData(tripJson) {
  const trip = JSON.parse(tripJson);
  const persons = new URLSearchParams(window.location.search).get("persons")
    || localStorage.getItem("hanhKhach")
    || "1";

  localStorage.setItem("hanhKhach", persons);
  localStorage.setItem("lastRoutesUrl", `routes.html${window.location.search || ""}`);
  localStorage.setItem("chuyenTauId", trip.id);
  localStorage.removeItem("selectedSeatIds");
  localStorage.removeItem("selectedSeats");
  localStorage.removeItem("selectedSeatPrices");
  localStorage.removeItem("selectedTicketTotal");
  localStorage.removeItem("createdTicket");
  localStorage.removeItem("idVe");
  
  localStorage.setItem("selectedTrip", JSON.stringify(trip));
  localStorage.setItem("maTau", trip.tenTau);
  localStorage.setItem("gioDi", ttTime(trip.ngayGioKhoiHanh));
  localStorage.setItem("gaDi", trip.gaDi);
  localStorage.setItem("gaDen", trip.gaDen);
  localStorage.setItem("ngayDi", trip.ngayGioKhoiHanh ? trip.ngayGioKhoiHanh.substring(0, 10) : "");
  
  window.location.href = `tickets.html?chuyenTauId=${encodeURIComponent(trip.id)}`;
};