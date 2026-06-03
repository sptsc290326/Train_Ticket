package controller.api;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.JsonObject;

import service.TrainTickService;

@WebServlet("/api/payment/process")
public class ApiPaymentController extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private final TrainTickService service = new TrainTickService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        try {
            JsonObject json = ApiUtil.readJson(request);
            String payId = ApiUtil.getString(json, "payId");
            String ticketId = firstNotBlank(ApiUtil.getString(json, "ticketId"), ApiUtil.getString(json, "idVe"));
            String method = firstNotBlank(ApiUtil.getString(json, "method"), ApiUtil.getString(json, "phuongThuc"));
            String amountStr = firstNotBlank(ApiUtil.getString(json, "amount"), ApiUtil.getString(json, "tongTien"));

            if (ApiUtil.isBlank(ticketId) || ApiUtil.isBlank(amountStr)) {
                ApiUtil.badRequest(response, "Thieu ma ve hoac so tien");
                return;
            }

            double amount = Double.parseDouble(amountStr);
            boolean success = service.processPayment(payId, ticketId, method, amount);
            if (!success) {
                ApiUtil.badRequest(response, "Thanh toan that bai. Kiem tra ma ve, trang thai ve hoac so tien");
                return;
            }

            Map<String, Object> data = new HashMap<String, Object>();
            data.put("ticketId", ticketId);
            data.put("method", method);
            data.put("amount", amountStr);
            ApiUtil.ok(response, data);
        } catch (Exception e) {
            e.printStackTrace();
            ApiUtil.serverError(response, "Loi thanh toan: " + e.getMessage());
        }
    }

    private String firstNotBlank(String a, String b) {
        return !ApiUtil.isBlank(a) ? a : b;
    }
}
