# TrainTick — Hướng dẫn JPA/Hibernate & Câu truy vấn mẫu

---

## 1. Mô hình quan hệ giữa các bảng

```
Tau ──< ToaTau ──< GheNgoi ──< GheChuyen >── ChuyenTau >── TuyenDuong >── GaTau (×2)
                                    │               │
                                    │           ChuyenTau >── Tau
                                    │
                                ChiTietVe >── Ve >── User
                                    │
                                HanhKhach >── User
                                
Ve >── ThanhToan
Ve >── DanhGia >── User (admin phản hồi)
```

---

## 2. Phân loại bảng cha / bảng con

| Bảng cha (bị tham chiếu) | Bảng con (chứa FK) |
|---|---|
| `Tau` | `ToaTau`, `ChuyenTau` |
| `ToaTau` | `GheNgoi` |
| `GheNgoi` | `GheChuyen` |
| `GaTau` | `TuyenDuong` (×2: idGaDi, idGaDen) |
| `TuyenDuong` | `ChuyenTau` |
| `ChuyenTau` | `GheChuyen` |
| `GheChuyen` | `ChiTietVe` |
| `User` | `Ve`, `HanhKhach`, `DanhGia` (idAdminPhanHoi) |
| `Ve` | `ChiTietVe`, `ThanhToan`, `DanhGia` |
| `HanhKhach` | `ChiTietVe` |

---

## 3. Gợi ý mapping JPA/Hibernate

### 3.1. Tau.java
```java
@Entity
@Table(name = "Tau")
public class Tau {
    @Id
    @Column(name = "ID", length = 10)
    private String id;

    @Column(name = "tenTau")
    private String tenTau;

    @Column(name = "trangThai")
    private String trangThai;

    @OneToMany(mappedBy = "tau", fetch = FetchType.LAZY)
    private List<ToaTau> danhSachToa;

    @OneToMany(mappedBy = "tau", fetch = FetchType.LAZY)
    private List<ChuyenTau> danhSachChuyen;
}
```

### 3.2. ToaTau.java
```java
@Entity
@Table(name = "ToaTau",
       uniqueConstraints = @UniqueConstraint(columnNames = {"idTau", "soToa"}))
public class ToaTau {
    @Id
    @Column(name = "ID", length = 10)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idTau", nullable = false)
    private Tau tau;

    @Column(name = "soToa")
    private int soToa;

    @Column(name = "loaiToa")
    private String loaiToa;

    @Column(name = "slGhe")
    private int slGhe;

    @OneToMany(mappedBy = "toa", fetch = FetchType.LAZY)
    private List<GheNgoi> danhSachGhe;
}
```

### 3.3. GheNgoi.java
```java
@Entity
@Table(name = "GheNgoi",
       uniqueConstraints = @UniqueConstraint(columnNames = {"idToa", "viTriGhe"}))
public class GheNgoi {
    @Id
    @Column(name = "ID", length = 10)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idToa", nullable = false)
    private ToaTau toa;

    @Column(name = "viTriGhe")
    private String viTriGhe;

    @OneToMany(mappedBy = "ghe", fetch = FetchType.LAZY)
    private List<GheChuyen> danhSachGheChuyen;
}
```

### 3.4. GaTau.java
```java
@Entity
@Table(name = "GaTau")
public class GaTau {
    @Id
    @Column(name = "ID", length = 10)
    private String id;

    @Column(name = "tenGa")
    private String tenGa;

    @Column(name = "sdt")
    private String sdt;

    @Column(name = "diaChi")
    private String diaChi;
}
```

### 3.5. TuyenDuong.java
```java
@Entity
@Table(name = "TuyenDuong")
public class TuyenDuong {
    @Id
    @Column(name = "ID", length = 10)
    private String id;

    // Hai FK cùng tham chiếu GaTau → phải đặt tên cột khác nhau
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idGaDi", nullable = false)
    private GaTau gaDi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idGaDen", nullable = false)
    private GaTau gaDen;

    @Column(name = "tenTD")
    private String tenTD;

    @Column(name = "khoangCach")
    private BigDecimal khoangCach;

    @OneToMany(mappedBy = "tuyenDuong", fetch = FetchType.LAZY)
    private List<ChuyenTau> danhSachChuyen;
}
```

### 3.6. ChuyenTau.java
```java
@Entity
@Table(name = "ChuyenTau")
public class ChuyenTau {
    @Id
    @Column(name = "ID", length = 10)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idTuyenDuong", nullable = false)
    private TuyenDuong tuyenDuong;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idTau", nullable = false)
    private Tau tau;

    @Column(name = "ngayGioKhoiHanh")
    private LocalDateTime ngayGioKhoiHanh;

    @Column(name = "ngayGioDen")
    private LocalDateTime ngayGioDen;

    @Column(name = "trangThaiChuyen")
    private String trangThaiChuyen;

    @OneToMany(mappedBy = "chuyenTau", fetch = FetchType.LAZY)
    private List<GheChuyen> danhSachGheChuyen;
}
```

### 3.7. GheChuyen.java
```java
@Entity
@Table(name = "GheChuyen",
       uniqueConstraints = @UniqueConstraint(columnNames = {"idChuyenTau", "idGhe"}))
public class GheChuyen {
    @Id
    @Column(name = "ID", length = 10)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idChuyenTau", nullable = false)
    private ChuyenTau chuyenTau;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idGhe", nullable = false)
    private GheNgoi ghe;

    @Column(name = "gia")
    private BigDecimal gia;

    @Column(name = "trangThaiGheNgoi")
    private String trangThaiGheNgoi;
}
```

### 3.8. User.java
```java
// QUAN TRỌNG: dùng @Table(name = "`User`") vì USER là từ khóa MySQL
@Entity
@Table(name = "`User`")
public class User {
    @Id
    @Column(name = "ID", length = 10)
    private String id;

    @Column(name = "hoTen")
    private String hoTen;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "sdt", unique = true)
    private String sdt;

    @Column(name = "matKhau")
    private String matKhau;

    @Column(name = "CCCD", unique = true)
    private String cccd;

    @Column(name = "ngaySinh")
    private LocalDate ngaySinh;

    @Column(name = "gioiTinh")
    private Boolean gioiTinh;

    @Column(name = "vaiTro")
    private String vaiTro;

    @OneToMany(mappedBy = "nguoiDat", fetch = FetchType.LAZY)
    private List<Ve> danhSachVe;

    @OneToMany(mappedBy = "nguoiDatVe", fetch = FetchType.LAZY)
    private List<HanhKhach> danhSachHanhKhach;
}
```

### 3.9. Ve.java
```java
@Entity
@Table(name = "Ve")
public class Ve {
    @Id
    @Column(name = "ID", length = 10)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idNguoiDat", nullable = false)
    private User nguoiDat;

    @Column(name = "ngayDat")
    private LocalDateTime ngayDat;

    @Column(name = "tongTien")
    private BigDecimal tongTien;

    @Column(name = "trangThaiVe")
    private String trangThaiVe;

    @OneToMany(mappedBy = "ve", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<ChiTietVe> danhSachChiTiet;

    @OneToOne(mappedBy = "ve", fetch = FetchType.LAZY)
    private ThanhToan thanhToan;

    @OneToOne(mappedBy = "ve", fetch = FetchType.LAZY)
    private DanhGia danhGia;
}
```

### 3.10. HanhKhach.java
```java
@Entity
@Table(name = "HanhKhach")
public class HanhKhach {
    @Id
    @Column(name = "ID", length = 10)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idNguoiDatVe", nullable = false)
    private User nguoiDatVe;

    @Column(name = "hoTen")
    private String hoTen;

    @Column(name = "CCCD", unique = true)
    private String cccd;

    @Column(name = "ngaySinh")
    private LocalDate ngaySinh;

    @Column(name = "sdt")
    private String sdt;
}
```

### 3.11. ChiTietVe.java
```java
@Entity
@Table(name = "ChiTietVe")
public class ChiTietVe {
    @Id
    @Column(name = "ID", length = 10)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idVe", nullable = false)
    private Ve ve;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idHanhKhach", nullable = false)
    private HanhKhach hanhKhach;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idGheChuyen", nullable = false, unique = true)
    private GheChuyen gheChuyen;

    @Column(name = "donGia")
    private BigDecimal donGia;

    @Column(name = "thanhTien")
    private BigDecimal thanhTien;
}
```

### 3.12. ThanhToan.java
```java
@Entity
@Table(name = "ThanhToan")
public class ThanhToan {
    @Id
    @Column(name = "ID", length = 10)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idVe", nullable = false)
    private Ve ve;

    @Column(name = "phuongThuc")
    private String phuongThuc;

    @Column(name = "tongTien")
    private BigDecimal tongTien;

    @Column(name = "ngayThanhToan")
    private LocalDateTime ngayThanhToan;

    @Column(name = "trangThai")
    private String trangThai;
}
```

### 3.13. DanhGia.java
```java
@Entity
@Table(name = "DanhGia")
public class DanhGia {
    @Id
    @Column(name = "ID", length = 10)
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idVe", nullable = false, unique = true)
    private Ve ve;

    @Column(name = "soSao")
    private Integer soSao;

    @Lob
    @Column(name = "noiDung")
    private String noiDung;

    @Lob
    @Column(name = "phanHoi")
    private String phanHoi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idAdminPhanHoi")
    private User adminPhanHoi;

    @Column(name = "thoiGianDanhGia")
    private LocalDateTime thoiGianDanhGia;

    @Column(name = "thoiGianPhanHoi")
    private LocalDateTime thoiGianPhanHoi;
}
```

---

## 4. Câu truy vấn mẫu SQL & JPQL

### 4.1. Tìm chuyến theo ga đi, ga đến, ngày khởi hành

**SQL:**
```sql
SELECT ct.*
FROM ChuyenTau ct
JOIN TuyenDuong td ON ct.idTuyenDuong = td.ID
WHERE td.idGaDi  = 'GA01'
  AND td.idGaDen = 'GA03'
  AND DATE(ct.ngayGioKhoiHanh) = '2026-06-10'
  AND ct.trangThaiChuyen = 'MO_BAN'
ORDER BY ct.ngayGioKhoiHanh;
```

**JPQL:**
```java
// Trong ChuyenTauRepository / DAO
TypedQuery<ChuyenTau> q = em.createQuery(
    "SELECT ct FROM ChuyenTau ct " +
    "JOIN ct.tuyenDuong td " +
    "WHERE td.gaDi.id = :idGaDi " +
    "AND td.gaDen.id = :idGaDen " +
    "AND FUNCTION('DATE', ct.ngayGioKhoiHanh) = :ngay " +
    "AND ct.trangThaiChuyen = 'MO_BAN' " +
    "ORDER BY ct.ngayGioKhoiHanh", ChuyenTau.class);
q.setParameter("idGaDi",  "GA01");
q.setParameter("idGaDen", "GA03");
q.setParameter("ngay",    LocalDate.of(2026, 6, 10));
```

---

### 4.2. Lấy danh sách ghế (kèm trạng thái) theo chuyến

**SQL:**
```sql
SELECT
    gc.ID        AS idGheChuyen,
    gn.viTriGhe,
    tt.soToa,
    tt.loaiToa,
    gc.gia,
    gc.trangThaiGheNgoi
FROM GheChuyen gc
JOIN GheNgoi gn ON gc.idGhe = gn.ID
JOIN ToaTau  tt ON gn.idToa = tt.ID
WHERE gc.idChuyenTau = 'CT01'
ORDER BY tt.soToa, gn.viTriGhe;
```

**JPQL:**
```java
em.createQuery(
    "SELECT gc FROM GheChuyen gc " +
    "JOIN FETCH gc.ghe g " +
    "JOIN FETCH g.toa t " +
    "WHERE gc.chuyenTau.id = :idChuyen " +
    "ORDER BY t.soToa, g.viTriGhe", GheChuyen.class)
  .setParameter("idChuyen", "CT01")
  .getResultList();
```

---

### 4.3. Lấy danh sách vé theo user

**SQL:**
```sql
SELECT
    v.ID, v.ngayDat, v.tongTien, v.trangThaiVe,
    u.hoTen AS tenNguoiDat
FROM Ve v
JOIN `User` u ON v.idNguoiDat = u.ID
WHERE v.idNguoiDat = 'U02'
ORDER BY v.ngayDat DESC;
```

**JPQL:**
```java
em.createQuery(
    "SELECT v FROM Ve v " +
    "JOIN FETCH v.nguoiDat u " +
    "WHERE u.id = :idUser " +
    "ORDER BY v.ngayDat DESC", Ve.class)
  .setParameter("idUser", "U02")
  .getResultList();
```

---

### 4.4. Lấy chi tiết vé (hành khách + toa/ghế + chuyến)

**SQL:**
```sql
SELECT
    ctv.ID         AS idChiTiet,
    hk.hoTen       AS tenHanhKhach,
    hk.CCCD,
    gn.viTriGhe,
    tt.soToa,
    tt.loaiToa,
    ct.ngayGioKhoiHanh,
    ga_di.tenGa    AS gaDi,
    ga_den.tenGa   AS gaDen,
    ctv.donGia,
    ctv.thanhTien
FROM ChiTietVe ctv
JOIN HanhKhach hk   ON ctv.idHanhKhach = hk.ID
JOIN GheChuyen gc   ON ctv.idGheChuyen = gc.ID
JOIN GheNgoi   gn   ON gc.idGhe        = gn.ID
JOIN ToaTau    tt   ON gn.idToa        = tt.ID
JOIN ChuyenTau ct   ON gc.idChuyenTau  = ct.ID
JOIN TuyenDuong td  ON ct.idTuyenDuong = td.ID
JOIN GaTau ga_di    ON td.idGaDi       = ga_di.ID
JOIN GaTau ga_den   ON td.idGaDen      = ga_den.ID
WHERE ctv.idVe = 'VE01';
```

**JPQL:**
```java
em.createQuery(
    "SELECT ctv FROM ChiTietVe ctv " +
    "JOIN FETCH ctv.hanhKhach hk " +
    "JOIN FETCH ctv.gheChuyen gc " +
    "JOIN FETCH gc.ghe gn " +
    "JOIN FETCH gn.toa tt " +
    "JOIN FETCH gc.chuyenTau ct " +
    "WHERE ctv.ve.id = :idVe", ChiTietVe.class)
  .setParameter("idVe", "VE01")
  .getResultList();
```

---

### 4.5. Lấy đánh giá theo vé hoặc theo chuyến

**Theo vé:**
```sql
SELECT dg.*, u.hoTen AS tenAdmin
FROM DanhGia dg
LEFT JOIN `User` u ON dg.idAdminPhanHoi = u.ID
WHERE dg.idVe = 'VE03';
```

**Theo chuyến (tìm mọi đánh giá của chuyến CT04):**
```sql
SELECT
    dg.soSao,
    dg.noiDung,
    dg.phanHoi,
    dg.thoiGianDanhGia,
    u.hoTen     AS nguoiDanhGia,
    adm.hoTen   AS adminPhanHoi
FROM DanhGia dg
JOIN Ve v             ON dg.idVe          = v.ID
JOIN `User` u         ON v.idNguoiDat     = u.ID
LEFT JOIN `User` adm  ON dg.idAdminPhanHoi = adm.ID
-- Lấy idChuyenTau qua ChiTietVe → GheChuyen
WHERE EXISTS (
    SELECT 1 FROM ChiTietVe ctv
    JOIN GheChuyen gc ON ctv.idGheChuyen = gc.ID
    WHERE ctv.idVe = v.ID
      AND gc.idChuyenTau = 'CT04'
)
ORDER BY dg.thoiGianDanhGia DESC;
```

**JPQL (đánh giá theo vé):**
```java
em.createQuery(
    "SELECT dg FROM DanhGia dg " +
    "LEFT JOIN FETCH dg.adminPhanHoi " +
    "WHERE dg.ve.id = :idVe", DanhGia.class)
  .setParameter("idVe", "VE03")
  .getSingleResult();
```

---

## 5. Các điểm cần cẩn thận khi dùng Hibernate/JPA

### 5.1. `User` là từ khóa MySQL
- Trong entity: **bắt buộc** dùng `@Table(name = "`User`")` (có backtick).
- Hoặc đổi tên bảng thành `tbl_user` / `NguoiDung` trong SQL và `@Table(name = "tbl_user")` để tránh phức tạp.

### 5.2. Khóa chính VARCHAR và việc tự tạo ID
- Hibernate **không tự sinh** ID kiểu `VARCHAR`. Bạn phải tự tạo ID trong code trước khi `persist()`.
- Gợi ý: viết một `IdGenerator` util:
```java
public class IdGenerator {
    public static String generate(String prefix, int number) {
        return prefix + String.format("%02d", number); // T01, GA01
    }
    // Hoặc dùng UUID rút gọn cho an toàn hơn
}
```
- **Nếu muốn dùng `@GeneratedValue`**: đổi sang `INT AUTO_INCREMENT` và dùng `@GeneratedValue(strategy = GenerationType.IDENTITY)`. Xem ghi chú ở cuối.

### 5.3. N+1 Query Problem
- Tất cả quan hệ `@OneToMany` và `@ManyToOne` nên dùng `fetch = FetchType.LAZY` (đã làm ở trên).
- Khi cần load đủ dữ liệu, dùng `JOIN FETCH` trong JPQL thay vì để Hibernate tự lazy-load từng bản ghi.
- Ví dụ nguy hiểm (N+1):
```java
List<Ve> veList = em.createQuery("FROM Ve", Ve.class).getResultList();
for (Ve v : veList) {
    v.getDanhSachChiTiet().size(); // Mỗi lần gọi = 1 câu query mới → N+1!
}
```

### 5.4. Hai FK cùng trỏ vào một bảng (TuyenDuong → GaTau)
- Hai field `gaDi` và `gaDen` đều `@ManyToOne` tới `GaTau`.
- **Bắt buộc** đặt `@JoinColumn(name = "idGaDi")` và `@JoinColumn(name = "idGaDen")` khác nhau.
- Không dùng `mappedBy` ở `GaTau` cho trường hợp này vì một entity có 2 FK cùng kiểu.

### 5.5. @Lob với MySQL
- Dùng `@Lob` cho cột kiểu `TEXT` như `noiDung`, `phanHoi` trong `DanhGia`.
- Hibernate mặc định map `@Lob + String` thành `LONGTEXT` trên MySQL. Nếu muốn chính xác `TEXT`, thêm `@Column(columnDefinition = "TEXT")`.

### 5.6. Cập nhật trạng thái ghế khi đặt vé (Race Condition)
- Khi nhiều user cùng đặt một ghế, phải dùng **pessimistic locking** hoặc **optimistic locking**:
```java
// Pessimistic lock — khóa dòng khi đọc
GheChuyen gc = em.find(GheChuyen.class, id, LockModeType.PESSIMISTIC_WRITE);

// Hoặc dùng @Version trong entity cho optimistic lock
@Version
@Column(name = "version")
private int version;
```

### 5.7. Cascade và orphanRemoval
- Chỉ đặt `cascade = CascadeType.ALL` khi thực sự cần (VD: Ve → ChiTietVe).
- Tránh cascade trên quan hệ nhiều-nhiều hoặc bảng cha có nhiều con → có thể xóa dữ liệu ngoài ý muốn.

### 5.8. Enum thay vì String
- Xem xét dùng `@Enumerated(EnumType.STRING)` thay vì `String` thô cho các trạng thái:
```java
public enum TrangThaiVe {
    CHO_THANH_TOAN, DA_THANH_TOAN, DA_HUY, HOAN_THANH
}

@Enumerated(EnumType.STRING)
@Column(name = "trangThaiVe")
private TrangThaiVe trangThaiVe;
```

### 5.9. persistence.xml tối thiểu
```xml
<?xml version="1.0" encoding="UTF-8"?>
<persistence version="2.2"
    xmlns="http://xmlns.jcp.org/xml/ns/persistence">
    <persistence-unit name="TrainTickPU" transaction-type="RESOURCE_LOCAL">
        <provider>org.hibernate.jpa.HibernatePersistenceProvider</provider>
        <class>model.Tau</class>
        <class>model.ToaTau</class>
        <class>model.GheNgoi</class>
        <class>model.GaTau</class>
        <class>model.TuyenDuong</class>
        <class>model.ChuyenTau</class>
        <class>model.GheChuyen</class>
        <class>model.User</class>
        <class>model.Ve</class>
        <class>model.HanhKhach</class>
        <class>model.ChiTietVe</class>
        <class>model.ThanhToan</class>
        <class>model.DanhGia</class>
        <properties>
            <property name="javax.persistence.jdbc.driver"   value="com.mysql.cj.jdbc.Driver"/>
            <property name="javax.persistence.jdbc.url"      value="jdbc:mysql://localhost:3306/TrainTick?useSSL=false&amp;serverTimezone=Asia/Ho_Chi_Minh"/>
            <property name="javax.persistence.jdbc.user"     value="root"/>
            <property name="javax.persistence.jdbc.password" value="your_password"/>
            <property name="hibernate.dialect"               value="org.hibernate.dialect.MySQL8Dialect"/>
            <property name="hibernate.show_sql"              value="true"/>
            <property name="hibernate.format_sql"            value="true"/>
            <!-- VALIDATE: không tự sửa schema, chỉ kiểm tra -->
            <property name="hibernate.hbm2ddl.auto"          value="validate"/>
        </properties>
    </persistence-unit>
</persistence>
```

---

## 6. Ghi chú: VARCHAR(10) vs INT AUTO_INCREMENT

| Tiêu chí | VARCHAR(10) | INT AUTO_INCREMENT |
|---|---|---|
| Đặc tả dự án | ✅ Phù hợp (T01, GA01) | ❌ Không theo đặc tả |
| JPA @GeneratedValue | ❌ Phải tự sinh ID | ✅ Tự động |
| Hiệu năng JOIN | Chậm hơn một chút | Nhanh hơn |
| Debug dữ liệu | ✅ Dễ đọc | ❌ Chỉ là số |
| Khuyến nghị | Dùng cho project học tập | Dùng cho production |

**Kết luận**: Với mục tiêu học tập và đặc tả có sẵn, dùng `VARCHAR(10)` là hợp lý. Chỉ cần viết thêm một lớp `IdUtil` để sinh ID tự động (query max ID rồi tăng lên 1).
