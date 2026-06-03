/* ==========================================================================
   G7 TRAINTICK - tickets.js (Cập nhật CSS mới)
   Xử lý tương tác lưới chọn ghế động và cơ chế chuyển đổi Toa xe
   ========================================================================== */

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

/* ---- KHỞI CHẠY KHU VỰC TRANG TICKETS ---- */
document.addEventListener("DOMContentLoaded", function () {
  const displayRoute = document.getElementById("display-route");
  const summaryRoute = document.getElementById("summary-route");
  const summaryDate = document.getElementById("summary-date");
  const summaryTrain = document.getElementById("summary-train");

  if (displayRoute) {
    const gaDi = localStorage.getItem("gaDi") || "Sài Gòn";
    const gaDen = localStorage.getItem("gaDen") || "Hà Nội";
    const ngayDi = localStorage.getItem("ngayDi") || "2026-05-15";
    const maTau = localStorage.getItem("maTau") || "SE3";
    const gioDi = localStorage.getItem("gioDi") || "06:00";

    const parts = ngayDi.split("-");
    const ngayVietNam =
      parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : ngayDi;

    displayRoute.innerText = `${maTau} - ${gaDi} ➜ ${gaDen}`;
    document.getElementById("display-date").innerText =
      `${ngayVietNam} • ${gioDi}`;

    if (summaryRoute) summaryRoute.innerText = `${gaDi} ➜ ${gaDen}`;
    if (summaryTrain) summaryTrain.innerText = maTau;
    if (summaryDate) summaryDate.innerText = `${ngayVietNam} - ${gioDi}`;

    const hanhKhach = localStorage.getItem("hanhKhach") || "1";
    const pCountEl = summaryRoute
      .closest(".p-4")
      ?.querySelector(".d-flex.justify-content-between.mb-2 strong");
    if (pCountEl) pCountEl.innerText = hanhKhach;
  }

  // Đếm ngược thời gian giữ chỗ
  const timerElement = document.getElementById("countdown-timer");
  if (timerElement) {
    let time = 558;
    const countdown = setInterval(function () {
      let minutes = Math.floor(time / 60);
      let seconds = time % 60;

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      timerElement.innerText = `${minutes}:${seconds}`;

      if (time <= 0) {
        clearInterval(countdown);
        showToast(
          "Hết thời gian giữ chỗ tạm thời! Vui lòng chọn lại chuyến.",
          "error",
        );
        setTimeout(() => {
          window.location.href = "routes.html";
        }, 1500);
      }
      time--;
    }, 1000);
  }

  // Xử lý sự kiện lưới chọn ghế động theo Toa xe
  const seatGridContainer = document.querySelector(".seat-grid-container");

  if (seatGridContainer) {
    const selectedSeatsContainer =
      document.querySelector(".badge-seat-tag")?.parentElement;
    const totalAmountElement = document.querySelector("h4.text-warning");
    const priceDisplayElement = document.querySelector(
      ".d-flex.justify-content-between.mb-3.small strong",
    );
    const seatCountElement = document.querySelector(
      ".d-flex.justify-content-between.mb-2.small strong",
    );

    const coachTabs = document.querySelectorAll(".btn-coach-tab");
    const summaryCoachElement = document
      .getElementById("summary-train")
      ?.closest(".p-4")
      ?.querySelectorAll(".mb-3 strong")[3];

    let originalPriceText = localStorage.getItem("giaVe") || "1.200.000đ";
    let pricePerSeat =
      parseInt(originalPriceText.replace(/\./g, "").replace("đ", "")) ||
      1200000;

    let selectedSeats = [];
    let currentCoach = "Toa 2";

    const coachOccupiedData = {
      "Toa 1": [2, 5, 11, 15, 23, 24, 27, 29, 31, 35, 38, 42, 44],
      "Toa 2": [1, 4, 8, 12, 16, 20, 22, 25, 30, 33, 37, 41, 46, 48],
      "Toa 3": [3, 7, 9, 10, 14, 18, 21, 26, 32, 34, 39, 40, 45],
      "Toa 4": [2, 6, 11, 13, 17, 19, 24, 28, 31, 36, 38, 43, 47],
      "Toa 5": [4, 5, 10, 12, 15, 20, 23, 27, 29, 35, 37, 42, 44, 48],
    };

    function renderSeatsForCoach(coachName) {
      const occupiedSeats = coachOccupiedData[coachName] || [];
      const allSeats = document.querySelectorAll(".seat-box");

      allSeats.forEach((seat) => {
        const seatNum = parseInt(seat.innerText);
        seat.className = "seat-box";

        if (occupiedSeats.includes(seatNum)) {
          seat.classList.add("occupied");
        }
      });
      rebindSeatClickEvents();
    }

    function resetSeatSelection() {
      selectedSeats = [];
      if (seatCountElement) seatCountElement.innerText = "0";
      if (priceDisplayElement) priceDisplayElement.innerText = "0đ";
      if (totalAmountElement) totalAmountElement.innerText = "0đ";
      if (selectedSeatsContainer) {
        selectedSeatsContainer.innerHTML =
          '<span class="text-muted small">Chưa chọn ghế</span>';
      }
    }

    function rebindSeatClickEvents() {
      const activeSeats = document.querySelectorAll(".seat-box:not(.occupied)");

      activeSeats.forEach((seat) => {
        const newSeat = seat.cloneNode(true);
        seat.parentNode.replaceChild(newSeat, seat);

        newSeat.addEventListener("click", function () {
          const seatNumber = this.innerText;
          this.classList.toggle("selected");

          if (this.classList.contains("selected")) {
            selectedSeats.push(seatNumber);
          } else {
            selectedSeats = selectedSeats.filter((s) => s !== seatNumber);
          }

          selectedSeats.sort((a, b) => parseInt(a) - parseInt(b));

          if (seatCountElement)
            seatCountElement.innerText = selectedSeats.length;

          const coachNum = currentCoach.replace("Toa ", "T");
          const savedSeats = selectedSeats.map((s) => `${coachNum}-${s}`);
          localStorage.setItem("selectedSeats", JSON.stringify(savedSeats));
          localStorage.setItem("selectedSeatCount", selectedSeats.length);

          if (seatCountElement)
            seatCountElement.innerText = selectedSeats.length;

          let totalAmount = selectedSeats.length * pricePerSeat;
          if (priceDisplayElement)
            priceDisplayElement.innerText =
              (selectedSeats.length * pricePerSeat).toLocaleString("vi-VN") +
              "đ";
          if (totalAmountElement)
            totalAmountElement.innerText =
              totalAmount.toLocaleString("vi-VN") + "đ";

          if (selectedSeatsContainer) {
            if (selectedSeats.length === 0) {
              selectedSeatsContainer.innerHTML =
                '<span class="text-muted small">Chưa chọn ghế</span>';
            } else {
              // ĐỒNG BỘ: Đổi dạng tag hiển thị hình oval vàng đồng bộ CSS mới (.badge-seat-tag)
              selectedSeatsContainer.innerHTML = selectedSeats
                .map(
                  (s) =>
                    `<span class="badge-seat-tag mb-1 me-1">${coachNum}-${s}</span>`,
                )
                .join("");
            }
          }
        });
      });
    }

    if (coachTabs.length > 0) {
      coachTabs.forEach((tab) => {
        tab.addEventListener("click", function () {
          coachTabs.forEach((t) => t.classList.remove("active"));
          this.classList.add("active");

          currentCoach = this.innerText;

          if (summaryCoachElement) {
            summaryCoachElement.innerText = currentCoach;
          }

          resetSeatSelection();
          renderSeatsForCoach(currentCoach);
          showToast(`Đã chuyển sơ đồ sang ${currentCoach}`, "info");
        });
      });
    }

    renderSeatsForCoach(currentCoach);
  }
});
