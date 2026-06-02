package model;

import javax.persistence.*;
import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "ThanhToan")
public class ThanhToan {
    @Id
    @Column(name = "id", length = 10)
    private String id;

    @ManyToOne
    @JoinColumn(name = "idVe", nullable = false)
    private Ve ve;

    @Column(name = "phuongThuc", nullable = false, length = 50)
    private String phuongThuc;

    @Column(name = "tongTien", nullable = false, precision = 14, scale = 2)
    private BigDecimal tongTien;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "ngayThanhToan")
    private Date ngayThanhToan;

    @Column(name = "trangThai", nullable = false, length = 30)
    private String trangThai;

    public ThanhToan() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Ve getVe() { return ve; }
    public void setVe(Ve ve) { this.ve = ve; }
    public String getPhuongThuc() { return phuongThuc; }
    public void setPhuongThuc(String phuongThuc) { this.phuongThuc = phuongThuc; }
    public BigDecimal getTongTien() { return tongTien; }
    public void setTongTien(BigDecimal tongTien) { this.tongTien = tongTien; }
    public Date getNgayThanhToan() { return ngayThanhToan; }
    public void setNgayThanhToan(Date ngayThanhToan) { this.ngayThanhToan = ngayThanhToan; }
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
}