function login() {

    const username =
        document.getElementById("username").value.trim();

    const password =
        document.getElementById("password").value.trim();

    const error =
        document.getElementById("usernameError");

    error.innerHTML = "";

    const emailRegex =
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.(com|vn|org|net|edu\.vn)$/;

    const phoneRegex =
        /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;

    if(username === ""){

        error.innerHTML =
            "Vui lòng nhập Email hoặc SĐT";

        return;
    }

    if(
        !emailRegex.test(username) &&
        !phoneRegex.test(username)
    ){

        error.innerHTML =
            "Email hoặc số điện thoại không hợp lệ";

        return;
    }

    if(password === ""){

        alert("Vui lòng nhập mật khẩu");

        return;
    }

    // TÀI KHOẢN ADMIN

    if(
        username === "admin@gmail.com" &&
        password === "123456"
    ){

        localStorage.setItem(
            "isLogin",
            "true"
        );

        localStorage.setItem(
            "role",
            "admin"
        );

        window.location.href =
            "admin.html";

        return;
    }

    // KHÁCH HÀNG

    localStorage.setItem(
        "isLogin",
        "true"
    );

    localStorage.setItem(
        "role",
        "user"
    );

    localStorage.setItem(
        "username",
        username
    );

    window.location.href =
        "home.html";

}
function logout(){

    localStorage.removeItem("role");
    localStorage.removeItem("isLogin");

    window.location.href =
        "login.html";
}

function showAddUserModal(){

    alert("Mở form thêm người dùng");
}
// XỬ LÝ QUÊN MẬT KHẨU ---
function sendResetLink(){

    const value =
        document.getElementById("forgotInput").value;

    const error =
        document.getElementById("forgotError");

    error.innerHTML = "";

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const phoneRegex =
        /^(0|\+84)[0-9]{9,10}$/;

    if(
        !emailRegex.test(value) &&
        !phoneRegex.test(value)
    ){
        error.innerHTML =
            "Email hoặc số điện thoại không hợp lệ";
        return;
    }

    alert(
        "Yêu cầu đặt lại mật khẩu đã được gửi!"
    );

    window.location.href =
        "login.html";

}

let selectedRating = 0;

const stars =
    document.querySelectorAll(".star-rating");

stars.forEach(star => {

    star.addEventListener("click", function(){

        selectedRating = this.dataset.value;

        stars.forEach(s => {
            s.classList.remove("fa-solid");
            s.classList.add("fa-regular");
            s.style.color = "#d1d5db";
        });

        for(let i=0;i<selectedRating;i++){

            stars[i].classList.remove("fa-regular");
            stars[i].classList.add("fa-solid");
            stars[i].style.color = "#f4b71a";

        }

    });

});
function sendReview(){

    const review =
        document.getElementById("reviewInput").value;

    if(selectedRating == 0){

        alert("Vui lòng chọn số sao!");
        return;
    }

    if(review.trim() === ""){

        alert("Vui lòng nhập nhận xét!");
        return;
    }

    let starsHtml = "";

    for(let i=0;i<selectedRating;i++){
        starsHtml += "★";
    }

    const reviewHTML = `

    <div class="customer-card">

        <div class="review-header">
            <strong>Bạn</strong>
            <span>${new Date().toLocaleDateString()}</span>
        </div>

        <div class="star-yellow">
            ${starsHtml}
        </div>

        <p>
            ${review}
        </p>

    </div>

    `;

    document
        .getElementById("reviewList")
        .insertAdjacentHTML(
            "afterbegin",
            reviewHTML
        );

    document.getElementById("reviewInput").value="";

    selectedRating = 0;

    stars.forEach(star=>{

        star.classList.remove("fa-solid");
        star.classList.add("fa-regular");
        star.style.color="#d1d5db";

    });

    alert("Đánh giá thành công!");
}

let currentReviewCard = null;

function showReplyForm(button) {

    currentReviewCard =
        button.closest(".customer-card");

    const form =
        document.getElementById("replyForm");

    currentReviewCard.after(form);

    form.style.display = "block";

    form.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

function sendReply() {

    const reply =
        document.getElementById("replyInput").value;

    if(reply.trim() === ""){

        alert("Vui lòng nhập phản hồi!");
        return;
    }

    const oldReply =
        currentReviewCard.querySelector(".reply-box");

    if(oldReply){
        oldReply.remove();
    }

    const responseBox =
        document.createElement("div");

    responseBox.className = "reply-box";

    responseBox.innerHTML = `
        <strong>Phản hồi từ G7 TrainTick</strong>
        <p>${reply}</p>
    `;

    currentReviewCard.appendChild(responseBox);

    document.getElementById("replyInput").value = "";

    document.getElementById("replyForm").style.display = "none";

    alert("Phản hồi đã được gửi!");
}