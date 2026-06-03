package model;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

@Entity
@Table(name = "DanhGia")
public class DanhGia {
    @Id
    @Column(name = "id", length = 10)
    private String id;

    @ManyToOne
    @JoinColumn(name = "idVe", nullable = false)
    private Ve ve;

    @Column(name = "soSao")
    private Integer soSao;

    @Column(name = "noiDung", columnDefinition = "TEXT")
    private String noiDung;

    @Column(name = "phanHoi", columnDefinition = "TEXT")
    private String phanHoi;

    @ManyToOne
    @JoinColumn(name = "idAdminPhanHoi")
    private User adminPhanHoi;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "thoiGianDanhGia")
    private Date thoiGianDanhGia;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "thoiGianPhanHoi")
    private Date thoiGianPhanHoi;

    public DanhGia() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Ve getVe() {
        return ve;
    }

    public void setVe(Ve ve) {
        this.ve = ve;
    }

    public Integer getSoSao() {
        return soSao;
    }

    public void setSoSao(Integer soSao) {
        this.soSao = soSao;
    }

    public String getNoiDung() {
        return noiDung;
    }

    public void setNoiDung(String noiDung) {
        this.noiDung = noiDung;
    }

    public String getPhanHoi() {
        return phanHoi;
    }

    public void setPhanHoi(String phanHoi) {
        this.phanHoi = phanHoi;
    }

    public User getAdminPhanHoi() {
        return adminPhanHoi;
    }

    public void setAdminPhanHoi(User adminPhanHoi) {
        this.adminPhanHoi = adminPhanHoi;
    }

    public Date getThoiGianDanhGia() {
        return thoiGianDanhGia;
    }

    public void setThoiGianDanhGia(Date thoiGianDanhGia) {
        this.thoiGianDanhGia = thoiGianDanhGia;
    }

    public Date getThoiGianPhanHoi() {
        return thoiGianPhanHoi;
    }

    public void setThoiGianPhanHoi(Date thoiGianPhanHoi) {
        this.thoiGianPhanHoi = thoiGianPhanHoi;
    }
}
