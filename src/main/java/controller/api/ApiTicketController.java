package controller.api;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import model.ChiTietVe;
import model.Ve;
import service.TicketService;

@WebServlet(urlPatterns = { "/api/tickets", "/api/tickets/detail" })
public class ApiTicketController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private final TicketService ticketService = new TicketService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String path = request.getServletPath();
        if ("/api/tickets".equals(path)) {
            list(request, response);
        } else if ("/api/tickets/detail".equals(path)) {
            detail(request, response);
        } else {
            ApiUtil.notFound(response, "API khong ton tai");
        }
    }

    private void list(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String userId = request.getParameter("userId");
        if (ApiUtil.isBlank(userId)) {
            Object sessionUserId = request.getSession(false) == null ? null : request.getSession(false).getAttribute("userId");
            userId = sessionUserId == null ? null : String.valueOf(sessionUserId);
        }
        if (ApiUtil.isBlank(userId)) {
            ApiUtil.badRequest(response, "Thieu ma nguoi dung");
            return;
        }

        List<Ve> tickets = ticketService.layVeTheoNguoiDat(userId);
        List<Map<String, Object>> data = new ArrayList<Map<String, Object>>();
        if (tickets != null) {
            for (Ve ve : tickets) {
                data.add(ticketToMap(ve));
            }
        }
        ApiUtil.ok(response, data);
    }

    private void detail(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String idVe = request.getParameter("idVe");
        if (ApiUtil.isBlank(idVe)) {
            idVe = request.getParameter("ticketId");
        }
        if (ApiUtil.isBlank(idVe)) {
            ApiUtil.badRequest(response, "Thieu ma ve");
            return;
        }

        Ve ve = ticketService.layChiTietVe(idVe);
        if (ve == null) {
            ApiUtil.notFound(response, "Khong tim thay ve");
            return;
        }
        List<ChiTietVe> details = ticketService.layDSChiTietVe(idVe);
        Map<String, Object> data = ticketToMap(ve);
        List<Map<String, Object>> detailList = new ArrayList<Map<String, Object>>();
        if (details != null) {
            for (ChiTietVe c : details) {
                Map<String, Object> item = new HashMap<String, Object>();
                item.put("id", c.getId());
                item.put("donGia", c.getDonGia() == null ? null : c.getDonGia().toPlainString());
                item.put("thanhTien", c.getThanhTien() == null ? null : c.getThanhTien().toPlainString());
                if (c.getHanhKhach() != null) {
                    item.put("hanhKhachId", c.getHanhKhach().getId());
                    item.put("hoTenHanhKhach", c.getHanhKhach().getHoTen());
                    item.put("cccd", c.getHanhKhach().getCCCD());
                    item.put("sdt", c.getHanhKhach().getSdt());
                }
                if (c.getGheChuyen() != null) {
                    item.put("idGheChuyen", c.getGheChuyen().getId());
                    item.put("idGhe", c.getGheChuyen().getIdGhe());
                    item.put("trangThaiGheNgoi", c.getGheChuyen().getTrangThaiGheNgoi());
                }
                detailList.add(item);
            }
        }
        data.put("chiTietVe", detailList);
        ApiUtil.ok(response, data);
    }

    private Map<String, Object> ticketToMap(Ve ve) {
        Map<String, Object> item = new HashMap<String, Object>();
        item.put("id", ve.getId());
        item.put("ngayDat", ve.getNgayDat());
        item.put("tongTien", ve.getTongTien() == null ? null : ve.getTongTien().toPlainString());
        item.put("trangThaiVe", ve.getTrangThaiVe());
        if (ve.getNguoiDat() != null) {
            item.put("idNguoiDat", ve.getNguoiDat().getId());
            item.put("hoTenNguoiDat", ve.getNguoiDat().getHoTen());
        }
        return item;
    }
}
