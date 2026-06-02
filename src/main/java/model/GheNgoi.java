package model;

import javax.persistence.*;

@Entity
@Table(name = "GheNgoi")
public class GheNgoi {
    @Id
    @Column(name = "id", length = 10)
    private String id;

    @ManyToOne
    @JoinColumn(name = "idToa", nullable = false)
    private ToaTau toaTau;

    @Column(name = "viTriGhe", nullable = false, length = 20)
    private String viTriGhe;

    public GheNgoi() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public ToaTau getToaTau() { return toaTau; }
    public void setToaTau(ToaTau toaTau) { this.toaTau = toaTau; }
    public String getViTriGhe() { return viTriGhe; }
    public void setViTriGhe(String viTriGhe) { this.viTriGhe = viTriGhe; }
}