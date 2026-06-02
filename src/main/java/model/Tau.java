package model;

import javax.persistence.*;

@Entity
@Table(name = "Tau")
public class Tau {
    @Id
    @Column(name = "id", length = 10)
    private String id;

    @Column(name = "tenTau", nullable = false, length = 100)
    private String tenTau;

    @Column(name = "trangThai", nullable = false, length = 30)
    private String trangThai = "HOAT_DONG";

    public Tau() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTenTau() { return tenTau; }
    public void setTenTau(String tenTau) { this.tenTau = tenTau; }
    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
}