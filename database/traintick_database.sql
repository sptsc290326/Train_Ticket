-- ============================================================
--  TrainTick - Hệ thống đặt vé tàu trực tuyến
--  Database: MySQL 8.x
--  Phiên bản: 1.0
--  Ghi chú: Khóa chính dùng VARCHAR(10) theo đặc tả dự án
-- ============================================================

DROP DATABASE IF EXISTS TrainTick;
CREATE DATABASE TrainTick
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE TrainTick;

-- ============================================================
-- DROP TABLE theo thứ tự ngược (bảng con trước, bảng cha sau)
-- ============================================================
DROP TABLE IF EXISTS DanhGia;
DROP TABLE IF EXISTS ThanhToan;
DROP TABLE IF EXISTS ChiTietVe;
DROP TABLE IF EXISTS Ve;
DROP TABLE IF EXISTS HanhKhach;
DROP TABLE IF EXISTS GheChuyen;
DROP TABLE IF EXISTS ChuyenTau;
DROP TABLE IF EXISTS TuyenDuong;
DROP TABLE IF EXISTS GaTau;
DROP TABLE IF EXISTS GheNgoi;
DROP TABLE IF EXISTS ToaTau;
DROP TABLE IF EXISTS Tau;
DROP TABLE IF EXISTS User;

-- ============================================================
-- 1. Tau - Thông tin tàu hỏa
-- ============================================================
CREATE TABLE Tau (
    id          VARCHAR(10)  NOT NULL,
    tenTau      VARCHAR(100) NOT NULL,
    trangThai   VARCHAR(30)  NOT NULL DEFAULT 'HOAT_DONG',

    CONSTRAINT pk_tau PRIMARY KEY (id),
    CONSTRAINT ck_tau_trangthai CHECK (trangThai IN ('HOAT_DONG', 'BAO_TRI', 'NGUNG_HOAT_DONG'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. ToaTau - Toa tàu (thuộc một Tau)
-- ============================================================
CREATE TABLE ToaTau (
    id          VARCHAR(10)  NOT NULL,
    idTau       VARCHAR(10)  NOT NULL,
    soToa       INT          NOT NULL,
    loaiToa     VARCHAR(50)  NOT NULL,   -- VD: NGOI_CUNG, NAM_CUNG, NAM_MEM, VIP
    slGhe       INT          NOT NULL DEFAULT 0,

    CONSTRAINT pk_toatau PRIMARY KEY (id),
    CONSTRAINT fk_toatau_tau FOREIGN KEY (idTau) REFERENCES Tau(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_toatau_tau_so UNIQUE (idTau, soToa)    -- Mỗi tàu không có 2 toa cùng số
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_toatau_idtau ON ToaTau(idTau);

-- ============================================================
-- 3. GheNgoi - Ghế vật lý thuộc toa (không thay đổi theo chuyến)
-- ============================================================
CREATE TABLE GheNgoi (
    id          VARCHAR(10)  NOT NULL,
    idToa       VARCHAR(10)  NOT NULL,
    viTriGhe    VARCHAR(20)  NOT NULL,  -- VD: A1, B3, 01, 12

    CONSTRAINT pk_ghengoi PRIMARY KEY (id),
    CONSTRAINT fk_ghengoi_toa FOREIGN KEY (idToa) REFERENCES ToaTau(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_ghengoi_toa_vitri UNIQUE (idToa, viTriGhe)  -- Mỗi toa không có 2 ghế cùng vị trí
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_ghengoi_idtoa ON GheNgoi(idToa);

-- ============================================================
-- 4. GaTau - Nhà ga
-- ============================================================
CREATE TABLE GaTau (
    id          VARCHAR(10)  NOT NULL,
    tenGa       VARCHAR(100) NOT NULL,
    sdt         VARCHAR(15)  NULL,
    diaChi      VARCHAR(200) NULL,

    CONSTRAINT pk_gatau PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. TuyenDuong - Tuyến đường nối 2 ga
-- ============================================================
CREATE TABLE TuyenDuong (
    id          VARCHAR(10)   NOT NULL,
    idGaDi      VARCHAR(10)   NOT NULL,
    idGaDen     VARCHAR(10)   NOT NULL,
    tenTD       VARCHAR(100)  NOT NULL,
    khoangCach  DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT pk_tuyenduong PRIMARY KEY (id),
    CONSTRAINT fk_tuyenduong_gadi  FOREIGN KEY (idGaDi)  REFERENCES GaTau(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_tuyenduong_gaden FOREIGN KEY (idGaDen) REFERENCES GaTau(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_tuyenduong_gadi  ON TuyenDuong(idGaDi);
CREATE INDEX idx_tuyenduong_gaden ON TuyenDuong(idGaDen);

-- ============================================================
-- 6. ChuyenTau - Một chuyến tàu cụ thể (ngày giờ + tàu + tuyến)
-- ============================================================
CREATE TABLE ChuyenTau (
    id                  VARCHAR(10)  NOT NULL,
    idTuyenDuong        VARCHAR(10)  NOT NULL,
    idTau               VARCHAR(10)  NOT NULL,
    ngayGioKhoiHanh     DATETIME     NOT NULL,
    ngayGioDen          DATETIME     NOT NULL,
    trangThaiChuyen     VARCHAR(30)  NOT NULL DEFAULT 'MO_BAN',

    CONSTRAINT pk_chuyentau PRIMARY KEY (id),
    CONSTRAINT fk_chuyentau_tuyen FOREIGN KEY (idTuyenDuong) REFERENCES TuyenDuong(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_chuyentau_tau   FOREIGN KEY (idTau)        REFERENCES Tau(id)        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT ck_chuyentau_tg    CHECK (ngayGioDen > ngayGioKhoiHanh),
    CONSTRAINT ck_chuyentau_tt    CHECK (trangThaiChuyen IN ('MO_BAN', 'DA_CHAY', 'HUY', 'HOAN_THANH'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_chuyentau_ngay ON ChuyenTau(ngayGioKhoiHanh);
CREATE INDEX idx_chuyentau_tuyen ON ChuyenTau(idTuyenDuong);
CREATE INDEX idx_chuyentau_tau   ON ChuyenTau(idTau);

-- ============================================================
-- 7. GheChuyen - Trạng thái ghế THEO TỪNG CHUYẾN (bảng trung gian quan trọng)
-- ============================================================
CREATE TABLE GheChuyen (
    id                  VARCHAR(10)   NOT NULL,
    idChuyenTau         VARCHAR(10)   NOT NULL,
    idGhe               VARCHAR(10)   NOT NULL,
    gia                 DECIMAL(12,2) NOT NULL DEFAULT 0,
    trangThaiGheNgoi    VARCHAR(30)   NOT NULL DEFAULT 'TRONG',

    CONSTRAINT pk_ghechuyen PRIMARY KEY (id),
    CONSTRAINT fk_ghechuyen_chuyen FOREIGN KEY (idChuyenTau) REFERENCES ChuyenTau(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_ghechuyen_ghe    FOREIGN KEY (idGhe)       REFERENCES GheNgoi(id)   ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_ghechuyen_chuyen_ghe UNIQUE (idChuyenTau, idGhe),  -- !! CHỐNG ĐẶT TRÙNG GHẾ !!
    CONSTRAINT ck_ghechuyen_tt     CHECK (trangThaiGheNgoi IN ('TRONG', 'DANG_GIU', 'DA_BAN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_ghechuyen_chuyen ON GheChuyen(idChuyenTau);
CREATE INDEX idx_ghechuyen_ghe    ON GheChuyen(idGhe);
CREATE INDEX idx_ghechuyen_tt     ON GheChuyen(trangThaiGheNgoi);

-- ============================================================
-- 8. User - Tài khoản người dùng và admin
--    (Dùng backtick vì USER là từ khóa trong MySQL)
-- ============================================================
CREATE TABLE User (
    id          VARCHAR(10)  NOT NULL,
    hoTen       VARCHAR(120) NOT NULL,
    email       VARCHAR(100) NOT NULL,
    sdt         VARCHAR(15)  NULL,
    matKhau     VARCHAR(255) NOT NULL,  -- Nên hash bcrypt, tối thiểu 60 ký tự
    CCCD        VARCHAR(20)  NULL,
    ngaySinh    DATE         NULL,
    gioiTinh    BOOLEAN      NULL,      -- TRUE = Nam, FALSE = Nữ, NULL = Không xác định
    vaiTro      VARCHAR(30)  NOT NULL DEFAULT 'KHACH_HANG',
    resetToken  VARCHAR(255) NULL,
    tokenExpiry DATETIME NULL,

    CONSTRAINT pk_user PRIMARY KEY (id),
    CONSTRAINT uq_user_email UNIQUE (email),
    CONSTRAINT uq_user_sdt   UNIQUE (sdt),
    CONSTRAINT uq_user_cccd  UNIQUE (CCCD),
    CONSTRAINT ck_user_vaitro CHECK (vaiTro IN ('KHACH_HANG', 'ADMIN'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_user_email ON User(email);

-- ============================================================
-- 9. Ve - Đơn đặt vé (một user có thể có nhiều vé)
-- ============================================================
CREATE TABLE Ve (
    id              VARCHAR(10)   NOT NULL,
    idNguoiDat      VARCHAR(10)   NOT NULL,
    ngayDat         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tongTien        DECIMAL(14,2) NOT NULL DEFAULT 0,
    trangThaiVe     VARCHAR(30)   NOT NULL DEFAULT 'CHO_THANH_TOAN',

    CONSTRAINT pk_ve PRIMARY KEY (id),
    CONSTRAINT fk_ve_user FOREIGN KEY (idNguoiDat) REFERENCES User(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT ck_ve_tt   CHECK (trangThaiVe IN ('CHO_THANH_TOAN', 'DA_THANH_TOAN', 'DA_HUY', 'HOAN_THANH'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_ve_user ON Ve(idNguoiDat);
CREATE INDEX idx_ve_tt   ON Ve(trangThaiVe);

-- ============================================================
-- 10. HanhKhach - Thông tin hành khách (người đi tàu thực sự)
--     Người đặt vé có thể đặt cho người khác
-- ============================================================
CREATE TABLE HanhKhach (
    id              VARCHAR(10)  NOT NULL,
    idNguoiDatVe    VARCHAR(10)  NOT NULL,
    hoTen           VARCHAR(120) NOT NULL,
    CCCD            VARCHAR(20)  NULL,
    ngaySinh        DATE         NULL,
    sdt             VARCHAR(15)  NULL,

    CONSTRAINT pk_hanhkhach PRIMARY KEY (id),
    CONSTRAINT fk_hanhkhach_user FOREIGN KEY (idNguoiDatVe) REFERENCES User(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_hanhkhach_cccd UNIQUE (CCCD)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_hanhkhach_user ON HanhKhach(idNguoiDatVe);

-- ============================================================
-- 11. ChiTietVe - Mỗi dòng = 1 hành khách + 1 ghế chuyến trong vé
-- ============================================================
CREATE TABLE ChiTietVe (
    id              VARCHAR(10)   NOT NULL,
    idVe            VARCHAR(10)   NOT NULL,
    idHanhKhach     VARCHAR(10)   NOT NULL,
    idGheChuyen     VARCHAR(10)   NOT NULL,
    donGia          DECIMAL(14,2) NOT NULL DEFAULT 0,
    thanhTien       DECIMAL(14,2) NOT NULL DEFAULT 0,

    CONSTRAINT pk_chitietVe PRIMARY KEY (id),
    CONSTRAINT fk_ctv_ve          FOREIGN KEY (idVe)        REFERENCES Ve(id)        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_ctv_hanhkhach   FOREIGN KEY (idHanhKhach) REFERENCES HanhKhach(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_ctv_ghechuyen   FOREIGN KEY (idGheChuyen) REFERENCES GheChuyen(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    -- Một ghế chuyến chỉ được bán cho đúng 1 chi tiết vé (chống bán trùng)
    CONSTRAINT uq_ctv_ghechuyen   UNIQUE (idGheChuyen)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_ctv_ve         ON ChiTietVe(idVe);
CREATE INDEX idx_ctv_hanhkhach  ON ChiTietVe(idHanhKhach);

-- ============================================================
-- 12. ThanhToan - Ghi lại giao dịch thanh toán của vé
-- ============================================================
CREATE TABLE ThanhToan (
    id              VARCHAR(10)   NOT NULL,
    idVe            VARCHAR(10)   NOT NULL,
    phuongThuc      VARCHAR(50)   NOT NULL,
    tongTien        DECIMAL(14,2) NOT NULL DEFAULT 0,
    ngayThanhToan   DATETIME      NULL,
    trangThai       VARCHAR(30)   NOT NULL DEFAULT 'CHO_XU_LY',

    CONSTRAINT pk_thanhtoan PRIMARY KEY (id),
    CONSTRAINT fk_tt_ve     FOREIGN KEY (idVe) REFERENCES Ve(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT ck_tt_pt     CHECK (phuongThuc IN ('QR_DEMO', 'MOMO', 'VNPAY', 'TIEN_MAT')),
    CONSTRAINT ck_tt_trangthai CHECK (trangThai IN ('THANH_CONG', 'THAT_BAI', 'CHO_XU_LY'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_thanhtoan_ve ON ThanhToan(idVe);

-- ============================================================
-- 13. DanhGia - Đánh giá chuyến đi, liên kết với vé
-- ============================================================
CREATE TABLE DanhGia (
    id                  VARCHAR(10) NOT NULL,
    idVe                VARCHAR(10) NOT NULL,
    soSao               INT         NULL,
    noiDung             TEXT        NULL,
    phanHoi             TEXT        NULL,
    idAdminPhanHoi      VARCHAR(10) NULL,
    thoiGianDanhGia     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    thoiGianPhanHoi     DATETIME    NULL,

    CONSTRAINT pk_danhgia PRIMARY KEY (id),
    CONSTRAINT fk_dg_ve     FOREIGN KEY (idVe)           REFERENCES Ve(id)      ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_dg_admin  FOREIGN KEY (idAdminPhanHoi) REFERENCES User(id)  ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT ck_dg_sosao  CHECK (soSao IS NULL OR (soSao BETWEEN 1 AND 5)),
    -- Mỗi vé chỉ có 1 đánh giá
    CONSTRAINT uq_dg_ve     UNIQUE (idVe)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_danhgia_ve ON DanhGia(idVe);


-- ============================================================
-- ============================================================
--  DỮ LIỆU MẪU (INSERT INTO)
-- ============================================================
-- ============================================================

-- ----------------------------------------------------------
-- User: 1 admin + 2 khách hàng
-- Mật khẩu mẫu: "password123" (đã hash BCrypt)
-- ----------------------------------------------------------
INSERT INTO User (id, hoTen, email, sdt, matKhau, CCCD, ngaySinh, gioiTinh, vaiTro) VALUES
('U01', 'Nguyen Van Admin',  'admin@traintick.vn',    '0901000001', '$2a$10$PqZgRCXzgXaCQFydKthg9OhNs4zS85l0Xv6gGkV71gYQb4lWYhbre', '001099000001', '1985-03-15', TRUE,  'ADMIN'),
('U02', 'Tran Thi Lan',      'lan.tran@gmail.com',    '0912345678', '$2a$10$PqZgRCXzgXaCQFydKthg9OhNs4zS85l0Xv6gGkV71gYQb4lWYhbre', '034099012345', '1995-07-20', FALSE, 'KHACH_HANG'),
('U03', 'Le Minh Tuan',      'tuan.le@gmail.com',     '0987654321', '$2a$10$PqZgRCXzgXaCQFydKthg9OhNs4zS85l0Xv6gGkV71gYQb4lWYhbre', '025099054321', '1990-11-05', TRUE,  'KHACH_HANG');

-- ----------------------------------------------------------
-- Tàu
-- ----------------------------------------------------------
INSERT INTO Tau (id, tenTau, trangThai) VALUES
('T01', 'SE1 - Thống Nhất Bắc Nam', 'HOAT_DONG'),
('T02', 'SE3 - Tàu nhanh Hà Nội - Đà Nẵng', 'HOAT_DONG'),
('T03', 'SE5 - Tàu dự phòng', 'BAO_TRI');

-- ----------------------------------------------------------
-- Toa tàu (T01 có 3 toa, T02 có 2 toa)
-- ----------------------------------------------------------
INSERT INTO ToaTau (id, idTau, soToa, loaiToa, slGhe) VALUES
('TT01', 'T01', 1, 'NGOI_CUNG',  28),
('TT02', 'T01', 2, 'NAM_CUNG',   36),
('TT03', 'T01', 3, 'VIP',        12),
('TT04', 'T02', 1, 'NGOI_CUNG',  28),
('TT05', 'T02', 2, 'NAM_MEM',    24);

-- ----------------------------------------------------------
-- Ghế ngồi cho Toa TT01 (8 ghế mẫu, thực tế có 28)
-- ----------------------------------------------------------
INSERT INTO GheNgoi (id, idToa, viTriGhe) VALUES
('G001', 'TT01', 'A1'), ('G002', 'TT01', 'A2'), ('G003', 'TT01', 'A3'), ('G004', 'TT01', 'A4'),
('G005', 'TT01', 'B1'), ('G006', 'TT01', 'B2'), ('G007', 'TT01', 'B3'), ('G008', 'TT01', 'B4'),
-- Ghế cho toa TT02
('G009', 'TT02', '01'), ('G010', 'TT02', '02'), ('G011', 'TT02', '03'), ('G012', 'TT02', '04');

-- ----------------------------------------------------------
-- Ga tàu
-- ----------------------------------------------------------
INSERT INTO GaTau (id, tenGa, sdt, diaChi) VALUES
('GA01', 'Ga Hà Nội',     '024 3942 5000', '120 Lê Duẩn, Đống Đa, Hà Nội'),
('GA02', 'Ga Đà Nẵng',    '0236 3823 810', 'Hải Phòng, Hải Châu, Đà Nẵng'),
('GA03', 'Ga Sài Gòn',    '028 3931 4131', '1 Nguyễn Thông, Quận 3, TP.HCM'),
('GA04', 'Ga Huế',        '0234 3822 175', '2 Bùi Thị Xuân, TP Huế');

-- ----------------------------------------------------------
-- Tuyến đường
-- ----------------------------------------------------------
INSERT INTO TuyenDuong (id, idGaDi, idGaDen, tenTD, khoangCach) VALUES
('TD01', 'GA01', 'GA03', 'Hà Nội - Sài Gòn',    1726.00),
('TD02', 'GA01', 'GA02', 'Hà Nội - Đà Nẵng',     791.00),
('TD03', 'GA02', 'GA03', 'Đà Nẵng - Sài Gòn',    976.00),
('TD04', 'GA01', 'GA04', 'Hà Nội - Huế',          688.00);

-- ----------------------------------------------------------
-- Chuyến tàu
-- ----------------------------------------------------------
INSERT INTO ChuyenTau (id, idTuyenDuong, idTau, ngayGioKhoiHanh, ngayGioDen, trangThaiChuyen) VALUES
('CT01', 'TD01', 'T01', '2026-06-10 06:00:00', '2026-06-11 14:30:00', 'MO_BAN'),
('CT02', 'TD02', 'T02', '2026-06-10 08:00:00', '2026-06-10 20:00:00', 'MO_BAN'),
('CT03', 'TD01', 'T01', '2026-06-15 06:00:00', '2026-06-16 14:30:00', 'MO_BAN'),
('CT04', 'TD03', 'T02', '2026-05-01 07:00:00', '2026-05-01 20:00:00', 'HOAN_THANH');

-- ----------------------------------------------------------
-- GheChuyen: ghế theo chuyến CT01 (dùng toa TT01 của T01)
-- Một số TRONG, một số DANG_GIU, một DA_BAN
-- ----------------------------------------------------------
INSERT INTO GheChuyen (id, idChuyenTau, idGhe, gia, trangThaiGheNgoi) VALUES
('GC001', 'CT01', 'G001', 250000.00, 'TRONG'),
('GC002', 'CT01', 'G002', 250000.00, 'TRONG'),
('GC003', 'CT01', 'G003', 250000.00, 'TRONG'),
('GC004', 'CT01', 'G004', 250000.00, 'TRONG'),
('GC005', 'CT01', 'G005', 250000.00, 'DA_BAN'),
('GC006', 'CT01', 'G006', 250000.00, 'DANG_GIU'),
('GC007', 'CT01', 'G007', 250000.00, 'DA_BAN'),
('GC008', 'CT01', 'G008', 250000.00, 'TRONG'),
-- GheChuyen cho chuyến CT02
('GC009', 'CT02', 'G009', 180000.00, 'TRONG'),
('GC010', 'CT02', 'G010', 180000.00, 'TRONG'),
('GC011', 'CT02', 'G011', 180000.00, 'TRONG'),
('GC012', 'CT02', 'G012', 180000.00, 'TRONG'),
-- GheChuyen cho chuyến đã hoàn thành CT04 (để test đánh giá)
('GC013', 'CT04', 'G009', 175000.00, 'DA_BAN'),
('GC014', 'CT04', 'G010', 175000.00, 'DA_BAN');

-- ----------------------------------------------------------
-- HanhKhach (U02 đặt vé cho mình và cho người thân)
-- ----------------------------------------------------------
INSERT INTO HanhKhach (id, idNguoiDatVe, hoTen, CCCD, ngaySinh, sdt) VALUES
('HK01', 'U02', 'Tran Thi Lan',    '034099012345', '1995-07-20', '0912345678'),
('HK02', 'U02', 'Tran Van Phuc',   '034099099999', '1970-04-10', '0911111111'),
('HK03', 'U03', 'Le Minh Tuan',    '025099054321', '1990-11-05', '0987654321');

-- ----------------------------------------------------------
-- Vé
-- ----------------------------------------------------------
INSERT INTO Ve (id, idNguoiDat, ngayDat, tongTien, trangThaiVe) VALUES
('VE01', 'U02', '2026-06-01 09:15:00', 500000.00, 'DA_THANH_TOAN'),  -- 2 ghế
('VE02', 'U03', '2026-06-02 14:00:00', 250000.00, 'CHO_THANH_TOAN'), -- 1 ghế
('VE03', 'U02', '2026-05-01 07:30:00', 350000.00, 'HOAN_THANH');      -- chuyến đã chạy

-- ----------------------------------------------------------
-- ChiTietVe
-- ----------------------------------------------------------
INSERT INTO ChiTietVe (id, idVe, idHanhKhach, idGheChuyen, donGia, thanhTien) VALUES
('CTV01', 'VE01', 'HK01', 'GC007', 250000.00, 250000.00),  -- Lan đặt ghế G007 chuyến CT01 (DA_BAN)
('CTV02', 'VE01', 'HK02', 'GC005', 250000.00, 250000.00),  -- Phuc đặt ghế G005 chuyến CT01 (DA_BAN)
('CTV03', 'VE02', 'HK03', 'GC006', 250000.00, 250000.00),  -- Tuan đặt ghế G006 chuyến CT01 (DANG_GIU)
('CTV04', 'VE03', 'HK01', 'GC013', 175000.00, 175000.00),  -- Lan trên chuyến CT04 đã hoàn thành
('CTV05', 'VE03', 'HK02', 'GC014', 175000.00, 175000.00);  -- Phuc trên chuyến CT04 đã hoàn thành

-- ----------------------------------------------------------
-- ThanhToan
-- ----------------------------------------------------------
INSERT INTO ThanhToan (id, idVe, phuongThuc, tongTien, ngayThanhToan, trangThai) VALUES
('TT01', 'VE01', 'VNPAY',    500000.00, '2026-06-01 09:20:00', 'THANH_CONG'),
('TT02', 'VE02', 'QR_DEMO',  250000.00, NULL,                  'CHO_XU_LY'),
('TT03', 'VE03', 'MOMO',     350000.00, '2026-05-01 07:35:00', 'THANH_CONG');

-- ----------------------------------------------------------
-- DanhGia (chỉ đánh giá được vé đã HOAN_THANH)
-- ----------------------------------------------------------
INSERT INTO DanhGia (id, idVe, soSao, noiDung, phanHoi, idAdminPhanHoi, thoiGianDanhGia, thoiGianPhanHoi) VALUES
('DG01', 'VE03', 4, 'Chuyến đi ổn, tàu sạch sẽ, đúng giờ. Nhân viên phục vụ thân thiện.',
         'Cảm ơn bạn đã tin dùng TrainTick! Hẹn gặp lại trong chuyến đi tiếp theo.',
         'U01', '2026-05-02 08:00:00', '2026-05-02 10:30:00');
