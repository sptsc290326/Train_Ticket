package model;

import javax.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "TuyenDuong")
public class TuyenDuong {
    @Id
    @Column(name = "id", length = 10)
    private String id;

    @ManyToOne
    @JoinColumn(name = "idGaDi", nullable = false)
    private GaTau gaDi;

    @ManyToOne
    @JoinColumn(name = "idGaDen", nullable = false)
    private GaTau gaDen;

    @Column(name = "tenTD", nullable = false, length = 100)
    private String tenTD;

    @Column(name = "khoangCach", nullable = false, precision = 10, scale = 2)
    private BigDecimal khoangCach = BigDecimal.ZERO;

    public TuyenDuong() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public GaTau getGaDi() { return gaDi; }
    public void setGaDi(GaTau gaDi) { this.gaDi = gaDi; }
    public GaTau getGaDen() { return gaDen; }
    public void setGaDen(GaTau gaDen) { this.gaDen = gaDen; }
    public String getTenTD() { return tenTD; }
    public void setTenTD(String tenTD) { this.tenTD = tenTD; }
    public BigDecimal getKhoangCach() { return khoangCach; }
    public void setKhoangCach(BigDecimal khoangCach) { this.khoangCach = khoangCach; }
}