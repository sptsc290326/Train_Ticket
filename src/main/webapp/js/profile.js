/* ========================================================
   FILE: profile.js
   CHUC NANG: Lay dung thong tin user dang dang nhap tu session backend
   ======================================================== */

const BASE_URL = "api";

function apiUrl(endpoint) {
  return `${BASE_URL}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;
}

async function fetchApi(endpoint, method = "GET", body = null) {
  const config = {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  };

  if (body !== null) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(apiUrl(endpoint), config);
  const json = await response.json().catch(() => ({}));

  if (!response.ok || json.success === false) {
    throw new Error(json.message || `Loi API ${response.status}`);
  }

  return json.data || json;
}

function normalizeDate(value) {
  if (!value) return "";
  if (typeof value === "string") {
    if (value.includes("T")) return value.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [d, m, y] = value.split("/");
      return `${y}-${m}-${d}`;
    }
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

function normalizeGender(value) {
  if (value === true || value === "true" || value === 1 || value === "1" || value === "male") return "male";
  if (value === false || value === "false" || value === 0 || value === "0" || value === "female") return "female";
  return "";
}

function normalizeUser(user) {
  return {
    id: user?.id || "",
    fullName: user?.hoTen || user?.fullName || "",
    email: user?.email || "",
    phone: user?.sdt || user?.phone || "",
    gender: normalizeGender(user?.gioiTinh ?? user?.gender),
    dob: normalizeDate(user?.ngaySinh || user?.dob),
    address: localStorage.getItem("profileAddress") || user?.diaChi || user?.address || "",
    vaiTro: user?.vaiTro || user?.role || "KHACH_HANG",
  };
}

function clearLoginCache() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("token");
  localStorage.removeItem("isLogin");
  localStorage.removeItem("role");
  localStorage.removeItem("username");
  localStorage.removeItem("G7_User_Profile");
}

document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();

  const hash = window.location.hash.replace("#", "");
  if (["info", "tickets", "password"].includes(hash)) switchTab(hash);
});

async function loadUserProfile() {
  try {
    // Luon lay user dang dang nhap tu session backend, khong uu tien localStorage cu.
    const userData = await fetchApi("/auth/me", "GET");
    localStorage.setItem("currentUser", JSON.stringify(userData));
    localStorage.setItem("isLogin", "true");
    localStorage.setItem("role", userData.vaiTro || "KHACH_HANG");

    fillProfileUI(normalizeUser(userData));
  } catch (error) {
    console.warn("Khong lay duoc thong tin user dang dang nhap:", error);
    clearLoginCache();
    window.location.href = "login.html";
  }
}

function fillProfileUI(data) {
  if (!data) return;

  const setValue = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value || "";
  };

  setValue("infoName", data.fullName);
  setValue("infoEmail", data.email);
  setValue("infoPhone", data.phone);
  setValue("infoGender", data.gender);
  setValue("infoDob", data.dob);
  setValue("infoAddress", data.address);

  const sidebarName = document.querySelector(".sidebar-user .name");
  const sidebarEmail = document.querySelector(".sidebar-user .email");
  const avatarCircle = document.querySelector(".avatar-circle");

  if (sidebarName) sidebarName.textContent = data.fullName || "Tai khoan";
  if (sidebarEmail) sidebarEmail.textContent = data.email || "";
  if (avatarCircle) avatarCircle.textContent = (data.fullName || "U").trim().charAt(0).toUpperCase();
}

async function saveInfo() {
  const name = document.getElementById("infoName").value.trim();
  const email = document.getElementById("infoEmail").value.trim();
  const phone = document.getElementById("infoPhone").value.trim();
  const gender = document.getElementById("infoGender").value;
  const dob = document.getElementById("infoDob").value;
  const address = document.getElementById("infoAddress").value.trim();

  clearErrP("infoNameErr", document.getElementById("infoName"));
  clearErrP("infoEmailErr", document.getElementById("infoEmail"));
  clearErrP("infoPhoneErr", document.getElementById("infoPhone"));

  let valid = true;
  if (name.length < 2) {
    showErrP("infoNameErr", "Ho va ten qua ngan");
    valid = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showErrP("infoEmailErr", "Email khong dung dinh dang");
    valid = false;
  }
  if (!/^(0|\+84)[0-9]{9,10}$/.test(phone)) {
    showErrP("infoPhoneErr", "So dien thoai khong hop le");
    valid = false;
  }
  if (!valid) return;

  const updateData = {
    hoTen: name,
    email,
    sdt: phone,
    gioiTinh: gender === "male" ? true : gender === "female" ? false : null,
    ngaySinh: dob || null,
    fullName: name,
    phone,
    gender,
    dob,
  };

  const btn = document.getElementById("saveInfoBtn");
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Dang luu...';

  try {
    const savedUser = await fetchApi("/users/profile", "PUT", updateData);
    localStorage.setItem("currentUser", JSON.stringify(savedUser));
    localStorage.setItem("profileAddress", address);

    fillProfileUI({ ...normalizeUser(savedUser), address });
    showToast("Cap nhat thong tin tai khoan thanh cong!", "success");
  } catch (error) {
    showToast(error.message || "Khong cap nhat duoc thong tin tai khoan", "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Luu thay doi';
  }
}

async function changePassword() {
  const cur = document.getElementById("curPwd").value;
  const newP = document.getElementById("newPwd").value;
  const conf = document.getElementById("confPwd").value;

  clearErrP("curPwdErr", document.getElementById("curPwd"));
  clearErrP("newPwdErr", document.getElementById("newPwd"));
  clearErrP("confPwdErr", document.getElementById("confPwd"));

  if (!cur) {
    showErrP("curPwdErr", "Vui long nhap mat khau hien tai");
    return;
  }
  if (newP.length <= 6 || !/[A-Z]/.test(newP) || !/[0-9]/.test(newP)) {
    showErrP("newPwdErr", "Mat khau moi chua dap ung du quy tac bao mat");
    return;
  }
  if (conf !== newP) {
    showErrP("confPwdErr", "Mat khau xac nhan lai khong khop");
    return;
  }

  const btn = document.getElementById("changePwdBtn");
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Dang xu ly...';

  try {
    await fetchApi("/users/profile/password", "PUT", {
      currentPassword: cur,
      newPassword: newP,
    });

    document.getElementById("curPwd").value = "";
    document.getElementById("newPwd").value = "";
    document.getElementById("confPwd").value = "";
    document.getElementById("newPwdStrength").style.display = "none";
    ["rule-len", "rule-upper", "rule-num"].forEach((id) => updateRule(id, false));

    showToast("Mat khau da duoc thay doi thanh cong!", "success");
  } catch (error) {
    showToast(error.message || "Mat khau hien tai khong dung", "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-key"></i> Doi mat khau';
  }
}

function switchTab(tab) {
  if (tab === "tickets") {
    window.location.href = "view_tickets.html";
    return;
  }

  ["info", "password"].forEach((t) => {
    document.getElementById("panel-" + t)?.classList.remove("active");
    document.getElementById("tab-" + t + "-li")?.classList.remove("active");
  });
  document.getElementById("panel-" + tab)?.classList.add("active");
  document.getElementById("tab-" + tab + "-li")?.classList.add("active");
}

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

function showErrP(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = "flex";
  el.querySelector("span").textContent = msg;

  if (id.includes("Name")) document.getElementById("infoName")?.classList.add("is-invalid");
  if (id.includes("Email")) document.getElementById("infoEmail")?.classList.add("is-invalid");
  if (id.includes("Phone")) document.getElementById("infoPhone")?.classList.add("is-invalid");
  if (id.includes("curPwd")) document.getElementById("curPwd")?.classList.add("is-invalid");
  if (id.includes("newPwd")) document.getElementById("newPwd")?.classList.add("is-invalid");
  if (id.includes("confPwd")) document.getElementById("confPwd")?.classList.add("is-invalid");
}

function clearErrP(id, inputEl) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
  if (inputEl) inputEl.classList.remove("is-invalid");
}

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
    { pct: "25%", color: "#dc2626", label: "Rat yeu" },
    { pct: "50%", color: "#f97316", label: "Yeu" },
    { pct: "75%", color: "#f4b71a", label: "Trung binh" },
    { pct: "100%", color: "#16a34a", label: "Manh" },
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
  if (conf && conf !== pwd) showErrP("confPwdErr", "Mat khau nhap lai khong khop");
}

function updateRule(id, ok) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = ok ? "ok" : "";
  el.querySelector("i").className = ok ? "fa-solid fa-circle-check" : "fa-solid fa-circle";
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `profile-toast ${type}`;
  toast.textContent = message;
  toast.style.cssText = "position:fixed;right:24px;top:24px;z-index:9999;padding:12px 16px;border-radius:10px;background:#111827;color:#fff;box-shadow:0 10px 25px rgba(0,0,0,.2);font-weight:600";
  if (type === "success") toast.style.background = "#16a34a";
  if (type === "error") toast.style.background = "#dc2626";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

async function logout() {
  if (!confirm("Ban co chac chan muon dang xuat khong?")) return;
  try {
    await fetchApi("/auth/logout", "POST", {});
  } catch (e) {
    console.warn(e.message);
  }
  clearLoginCache();
  window.location.href = "login.html";
}
