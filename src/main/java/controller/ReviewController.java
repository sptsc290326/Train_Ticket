package controller;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import service.TrainTickService;

@WebServlet(urlPatterns = { "/ReviewController", "/review" })
public class ReviewController extends HttpServlet {
    private static final long serialVersionUID = 1L;

    private TrainTickService service = new TrainTickService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        String type = request.getParameter("type");
        String message;

        if ("create".equals(type)) {
            message = xuLyTaoDanhGia(request);
        } else if ("reply".equals(type)) {
            message = xuLyPhanHoiDanhGia(request);
        } else {
            message = "Loại thao tác đánh giá không hợp lệ.";
        }

        request.setAttribute("msg", message);
        request.getRequestDispatcher("/index.jsp").forward(request, response);
    }

    private String xuLyTaoDanhGia(HttpServletRequest request) {
        try {
            String reviewId = request.getParameter("reviewId");
            String ticketId = request.getParameter("ticketId");
            String starsStr = request.getParameter("stars");
            String content = request.getParameter("content");

            int stars = Integer.parseInt(starsStr);
            boolean success = service.createReview(reviewId, ticketId, stars, content);

            if (success) {
                return "Thêm đánh giá thành công cho vé " + ticketId;
            }

            return "Đánh giá thất bại. Kiểm tra mã vé, số sao hoặc vé đã được đánh giá chưa.";

        } catch (Exception e) {
            return "Đánh giá thất bại. Dữ liệu gửi lên không hợp lệ.";
        }
    }

    private String xuLyPhanHoiDanhGia(HttpServletRequest request) {
        String reviewId = request.getParameter("reviewId");
        String adminId = request.getParameter("adminId");
        String replyContent = request.getParameter("replyContent");

        boolean success = service.replyReview(reviewId, adminId, replyContent);

        if (success) {
            return "Phản hồi đánh giá thành công cho mã đánh giá " + reviewId;
        }

        return "Phản hồi đánh giá thất bại. Kiểm tra mã đánh giá.";
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.sendRedirect(request.getContextPath() + "/index.jsp");
    }
}
