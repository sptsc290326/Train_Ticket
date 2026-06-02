package model;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "ChuyenTau")
public class ChuyenTau {
    @Id
    @Column(name = "id", length = 10)
    private String id;

    @ManyToOne
    @JoinColumn(name = "idTuyenDuong", nullable = false)
    private TuyenDuong tuyenDuong;

    @ManyToOne
    @JoinColumn(name = "idTau", nullable = false)
    private Tau tau;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "ngayGioKhoiHanh", nullable = false)
    private Date ngayGioKhoiHanh;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "ngayGioDen", nullable = false)
    private Date ngayGioDen;

    @Column(name = "trangThaiChuyen", nullable = false, length = 30)
    private String trangThaiChuyen = "MO_BAN";

    public ChuyenTau() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public TuyenDuong getTuyenDuong() { return tuyenDuong; }
    public void setTuyenDuong(TuyenDuong tuyenDuong) { this.tuyenDuong = tuyenDuong; }
    public Tau getTau() { return tau; }
    public void setTau(Tau tau) { this.tau = tau; }
    public Date getNgayGioKhoiHanh() { return ngayGioKhoiHanh; }
    public void setNgayGioKhoiHanh(Date ngayGioKhoiHanh) { this.ngayGioKhoiHanh = ngayGioKhoiHanh; }
    public Date getNgayGioDen() { return ngayGioDen; }
    public void setNgayGioDen(Date ngayGioDen) { this.ngayGioDen = ngayGioDen; }
    public String getTrangThaiChuyen() { return trangThaiChuyen; }
    public void setTrangThaiChuyen(String trangThaiChuyen) { this.trangThaiChuyen = trangThaiChuyen; }
}