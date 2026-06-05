// 1. CHUẨN BỊ GIAO DIỆN KHI TRANG VỪA TẢI XONG
document.addEventListener("DOMContentLoaded", () => {
  console.log("home.js đã chạy");
  // Cài đặt ngày khởi hành và ngày về không được phép chọn trong quá khứ
  const today = new Date().toISOString().split("T")[0];
  const departDate = document.getElementById("departDate");
  const returnDate = document.getElementById("returnDate");

  if (departDate) {
    departDate.min = today;
    departDate.value = today; // Gắn mặc định ô ngày đi là hôm nay
  }
  if (returnDate) {
    returnDate.min = today; // Ngày về cũng không được nhỏ hơn hôm nay
  }
});

// 2. CHUYỂN ĐỔI TAB "MỘT CHIỀU" & "KHỨ HỒI"
function switchTab(tab) {
  // Đổi màu nút Tab (Tàu hỏa / Khứ hồi)
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document.querySelector(`[data-tab="${tab}"]`)?.classList.add("active");

  // Ẩn/Hiện dòng chọn "Ngày về"
  const returnRow = document.getElementById("returnDateRow");
  if (returnRow) {
    returnRow.style.display = tab === "round" ? "block" : "none";
  }

  // Đồng bộ nút Radio bên dưới tương ứng với tab được bấm
  const radios = document.getElementsByName("tripType");
  radios.forEach((r) => {
    if (r.value === tab) r.checked = true;
  });
}

// 3. XỬ LÝ NÚT "TÌM KIẾM CHUYẾN TÀU"
function searchTrains() {
  const from = document.getElementById("fromStation")?.value.trim() || "";
  const to = document.getElementById("toStation")?.value.trim() || "";
  const date = document.getElementById("departDate")?.value || "";
  
  if (from === "") {
    showToast("Vui lòng nhập ga đi", "error");
    return;
  }
  
  if (to === "") {
    showToast("Vui lòng nhập ga đến", "error");
    return;
  }
  
  if (from === to) {
    showToast("Ga đi và ga đến không được giống nhau", "error");
    return;
  }
  
  if (date === "") {
    showToast("Vui lòng chọn ngày khởi hành", "error");
    return;
  }
  
  window.location.href = "routes.html";
}
// 4. XỬ LÝ NÚT "XEM CHUYẾN" (KHU VỰC TUYẾN TÀU PHỔ BIẾN)
function viewRoute(from, to) {
  const today = new Date().toISOString().split("T")[0];

  // Mặc định chuyển sang trang tìm kiếm với vé 1 chiều, khởi hành hôm nay
  const params = new URLSearchParams({
    from,
    to,
    date: today,
    persons: 1,
    type: "one",
  });
  window.location.href = `routes.html?${params.toString()}`;
}

// 5. HIỂN THỊ THÔNG BÁO LỖI/THÀNH CÔNG (TOAST)
function showToast(msg, type = "info") {
  // Xóa thông báo cũ nếu có
  const existing = document.querySelector(".toast-msg");
  if (existing) existing.remove();

  // Cấu hình icon tùy theo loại thông báo
  const icons = {
    success: "fa-circle-check",
    error: "fa-circle-xmark",
    info: "fa-circle-info",
  };

  // Tạo thẻ div chứa thông báo
  const t = document.createElement("div");
  t.className = `toast-msg ${type}`;
  t.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${msg}`;

  // Thêm vào giao diện
  document.body.appendChild(t);

  // Tự động biến mất sau 3 giây
  setTimeout(() => t.remove(), 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchTrainBtn");

  if (searchBtn) {
    searchBtn.addEventListener("click", searchTrains);
  }
});
