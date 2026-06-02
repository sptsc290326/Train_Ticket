package model;

import java.util.Date;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

@Entity
@Table(name = "HanhKhach")

public class HanhKhach {
	@Id
    private String id;

    @ManyToOne @JoinColumn(name = "idNguoiDatVe")
    private User nguoiDatVe;
    private String hoTen;
    private String CCCD;
    @Temporal(TemporalType.DATE)
    private Date ngaySinh;
    private String sdt;
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public User getNguoiDatVe() {
		return nguoiDatVe;
	}
	public void setNguoiDatVe(User nguoiDatVe) {
		this.nguoiDatVe = nguoiDatVe;
	}
	public String getHoTen() {
		return hoTen;
	}
	public void setHoTen(String hoTen) {
		this.hoTen = hoTen;
	}
	public String getCCCD() {
		return CCCD;
	}
	public void setCCCD(String cCCD) {
		CCCD = cCCD;
	}
	public Date getNgaySinh() {
		return ngaySinh;
	}
	public void setNgaySinh(Date ngaySinh) {
		this.ngaySinh = ngaySinh;
	}
	public String getSdt() {
		return sdt;
	}
	public void setSdt(String sdt) {
		this.sdt = sdt;
	}
	
}
