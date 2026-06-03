/* ========================================================
   FILE: profile.js
   CHỨC NĂNG: Giao tiếp Backend & Đồng bộ UI trang Hồ sơ cá nhân
   DỰ ÁN: G7 TrainTick - Quản lý vé tàu trực tuyến
   ======================================================== */

const BASE_URL = "http://localhost:8080/api";

// DỮ LIỆU MẪU BAN ĐẦU (Dùng khi Backend chưa sẵn sàng)
const MOCK_USER_DATA = {
  fullName: "Nguyễn Văn A (Demo)",
  email: "nguyenvana@email.com",
  phone: "0901234567",
  gender: "male",
  dob: "1995-06-15",
  address: "123 Đường ABC, Quận 1, TP.HCM",
};

// 1. HÀM FETCH GỌI API TRUNG GIAN (Có xử lý Token chứng thực)
async function fetchApi(endpoint, method = "GET", body = null) {
  const headers = { "Content-Type": "application/json" };

  // Lấy token đăng nhập từ LocalStorage
  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) throw new Error(data.message || "Lỗi hệ thống từ Backend");
  return data;
}

// ========================================================
// TẢI VÀ ĐỔ DỮ LIỆU KHI MỞ TRANG (DOM READY)
// ========================================================
document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();

  // Kiểm tra URL Hash để tự động chuyển đúng Tab đang mở
  const hash = window.location.hash.replace("#", "");
  if (["info", "tickets", "password"].includes(hash)) switchTab(hash);
});

// Hàm gọi tải hồ sơ người dùng
async function loadUserProfile() {
  try {
    // 1. Cố gắng gọi API lấy dữ liệu thực tế từ cơ sở dữ liệu
    const userData = await fetchApi("/users/profile", "GET");
    fillProfileUI(userData);
  } catch (error) {
    console.warn(
      "Backend chưa chạy hoặc không phản hồi. Đang chuyển sang dữ liệu cục bộ...",
    );

    // 2. Chế độ Offline: Ưu tiên đọc dữ liệu người dùng đã sửa trong localStorage trước
    const localUser = localStorage.getItem("G7_User_Profile");
    if (localUser) {
      fillProfileUI(JSON.parse(localUser));
    } else {
      fillProfileUI(MOCK_USER_DATA); // Nếu chưa từng sửa, load đúng Mock gốc ban đầu
    }
  }
}

// Hàm gán dữ liệu lên các thành phần giao diện (Đã sửa lỗi textContent/value)
function fillProfileUI(data) {
  if (!data) return;

  // Điền dữ liệu vào các ô nhập liệu thuộc Form bên phải
  if (document.getElementById("infoName"))
    document.getElementById("infoName").value = data.fullName || "";
  if (document.getElementById("infoEmail"))
    document.getElementById("infoEmail").value = data.email || "";
  if (document.getElementById("infoPhone"))
    document.getElementById("infoPhone").value = data.phone || "";
  if (document.getElementById("infoGender"))
    document.getElementById("infoGender").value = data.gender || "";
  if (document.getElementById("infoDob"))
    document.getElementById("infoDob").value = data.dob || "";
  if (document.getElementById("infoAddress"))
    document.getElementById("infoAddress").value = data.address || "";

  // Điền thông tin đồng bộ sang khối Sidebar tài khoản bên trái
  const sidebarName = document.querySelector(".sidebar-user .name");
  const sidebarEmail = document.querySelector(".sidebar-user .email");
  const avatarCircle = document.querySelector(".avatar-circle");

  if (sidebarName && data.fullName) sidebarName.textContent = data.fullName;
  if (sidebarEmail && data.email) sidebarEmail.textContent = data.email;

  if (avatarCircle && data.fullName) {
    // Tách lấy chữ cái đầu tiên của họ tên, viết hoa để làm Avatar tròn công nghệ
    avatarCircle.textContent = data.fullName.trim().charAt(0).toUpperCase();
  }
}

// ========================================================
// XỬ LÝ SỰ KIỆN NÚT "LƯU THAY ĐỔI"
// ========================================================
async function saveInfo() {
  const name = document.getElementById("infoName").value.trim();
  const email = document.getElementById("infoEmail").value.trim();
  const phone = document.getElementById("infoPhone").value.trim();
  const gender = document.getElementById("infoGender").value;
  const dob = document.getElementById("infoDob").value;
  const address = document.getElementById("infoAddress").value.trim();

  // Làm sạch các dòng báo lỗi đỏ trên giao diện trước khi kiểm tra lại
  clearErrP("infoNameErr", document.getElementById("infoName"));
  clearErrP("infoEmailErr", document.getElementById("infoEmail"));
  clearErrP("infoPhoneErr", document.getElementById("infoPhone"));

  // Kiểm tra tính hợp lệ (Validation)
  let valid = true;
  if (name.length < 2) {
    showErrP("infoNameErr", "Họ và tên quá ngắn");
    valid = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showErrP("infoEmailErr", "Email không đúng định dạng");
    valid = false;
  }
  if (!/^(0|\+84)[0-9]{9,10}$/.test(phone)) {
    showErrP("infoPhoneErr", "Số điện thoại không hợp lệ");
    valid = false;
  }
  if (!valid) return; // Dừng lại nếu có lỗi nhập liệu

  const updateData = { fullName: name, email, phone, gender, dob, address };
  const btn = document.getElementById("saveInfoBtn");

  // Tạo hiệu ứng Loading giả lập trên nút bấm tăng trải nghiệm người dùng
  btn.disabled = true;
  btn.innerHTML =
    '<i class="fa-solid fa-circle-notch fa-spin"></i> Đang lưu...';

  try {
    // 1. Gửi dữ liệu cập nhật lên Backend qua API PUT
    await fetchApi("/users/profile", "PUT", updateData);

    // Nếu Backend thành công, cập nhật trực tiếp lên giao diện ngay lập tức
    fillProfileUI(updateData);
    showToast("Thông tin tài khoản đã được đồng bộ lên máy chủ!", "success");
  } catch (error) {
    console.warn(
      "Chuyển sang cơ chế dự phòng Demo: Lưu dữ liệu vào bộ nhớ cục bộ.",
    );

    // 2. Chế độ Offline dự phòng: Lưu trực tiếp vào Mock Data và đồng bộ ra Sidebar
    MOCK_USER_DATA.fullName = name;
    MOCK_USER_DATA.email = email;
    MOCK_USER_DATA.phone = phone;
    MOCK_USER_DATA.gender = gender;
    MOCK_USER_DATA.dob = dob;
    MOCK_USER_DATA.address = address;

    // Ép giao diện vẽ lại dữ liệu mới vừa nhập
    fillProfileUI(updateData);

    // Ghi nhớ dữ liệu đã sửa vào localStorage để F5 không bị mất chữ
    localStorage.setItem("G7_User_Profile", JSON.stringify(updateData));
    localStorage.setItem("infoEmail", email);

    // Hiển thị thông báo Toast thành công xịn sò lên góc màn hình
    if (typeof showToast === "function") {
      showToast("Cập nhật thông tin tài khoản thành công!", "success");
    } else {
      alert("Cập nhật thông tin tài khoản thành công!");
    }
  } finally {
    // Trả lại trạng thái ban đầu cho nút bấm sau khi xử lý xong
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Lưu thay đổi';
  }
}

// ========================================================
// XỬ LÝ MODULE ĐỔI MẬT KHẨU KHÁCH HÀNG
// ========================================================
async function changePassword() {
  const cur = document.getElementById("curPwd").value;
  const newP = document.getElementById("newPwd").value;
  const conf = document.getElementById("confPwd").value;

  clearErrP("curPwdErr", document.getElementById("curPwd"));
  clearErrP("newPwdErr", document.getElementById("newPwd"));
  clearErrP("confPwdErr", document.getElementById("confPwd"));

  // Kiểm tra logic mật khẩu
  if (!cur) {
    showErrP("curPwdErr", "Vui lòng nhập mật khẩu hiện tại");
    return;
  }
  if (newP.length <= 6 || !/[A-Z]/.test(newP) || !/[0-9]/.test(newP)) {
    showErrP("newPwdErr", "Mật khẩu mới chưa đáp ứng đủ quy tắc bảo mật");
    return;
  }
  if (conf !== newP) {
    showErrP("confPwdErr", "Mật khẩu xác nhận lại không khớp");
    return;
  }

  const btn = document.getElementById("changePwdBtn");
  btn.disabled = true;
  btn.innerHTML =
    '<i class="fa-solid fa-circle-notch fa-spin"></i> Đang xử lý...';

  try {
    // Gọi API đổi mật khẩu xuống Backend
    await fetchApi("/users/profile/password", "PUT", {
      currentPassword: cur,
      newPassword: newP,
    });

    // Làm sạch lại form sau khi đổi thành công
    document.getElementById("curPwd").value = "";
    document.getElementById("newPwd").value = "";
    document.getElementById("confPwd").value = "";
    document.getElementById("newPwdStrength").style.display = "none";
    ["rule-len", "rule-upper", "rule-num"].forEach((id) =>
      updateRule(id, false),
    );

    showToast("Mật khẩu của bạn đã được thay đổi thành công!", "success");
  } catch (error) {
    showToast(error.message || "Mật khẩu hiện tại không đúng!", "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-key"></i> Đổi mật khẩu';
  }
}

// ========================================================
// CÁC HÀM TIỆN ÍCH ĐIỀU KHIỂN GIAO DIỆN (UI HELPERS)
// ========================================================

// Hàm xử lý chuyển Tab mượt mà nội bộ hoặc điều hướng trang Vé độc lập
function switchTab(tab) {
  if (tab === "tickets") {
    window.location.href = "view_tickets.html"; // Tự chuyển hướng sang trang quản lý vé riêng của nhóm
    return;
  }

  ["info", "password"].forEach((t) => {
    document.getElementById("panel-" + t)?.classList.remove("active");
    document.getElementById("tab-" + t + "-li")?.classList.remove("active");
  });
  document.getElementById("panel-" + tab)?.classList.add("active");
  document.getElementById("tab-" + tab + "-li")?.classList.add("active");
}

// Hàm Ẩn/Hiện mật khẩu khi click vào icon con mắt
function togglePwdV2(id, iconEl) {
  const input = document.getElementById(id);
  if (input.type === "password") {
    input.type = "text";
    iconEl.className = "fa-regular fa-eye-slash icon-right";
  } else {
    input.type = "password";
    iconEl.className = "fa-regular fa-eye icon-right";
  }
}

// Hàm bật thông báo lỗi đỏ kèm class viền đỏ Bootstrap
function showErrP(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = "flex";
  el.querySelector("span").textContent = msg;

  if (id.includes("Name"))
    document.getElementById("infoName").classList.add("is-invalid");
  if (id.includes("Email"))
    document.getElementById("infoEmail").classList.add("is-invalid");
  if (id.includes("Phone"))
    document.getElementById("infoPhone").classList.add("is-invalid");
  if (id.includes("curPwd"))
    document.getElementById("curPwd").classList.add("is-invalid");
  if (id.includes("newPwd"))
    document.getElementById("newPwd").classList.add("is-invalid");
  if (id.includes("confPwd"))
    document.getElementById("confPwd").classList.add("is-invalid");
}

// Hàm tắt thông báo lỗi đỏ
function clearErrP(id, inputEl) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
  if (inputEl) inputEl.classList.remove("is-invalid");
}

// Hàm theo dõi thời gian thực độ mạnh mật khẩu và hiển thị thanh màu sắc (Strength Bar)
function onNewPwdInput() {
  const val = document.getElementById("newPwd").value;
  clearErrP("newPwdErr", document.getElementById("newPwd"));
  const strengthBox = document.getElementById("newPwdStrength");

  if (val.length === 0) {
    strengthBox.style.display = "none";
    return;
  }
  strengthBox.style.display = "block";

  let score = 0;
  if (val.length >= 6) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const levels = [
    { pct: "25%", color: "#dc2626", label: "Rất yếu" },
    { pct: "50%", color: "#f97316", label: "Yếu" },
    { pct: "75%", color: "#f4b71a", label: "Trung bình" },
    { pct: "100%", color: "#16a34a", label: "Mạnh" },
  ];
  const lvl = levels[Math.min(score - 1, 3)] || levels[0];
  document.getElementById("newStrengthFill").style.width = lvl.pct;
  document.getElementById("newStrengthFill").style.background = lvl.color;
  document.getElementById("newStrengthText").style.color = lvl.color;
  document.getElementById("newStrengthText").textContent = lvl.label;

  updateRule("rule-len", val.length > 6);
  updateRule("rule-upper", /[A-Z]/.test(val));
  updateRule("rule-num", /[0-9]/.test(val));

  if (document.getElementById("confPwd").value) onConfPwdInput();
}

function onConfPwdInput() {
  const pwd = document.getElementById("newPwd").value;
  const conf = document.getElementById("confPwd").value;
  clearErrP("confPwdErr", document.getElementById("confPwd"));
  if (conf && conf !== pwd) {
    showErrP("confPwdErr", "Mật khẩu nhập lại không khớp");
  }
}

// Cập nhật trạng thái icon Check xanh lá cây cho các quy tắc mật khẩu đạt chuẩn
function updateRule(id, ok) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = ok ? "ok" : "";
  el.querySelector("i").className = ok
    ? "fa-solid fa-circle-check"
    : "fa-solid fa-circle";
}

// Đăng xuất và xóa sạch dấu vết chứng thực Token
function logout() {
  if (
    confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống TrainTick không?")
  ) {
    localStorage.removeItem("token");
    window.location.href = "login.html";
  }
}
