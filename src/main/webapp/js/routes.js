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

  function reloadTrips() {
    if (typeof window.renderSearchResults === "function") {
      window.renderSearchResults(new URLSearchParams(window.location.search));
    }
  }

  reloadTrips();

  document
    .querySelectorAll('.filter-sidebar input[type="checkbox"]')
    .forEach((cb) => {
      cb.addEventListener("change", reloadTrips);
    });
});