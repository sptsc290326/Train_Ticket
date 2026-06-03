document.addEventListener("DOMContentLoaded", () => {
  const savedSeats = JSON.parse(localStorage.getItem("selectedSeats")) || [];

  if (savedSeats.length > 0) {
    const passengerSeat1 = document.getElementById("passengerSeat1");
    const passengerSeat2 = document.getElementById("passengerSeat2");
    const selectedSeatsSummary = document.getElementById(
      "selectedSeatsSummary",
    );
    const selectedSeatCount = document.getElementById("selectedSeatCount");

    if (passengerSeat1 && savedSeats[0]) {
      passengerSeat1.textContent = `Hành khách 1 - Ghế ${savedSeats[0]}`;
    }

    if (passengerSeat2 && savedSeats[1]) {
      passengerSeat2.textContent = `Hành khách 2 - Ghế ${savedSeats[1]}`;
    }

    if (selectedSeatsSummary) {
      selectedSeatsSummary.innerHTML = savedSeats
        .map((seat) => `<em>${seat}</em>`)
        .join("");
    }

    if (selectedSeatCount) {
      selectedSeatCount.textContent = savedSeats.length;
    }
    if (selectedSeatCount) {
      selectedSeatCount.textContent = savedSeats.length;
    }

    const paymentSeatsSummary = document.getElementById("paymentSeatsSummary");

    if (paymentSeatsSummary && savedSeats.length > 0) {
      paymentSeatsSummary.innerHTML = savedSeats
        .map((seat) => `<em>${seat}</em>`)
        .join("");
    }
  }

  const selectedTicketTotal =
    Number(localStorage.getItem("selectedTicketTotal")) || 2400000;

  const selectedSeatCountValue =
    Number(localStorage.getItem("selectedSeatCount")) || savedSeats.length || 2;

  const serviceFeeValue = 20000;

  const informationTotal = document.getElementById("informationTotal");

  if (informationTotal) {
    informationTotal.textContent =
      selectedTicketTotal.toLocaleString("vi-VN") + "đ";
  }

  const paymentSeatsSummary = document.getElementById("paymentSeatsSummary");

  if (paymentSeatsSummary && savedSeats.length > 0) {
    paymentSeatsSummary.innerHTML = savedSeats
      .map((seat) => `<em>${seat}</em>`)
      .join("");
  }

  const paymentTicketLabel = document.getElementById("paymentTicketLabel");

  if (paymentTicketLabel) {
    paymentTicketLabel.textContent = `Giá vé (${selectedSeatCountValue} vé)`;
  }

  const paymentTicketPrice = document.getElementById("paymentTicketPrice");

  if (paymentTicketPrice) {
    paymentTicketPrice.textContent =
      selectedTicketTotal.toLocaleString("vi-VN") + "đ";
  }

  const serviceFee = document.getElementById("serviceFee");

  if (serviceFee) {
    serviceFee.textContent = serviceFeeValue.toLocaleString("vi-VN") + "đ";
  }

  const finalTotal = document.getElementById("finalTotal");

  if (finalTotal) {
    finalTotal.textContent =
      (selectedTicketTotal + serviceFeeValue).toLocaleString("vi-VN") + "đ";
  }

  const qrBox = document.getElementById("qrcode");

  if (qrBox) {
    const ticketCode = "TKN5SVTIWG6vvvv ";

    new QRCode(qrBox, {
      text: ticketCode,
      width: 150,
      height: 150,
    });
  }
  const payNowBtn = document.getElementById("payNowBtn");

  if (payNowBtn) {
    payNowBtn.addEventListener("click", () => {
      const selectedSeats =
        JSON.parse(localStorage.getItem("selectedSeats")) || [];

      const ticketTotal =
        Number(localStorage.getItem("selectedTicketTotal")) || 2400000;

      const finalTotal =
        Number(localStorage.getItem("finalTotal")) || ticketTotal + 20000;

      const promoCode = localStorage.getItem("promoCode") || "";

      const paidTicket = {
        ticketCode: "TK" + Date.now(),

        train: localStorage.getItem("selectedTrain") || "SE1",

        route: localStorage.getItem("selectedRoute") || "Sài Gòn → Hà Nội",

        date: localStorage.getItem("selectedDate") || "15/05/2026 - 06:00",

        seats: selectedSeats,

        ticketTotal: ticketTotal,

        serviceFee: 20000,

        finalTotal: finalTotal,

        promoCode: promoCode,

        status: "Đã thanh toán",
      };
      localStorage.setItem("paidTicket", JSON.stringify(paidTicket));

      alert("Thanh toán thành công!");
      window.location.href = "ticket-detail.html";
    });
  }
  const timerText = document.querySelector(".timer b");

  if (timerText) {
    let timeLeft = 10 * 60;

    const countdown = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;

      timerText.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;

      if (timeLeft <= 0) {
        clearInterval(countdown);
        alert("Đã hết thời gian giữ chỗ. Vui lòng đặt vé lại.");
        window.location.href = "information.html";
      }

      timeLeft--;
    }, 1000);
  }

  const paymentOptions = document.querySelectorAll(".payment-option");

  paymentOptions.forEach((option) => {
    option.addEventListener("click", () => {
      paymentOptions.forEach((item) => {
        item.classList.remove("active");
      });

      option.classList.add("active");

      const radio = option.querySelector("input[type='radio']");

      if (radio) {
        radio.checked = true;
      }
    });
  });
  const promoButton = document.querySelector(".coupon-row button");
  const promoInput = document.querySelector(".coupon-input input");
  const totalElement = document.getElementById("finalTotal");

  const baseTicketTotal =
    Number(localStorage.getItem("selectedTicketTotal")) || 2400000;

  const ORIGINAL_TOTAL = baseTicketTotal + 20000;

  const promoCodes = {
    G7TRAIN: {
      type: "fixed",
      value: 120000,
    },

    SALE10: {
      type: "percent",
      value: 10,
    },

    STUDENT: {
      type: "percent",
      value: 15,
    },

    WELCOME50: {
      type: "fixed",
      value: 50000,
    },
  };

  if (promoButton && promoInput && totalElement) {
    promoButton.addEventListener("click", () => {
      const code = promoInput.value.trim().toUpperCase();

      if (!code) {
        alert("Vui lòng nhập mã khuyến mãi");
        return;
      }

      if (!promoCodes[code]) {
        alert("Mã khuyến mãi không hợp lệ");

        totalElement.textContent = ORIGINAL_TOTAL.toLocaleString("vi-VN") + "đ";

        return;
      }

      const promo = promoCodes[code];

      let discount = 0;

      if (promo.type === "fixed") {
        discount = promo.value;
      } else {
        discount = (ORIGINAL_TOTAL * promo.value) / 100;
      }

      const finalPrice = ORIGINAL_TOTAL - discount;

      totalElement.textContent = finalPrice.toLocaleString("vi-VN") + "đ";

      localStorage.setItem("promoCode", code);

      localStorage.setItem("finalTotal", finalPrice);

      alert("Áp dụng mã thành công");
    });
  }
  const cancelButtons = document.querySelectorAll(".cancel-ticket-btn");

  cancelButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const confirmCancel = confirm("Bạn có chắc chắn muốn hủy vé này?");
      if (confirmCancel) {
        const ticketCard = btn.closest(".ticket-card");
        if (ticketCard) {
          ticketCard.remove();
        }
        const remainingTickets = document.querySelectorAll(".ticket-card");
        if (remainingTickets.length === 0) {
          document.getElementById("emptyTicketMessage").style.display = "block";
        }
      }
    });
  });

  const payButtons = document.querySelectorAll(".pay-now-btn");

  payButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      alert("Chuyển đến cổng thanh toán...");
    });
  });

  const detailButtons = document.querySelectorAll(".detail-btn");

  detailButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      window.location.href = "ticket-detail.html";
    });
  });
  const downloadBtn = document.querySelector(".download-ticket");

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      const ticket = document.getElementById("ticketPDF");

      if (!ticket) {
        alert("Không tìm thấy vé để tải PDF");
        return;
      }

      const options = {
        margin: [8, 8, 8, 8],
        filename: "ve-dien-tu-traintick.pdf",
        image: {
          type: "jpeg",
          quality: 1,
        },
        html2canvas: {
          scale: 1.5,
          useCORS: true,
          scrollY: 0,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
        },
      };

      html2pdf().set(options).from(ticket).save();
    });
  }

  const resendBtn = document.querySelector(".resend-email");

  if (resendBtn) {
    resendBtn.addEventListener("click", () => {
      alert("Đã gửi lại email xác nhận");
    });
  }

  const logoutButton = document.querySelector(".logout");

  if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault();

      const result = confirm("Bạn muốn đăng xuất?");

      if (result) {
        window.location.href = "login.html";
      }
    });
  }
  const continueBtn = document.getElementById("continueBtn");
  if (continueBtn) {
    continueBtn.addEventListener("click", () => {
      let valid = true;
      clearErrors();
      const bookerName = document.getElementById("bookerName");
      const phone = document.getElementById("phone");
      const email = document.getElementById("email");
      valid =
        validateRequired(bookerName, "Vui lòng nhập họ tên người đặt vé") &&
        valid;
      valid = validatePhone(phone) && valid;
      valid = validateEmail(email) && valid;
      document.querySelectorAll(".passenger-name").forEach((input) => {
        valid =
          validateRequired(input, "Vui lòng nhập họ tên hành khách") && valid;
      });
      document.querySelectorAll(".birth-date").forEach((input) => {
        valid = validateRequired(input, "Vui lòng chọn ngày sinh") && valid;
      });
      document.querySelectorAll(".cccd").forEach((input) => {
        valid = validateCCCD(input) && valid;
      });
      document.querySelectorAll(".passenger-type").forEach((input) => {
        valid =
          validateRequired(input, "Vui lòng chọn loại đối tượng") && valid;
      });
      if (valid) {
        window.location.href = "payment.html";
      }
    });
  }

  const phoneInput = document.querySelector("#phone");
  if (phoneInput) {
    phoneInput.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "");
    });
  }

  document.querySelectorAll(".cccd").forEach((input) => {
    input.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "");
    });
  });

  document.querySelectorAll("input, select").forEach((element) => {
    element.addEventListener("input", () => {
      element.classList.remove("input-error");

      const field = element.closest(".field");

      if (field) {
        field.classList.remove("input-error");
      }

      const parent = element.closest(".col-md-6") || element.closest(".col-12");

      if (!parent) return;

      const error = parent.querySelector(".error-message");

      if (error) {
        error.textContent = "";
      }
    });
  });
});

function validateRequired(input, message) {
  if (!input || input.value.trim() === "") {
    showError(input, message);
    return false;
  }

  return true;
}

function validatePhone(input) {
  if (!input || !/^[0-9]{10}$/.test(input.value.trim())) {
    showError(input, "Số điện thoại phải gồm đúng 10 số");
    return false;
  }

  return true;
}

function validateEmail(input) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  console.log("Email:", input.value);
  console.log("Kết quả:", regex.test(input.value.trim()));

  if (!input || !regex.test(input.value.trim())) {
    showError(input, "Email không đúng định dạng");
    return false;
  }

  return true;
}

function validateCCCD(input) {
  if (!input || !/^[0-9]{12}$/.test(input.value.trim())) {
    showError(input, "CCCD phải gồm đúng 12 số");
    return false;
  }
  return true;
}

function showError(input, message) {
  if (!input) return;

  const parent = input.closest(".col-md-6") || input.closest(".col-12");
  if (!parent) return;
  const error = parent.querySelector(".error-message");
  if (error) {
    error.textContent = message;
    error.style.color = "#dc2626";
  }

  const field = input.closest(".field");

  if (field) {
    field.classList.add("input-error");
  }

  input.classList.add("input-error");
}

function clearErrors() {
  document.querySelectorAll(".input-error").forEach((item) => {
    item.classList.remove("input-error");
  });

  document.querySelectorAll(".error-message").forEach((item) => {
    item.textContent = "";
  });
}

const backBtn = document.querySelector(".back-btn");

if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "tickets.html";
  });
}

let selectedSeats = [];

document.querySelectorAll(".seat-box").forEach((seat) => {
  seat.addEventListener("click", () => {
    seat.classList.toggle("selected");

    const seatNumber = seat.textContent.trim();

    if (selectedSeats.includes(seatNumber)) {
      selectedSeats = selectedSeats.filter((item) => item !== seatNumber);
    } else {
      selectedSeats.push(seatNumber);
    }

    localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));
  });
});

const seats = JSON.parse(localStorage.getItem("selectedSeats")) || [];

if (seats[0]) {
  document.getElementById("passengerSeat1").textContent =
    `Hành khách 1 - Ghế ${seats[0]}`;
}

if (seats[1]) {
  document.getElementById("passengerSeat2").textContent =
    `Hành khách 2 - Ghế ${seats[1]}`;
}
