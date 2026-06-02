package controller;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import model.HanhKhach;
import model.Ve;
import service.BookingService;

/**
 * Servlet implementation class BookingController
 */
@WebServlet(urlPatterns = {"/booking/hold-seat", "/booking/create"})
public class BookingController extends HttpServlet {
	private static final long serialVersionUID = 1L;

    private BookingService bService = new BookingService();

    public BookingController() {
        super();
        // TODO Auto-generated constructor stub
    }

    @Override
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		 String path = request.getServletPath();

	        if ("/booking/create".equals(path)) {
	            hienThiFormNhap(request, response);
	        } else {
	            response.sendRedirect(request.getContextPath() + "/index.jsp");
	        }
	}

	@Override
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        String path = request.getServletPath();

        if ("/booking/hold-seat".equals(path)) {
            xuLyGiuGhe(request, response);
        } else if ("/booking/create".equals(path)) {
            xuLyTaoVe(request, response);
        } else {
            response.sendRedirect(request.getContextPath() + "/index.jsp");
        }
	}
	private void hienThiFormNhap(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String userId = request.getParameter("userId");
        List<String> seatIds = layDSGhe(request);

        request.setAttribute("userId", userId);
        request.setAttribute("seatIds", seatIds);

        RequestDispatcher rd = request.getRequestDispatcher("/WEB-INF/view/passenger-form.jsp");
        rd.forward(request, response);
    }

    private void xuLyGiuGhe(HttpServletRequest request, HttpServletResponse response)
            throws IOException {

        String idGheChuyen = request.getParameter("idGheChuyen");

        boolean thanhCong = bService.giuGhe(idGheChuyen);

        response.setContentType("application/json; charset=UTF-8");

        if (thanhCong) {
            response.getWriter().write("{\"success\":true}");
        } else {
            response.getWriter().write("{\"success\":false}");
        }
    }

    private void xuLyTaoVe(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        try {
            String idNguoiDat = request.getParameter("userId");
            List<String> dsGhe = layDSGhe(request);

            String[] hoTenArr = request.getParameterValues("hoTen");
            String[] cccdArr = request.getParameterValues("CCCD");
            String[] ngaySinhArr = request.getParameterValues("ngaySinh");
            String[] sdtArr = request.getParameterValues("sdt");

            List<HanhKhach> dsHanhKhach = new ArrayList<HanhKhach>();
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

            for (int i = 0; i < dsGhe.size(); i++) {
                HanhKhach hk = new HanhKhach();

                hk.setHoTen(hoTenArr[i]);
                hk.setCCCD(cccdArr[i]);
                hk.setSdt(sdtArr[i]);

                if (ngaySinhArr[i] != null && !ngaySinhArr[i].trim().isEmpty()) {
                    hk.setNgaySinh(sdf.parse(ngaySinhArr[i]));
                }

                dsHanhKhach.add(hk);
            }

            Ve ve = bService.taoVe(idNguoiDat, dsGhe, dsHanhKhach);

            if (ve == null) {
                request.setAttribute("message", "Tạo vé thất bại");
//                request.getRequestDispatcher("/error.jsp").forward(request, response);
                return;
            }

            response.sendRedirect(request.getContextPath() + "/ticket/detail?idVe=" + ve.getId());

        } catch (Exception e) {
            e.printStackTrace();
            request.setAttribute("message", "Lỗi xử lý tạo vé: " + e.getMessage());
            request.getRequestDispatcher("/error.jsp").forward(request, response);
        }
    }

    private List<String> layDSGhe(HttpServletRequest request) {
        String[] seatIdsArr = request.getParameterValues("seatIds");

        if (seatIdsArr != null && seatIdsArr.length > 0) {
            return Arrays.asList(seatIdsArr);
        }

        String seatIds = request.getParameter("seatIds");

        if (seatIds == null || seatIds.trim().isEmpty()) {
            return new ArrayList<>();
        }

        return Arrays.asList(seatIds.split(","));
    }

}
