package controller.api;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class ApiUtil {
    private static final Gson GSON = new GsonBuilder().setDateFormat("yyyy-MM-dd'T'HH:mm:ss").create();

    private ApiUtil() {
    }

    public static Gson gson() {
        return GSON;
    }

    public static JsonObject readJson(HttpServletRequest request) throws IOException {
        StringBuilder body = new StringBuilder();
        BufferedReader reader = request.getReader();
        String line;

        while ((line = reader.readLine()) != null) {
            body.append(line);
        }

        if (body.length() == 0) {
            return new JsonObject();
        }

        return JsonParser.parseString(body.toString()).getAsJsonObject();
    }

    public static String getString(JsonObject json, String name) {
        if (json == null || !json.has(name) || json.get(name).isJsonNull()) {
            return null;
        }

        String value = json.get(name).getAsString();
        return value == null ? null : value.trim();
    }

    public static String getString(JsonObject json, String name, String fallback) {
        String value = getString(json, name);
        return isBlank(value) ? fallback : value;
    }

    public static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    public static void ok(HttpServletResponse response, Object data) throws IOException {
        write(response, HttpServletResponse.SC_OK, true, null, data);
    }

    public static void created(HttpServletResponse response, Object data) throws IOException {
        write(response, HttpServletResponse.SC_CREATED, true, null, data);
    }

    public static void badRequest(HttpServletResponse response, String message) throws IOException {
        write(response, HttpServletResponse.SC_BAD_REQUEST, false, message, null);
    }

    public static void unauthorized(HttpServletResponse response, String message) throws IOException {
        write(response, HttpServletResponse.SC_UNAUTHORIZED, false, message, null);
    }

    public static void forbidden(HttpServletResponse response, String message) throws IOException {
        write(response, HttpServletResponse.SC_FORBIDDEN, false, message, null);
    }

    public static void notFound(HttpServletResponse response, String message) throws IOException {
        write(response, HttpServletResponse.SC_NOT_FOUND, false, message, null);
    }

    public static void serverError(HttpServletResponse response, String message) throws IOException {
        write(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, false, message, null);
    }

    public static void write(HttpServletResponse response, int status, boolean success, String message, Object data)
            throws IOException {
        response.setStatus(status);
        response.setCharacterEncoding("UTF-8");
        response.setContentType("application/json;charset=UTF-8");

        Map<String, Object> result = new HashMap<String, Object>();
        result.put("success", success);

        if (message != null) {
            result.put("message", message);
        }

        if (data != null) {
            result.put("data", data);
        }

        response.getWriter().write(GSON.toJson(result));
    }
}
