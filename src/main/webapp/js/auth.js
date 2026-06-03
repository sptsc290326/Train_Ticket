

/* ---- BIẾN REGEX KIỂM TRA ĐỊNH DẠNG ---- */
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(com|vn|org|net|edu\.vn)$/;
const phoneRx = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;

/* ---- CÁC HÀM HIỂN THỊ LỖI (UI Helpers) ---- */
function showErr(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'flex';
  const span = el.querySelector('span');
  if (span) span.textContent = msg;
}
function clearErr(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}
function showOk(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'flex';
}
function hideOk(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}
function setInvalid(id) {
  document.getElementById(id)?.classList.add('is-invalid');
}
function setValid(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('is-invalid'); el.classList.add('is-valid'); }
}
function resetInput(id) {
  document.getElementById(id)?.classList.remove('is-invalid', 'is-valid');
}
function updateRule(id, ok) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = ok ? 'ok' : '';
  el.querySelector('i').className = ok ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle';
}

/* ---- CÁC HÀM KIỂM TRA (VALIDATION) ---- */
function validateName(blur) {
  const val = document.getElementById('regName').value.trim();
  clearErr('nameError'); resetInput('regName');
  if (blur && val === '') { showErr('nameError', 'Vui lòng nhập họ và tên'); setInvalid('regName'); return false; }
  if (val && val.length < 2) { showErr('nameError', 'Họ và tên phải có ít nhất 2 ký tự'); setInvalid('regName'); return false; }
  if (val.length >= 2) setValid('regName');
  return val.length >= 2;
}

function validateEmail(blur) {
  const val = document.getElementById('regEmail').value.trim();
  clearErr('emailError'); hideOk('emailOk'); resetInput('regEmail');
  
  if (blur && val === '') { 
    showErr('emailError', 'Vui lòng nhập email'); 
    setInvalid('regEmail'); 
    return false; 
  }
  
  // KIỂM TRA REGEX MỚI
  if (val && !emailRegex.test(val)) { 
    showErr('emailError', 'Email không hợp lệ (Chỉ nhận .com, .vn, .org, .net, .edu.vn)'); 
    setInvalid('regEmail'); 
    return false; 
  }
  
  if (emailRegex.test(val)) { 
    setValid('regEmail'); 
    showOk('emailOk'); 
  }
  
  return emailRegex.test(val);
}

function validatePhone(blur) {
  const val = document.getElementById('regPhone').value.trim();
  clearErr('phoneError'); hideOk('phoneOk'); resetInput('regPhone');
  if (blur && val === '') { showErr('phoneError', 'Vui lòng nhập số điện thoại'); setInvalid('regPhone'); return false; }
  if (val && !phoneRx.test(val)) { showErr('phoneError', 'Số điện thoại không hợp lệ (VD: 0901234567)'); setInvalid('regPhone'); return false; }
  if (phoneRx.test(val)) { setValid('regPhone'); showOk('phoneOk'); }
  return phoneRx.test(val);
}

function validatePassword(blur) {
  const val = document.getElementById('regPassword').value;
  clearErr('passwordError'); resetInput('regPassword');
  const strengthBox = document.getElementById('strengthBox');

  if (val.length === 0) {
    strengthBox.style.display = 'none';
    updateRule('rule-len', false); updateRule('rule-upper', false); updateRule('rule-num', false);
    if (blur) { showErr('passwordError', 'Vui lòng nhập mật khẩu'); setInvalid('regPassword'); }
    return false;
  }

  strengthBox.style.display = 'block';
  const score = getPasswordStrengthScore(val);
  const fill = document.getElementById('strengthFill');
  const text = document.getElementById('strengthText');
  const levels = [
    { pct: '25%', color: '#dc2626', label: 'Rất yếu' },
    { pct: '50%', color: '#f97316', label: 'Yếu' },
    { pct: '75%', color: '#f4b71a', label: 'Trung bình' },
    { pct: '100%', color: '#16a34a', label: 'Mạnh' },
  ];
  const lvl = levels[Math.min(score - 1, 3)] || levels[0];
  fill.style.width = lvl.pct;
  fill.style.background = lvl.color;
  text.style.color = lvl.color;
  text.textContent = lvl.label;

  const lenOk   = val.length > 6;
  const upperOk = /[A-Z]/.test(val);
  const numOk   = /[0-9]/.test(val);
  updateRule('rule-len',   lenOk);
  updateRule('rule-upper', upperOk);
  updateRule('rule-num',   numOk);

  if (!lenOk) {
    if (blur) { showErr('passwordError', 'Mật khẩu phải có hơn 6 ký tự'); setInvalid('regPassword'); }
    return false;
  }
  if (!upperOk) {
    if (blur) { showErr('passwordError', 'Mật khẩu phải có ít nhất 1 chữ hoa'); setInvalid('regPassword'); }
    return false;
  }
  if (!numOk) {
    if (blur) { showErr('passwordError', 'Mật khẩu phải có ít nhất 1 chữ số'); setInvalid('regPassword'); }
    return false;
  }

  setValid('regPassword');
  if (document.getElementById('regPasswordConfirm').value) validateConfirm();
  return true;
}

function getPasswordStrengthScore(pwd) {
  let score = 0;
  if (pwd.length > 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(score, 4);
}

function validateConfirm(blur) {
  const pwd  = document.getElementById('regPassword').value;
  const conf = document.getElementById('regPasswordConfirm').value;
  clearErr('confirmError'); hideOk('confirmOk'); resetInput('regPasswordConfirm');
  if (blur && conf === '') { showErr('confirmError', 'Vui lòng nhập lại mật khẩu'); setInvalid('regPasswordConfirm'); return false; }
  if (conf && conf !== pwd) { showErr('confirmError', 'Mật khẩu nhập lại không khớp'); setInvalid('regPasswordConfirm'); return false; }
  if (conf && conf === pwd) { setValid('regPasswordConfirm'); showOk('confirmOk'); }
  return conf === pwd && conf !== '';
}


/* ---- GỬI DỮ LIỆU ĐĂNG KÝ XUỐNG BACKEND ---- */
async function register() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const password = document.getElementById('regPassword').value;
  const isAgree = document.getElementById('agreeTerms').checked;

  const isNameValid = validateName(true);
  const isEmailValid = validateEmail(true);
  const isPhoneValid = validatePhone(true);
  const isPassValid = validatePassword(true);
  const isConfirmValid = validateConfirm(true);

  const termsError = document.getElementById('termsError');
  if (!isAgree) {
    termsError.style.display = 'flex';
  } else {
    termsError.style.display = 'none';
  }

  if (!isNameValid || !isEmailValid || !isPhoneValid || !isPassValid || !isConfirmValid || !isAgree) {
    return;
  }

  const registerData = { fullName: name, email: email, phone: phone, password: password };

  try {
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });

    const result = await response.json();

    if (response.ok) {
      alert('Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...');
      window.location.href = 'login.html';
    } else {
      alert('Lỗi đăng ký: ' + (result.message || 'Vui lòng thử lại sau.'));
    }

  } catch (error) {
    console.error('Lỗi kết nối tới Server:', error);
    alert('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng hoặc Backend.');
  }
}