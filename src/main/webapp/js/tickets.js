/* ============================================================================
   G7 TRAINTICK - tickets.js
   Giữ các xử lý chung của trang tickets: toast, hiển thị thông tin chuyến,
   countdown. Phần toa/ghế động do api-front.js điều khiển.
   ============================================================================ */

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

document.addEventListener("DOMContentLoaded", function () {
  const displayRoute = document.getElementById("display-route");
  const displayDate = document.getElementById("display-date");
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
    if (displayDate) displayDate.innerText = `${ngayVietNam} • ${gioDi}`;
    if (summaryRoute) summaryRoute.innerText = `${gaDi} ➜ ${gaDen}`;
    if (summaryTrain) summaryTrain.innerText = maTau;
    if (summaryDate) summaryDate.innerText = `${ngayVietNam} - ${gioDi}`;
  }

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
        showToast("Hết thời gian giữ chỗ tạm thời! Vui lòng chọn lại chuyến.", "error");
        setTimeout(() => {
          window.location.href = "routes.html";
        }, 1500);
      }
      time--;
    }, 1000);
  }
});
