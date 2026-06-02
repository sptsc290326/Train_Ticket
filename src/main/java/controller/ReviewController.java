package controller;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import service.TrainTickService;

@WebServlet("/ReviewController")
public class ReviewController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private TrainTickService service = new TrainTickService();

    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        String type = request.getParameter("type");
        String message = "";

        if ("create".equals(type)) {
            // Chức năng: Đánh giá
            String reviewId = request.getParameter("reviewId");
            String userId = request.getParameter("userId"); // 'USER01'
            String trainId = request.getParameter("trainId"); // 'CT01'
            int stars = Integer.parseInt(request.getParameter("stars"));
            String content = request.getParameter("content");
            
            boolean success = service.createReview(reviewId, userId, trainId, stars, content);
            message = success ? "Thêm đánh giá " + reviewId + " thành công cho chuyến tàu " + trainId : "Lỗi: Đánh giá thất bại!";
            
        } else if ("reply".equals(type)) {
            // Chức năng: Phản hồi đánh giá
            String reviewId = request.getParameter("reviewId"); // 'DG01' có sẵn trong SQL
            String reply = request.getParameter("replyContent");
            
            boolean success = service.replyReview(reviewId, reply);
            message = success ? "Gửi phản hồi của ban quản trị thành công cho mã đánh giá " + reviewId : "Lỗi: Giao dịch thất bại!";
        }

        request.setAttribute("msg", message);
        request.getRequestDispatcher("index.jsp").forward(request, response);
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        doPost(request, response);
    }
}