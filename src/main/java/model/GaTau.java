package model;

import javax.persistence.*;

@Entity
@Table(name = "GaTau")
public class GaTau {
    @Id
    @Column(name = "id", length = 10)
    private String id;

    @Column(name = "tenGa", nullable = false, length = 100)
    private String tenGa;

    @Column(name = "sdt", length = 15)
    private String sdt;

    @Column(name = "diaChi", length = 200)
    private String diaChi;

    public GaTau() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTenGa() { return tenGa; }
    public void setTenGa(String tenGa) { this.tenGa = tenGa; }
    public String getSdt() { return sdt; }
    public void setSdt(String sdt) { this.sdt = sdt; }
    public String getDiaChi() { return diaChi; }
    public void setDiaChi(String diaChi) { this.diaChi = diaChi; }
}