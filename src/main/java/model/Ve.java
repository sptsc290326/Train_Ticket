package model;

import java.math.BigDecimal;
import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "Ve")
public class Ve {
	@Id
	private String id;
	@ManyToOne @JoinColumn(name = "idNguoiDat")
    private User nguoiDat;
    private Date ngayDat;
    private BigDecimal tongTien;
    private String trangThaiVe;
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public User getNguoiDat() {
		return nguoiDat;
	}
	public void setNguoiDat(User nguoiDat) {
		this.nguoiDat = nguoiDat;
	}
	public Date getNgayDat() {
		return ngayDat;
	}
	public void setNgayDat(Date ngayDat) {
		this.ngayDat = ngayDat;
	}
	public BigDecimal getTongTien() {
		return tongTien;
	}
	public void setTongTien(BigDecimal tongTien) {
		this.tongTien = tongTien;
	}
	public String getTrangThaiVe() {
		return trangThaiVe;
	}
	public void setTrangThaiVe(String trangThaiVe) {
		this.trangThaiVe = trangThaiVe;
	}
	
}
