package model;

import javax.persistence.*;

@Entity
@Table(name = "ToaTau")
public class ToaTau {
    @Id
    @Column(name = "id", length = 10)
    private String id;

    @ManyToOne
    @JoinColumn(name = "idTau", nullable = false)
    private Tau tau;

    @Column(name = "soToa", nullable = false)
    private int soToa;

    @Column(name = "loaiToa", nullable = false, length = 50)
    private String loaiToa;

    @Column(name = "slGhe", nullable = false)
    private int slGhe = 0;

    public ToaTau() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Tau getTau() { return tau; }
    public void setTau(Tau tau) { this.tau = tau; }
    public int getSoToa() { return soToa; }
    public void setSoToa(int soToa) { this.soToa = soToa; }
    public String getLoaiToa() { return loaiToa; }
    public void setLoaiToa(String loaiToa) { this.loaiToa = loaiToa; }
    public int getSlGhe() { return slGhe; }
    public void setSlGhe(int slGhe) { this.slGhe = slGhe; }
}