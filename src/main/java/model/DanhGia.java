package model;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "DanhGia")
public class DanhGia {
    @Id
    @Column(name = "id", length = 10)
    private String id;

    @ManyToOne
    @JoinColumn(name = "idUser", nullable = false)
    private User user;

    @Column(name = "idChuyenTau", nullable = false, length = 10)
    private String idChuyenTau;

    @Column(name = "soSao", nullable = false)
    private int soSao;

    @Column(name = "noiDung", columnDefinition = "TEXT")
    private String noiDung;

    @Column(name = "phanHoi", columnDefinition = "TEXT")
    private String phanHoi;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "ngayDanhGia")
    private Date ngayDanhGia;

    public DanhGia() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getIdChuyenTau() { return idChuyenTau; }
    public void setIdChuyenTau(String idChuyenTau) { this.idChuyenTau = idChuyenTau; }
    public int getSoSao() { return soSao; }
    public void setSoSao(int soSao) { this.soSao = soSao; }
    public String getNoiDung() { return noiDung; }
    public void setNoiDung(String noiDung) { this.noiDung = noiDung; }
    public String getPhanHoi() { return phanHoi; }
    public void setPhanHoi(String phanHoi) { this.phanHoi = phanHoi; }
    public Date getNgayDanhGia() { return ngayDanhGia; }
    public void setNgayDanhGia(Date ngayDanhGia) { this.ngayDanhGia = ngayDanhGia; }
}