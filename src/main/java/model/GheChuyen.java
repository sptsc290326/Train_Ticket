package model;

import java.math.BigDecimal;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "GheChuyen")

public class GheChuyen {
    @Id
    private String id;
    private String idChuyenTau;
    private String idGhe;
    private BigDecimal gia;
    private String trangThaiGheNgoi;
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getIdChuyenTau() {
		return idChuyenTau;
	}
	public void setIdChuyenTau(String idChuyenTau) {
		this.idChuyenTau = idChuyenTau;
	}
	public String getIdGhe() {
		return idGhe;
	}
	public void setIdGhe(String idGhe) {
		this.idGhe = idGhe;
	}
	public BigDecimal getGia() {
		return gia;
	}
	public void setGia(BigDecimal gia) {
		this.gia = gia;
	}
	public String getTrangThaiGheNgoi() {
		return trangThaiGheNgoi;
	}
	public void setTrangThaiGheNgoi(String trangThaiGheNgoi) {
		this.trangThaiGheNgoi = trangThaiGheNgoi;
	}
    
}
