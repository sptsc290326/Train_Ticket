package model;

import javax.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "User")
public class User implements Serializable {
    private static final long serialVersionUID = 1L;
    
    @Id
    @Column(name = "id", length = 10)
    private String id;
    
    @Column(name = "hoTen", length = 120, nullable = false)
    private String hoTen;
    
    @Column(name = "email", length = 100, nullable = false, unique = true)
    private String email;
    
    @Column(name = "sdt", length = 15)
    private String sdt;
    
    @Column(name = "matKhau", length = 255, nullable = false)
    private String matKhau;
    
    @Column(name = "CCCD", length = 20)
    private String cccd;
    
    @Column(name = "ngaySinh")
    private LocalDate ngaySinh;
    
    @Column(name = "gioiTinh")
    private Boolean gioiTinh;
    
    @Column(name = "vaiTro", length = 30, nullable = false)
    private String vaiTro = "KHACH_HANG";
    

    @Column(name = "resetToken")
    private String resetToken;
    
    @Column(name = "tokenExpiry")
    private LocalDateTime tokenExpiry;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getHoTen() { return hoTen; }
    public void setHoTen(String hoTen) { this.hoTen = hoTen; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getSdt() { return sdt; }
    public void setSdt(String sdt) { this.sdt = sdt; }
    
    public String getMatKhau() { return matKhau; }
    public void setMatKhau(String matKhau) { this.matKhau = matKhau; }
    
    public String getCccd() { return cccd; }
    public void setCccd(String cccd) { this.cccd = cccd; }
    
    public LocalDate getNgaySinh() { return ngaySinh; }
    public void setNgaySinh(LocalDate ngaySinh) { this.ngaySinh = ngaySinh; }
    
    public Boolean getGioiTinh() { return gioiTinh; }
    public void setGioiTinh(Boolean gioiTinh) { this.gioiTinh = gioiTinh; }
    
    public String getVaiTro() { return vaiTro; }
    public void setVaiTro(String vaiTro) { this.vaiTro = vaiTro; }

    public String getResetToken() { return resetToken; }
    public void setResetToken(String resetToken) { this.resetToken = resetToken; }
    
    public LocalDateTime getTokenExpiry() { return tokenExpiry; }
    public void setTokenExpiry(LocalDateTime tokenExpiry) { this.tokenExpiry = tokenExpiry; }
   
}