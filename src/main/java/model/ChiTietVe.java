package model;

import java.math.BigDecimal;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@Entity
@Table(name = "ChiTietVe")
public class ChiTietVe {
	@Id
    private String id;
	@ManyToOne @JoinColumn(name = "idVe")
    private Ve ve;
    @ManyToOne @JoinColumn(name = "idHanhKhach")
    private HanhKhach hanhKhach;
    @ManyToOne @JoinColumn(name = "idGheChuyen")
    private GheChuyen gheChuyen;
    private BigDecimal donGia;
    private BigDecimal thanhTien;
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
	public HanhKhach getHanhKhach() {
		return hanhKhach;
	}
	public void setHanhKhach(HanhKhach hanhKhach) {
		this.hanhKhach = hanhKhach;
	}
	public GheChuyen getGheChuyen() {
		return gheChuyen;
	}
	public void setGheChuyen(GheChuyen gheChuyen) {
		this.gheChuyen = gheChuyen;
	}
	public BigDecimal getDonGia() {
		return donGia;
	}
	public void setDonGia(BigDecimal donGia) {
		this.donGia = donGia;
	}
	public BigDecimal getThanhTien() {
		return thanhTien;
	}
	public void setThanhTien(BigDecimal thanhTien) {
		this.thanhTien = thanhTien;
	}
	
}
