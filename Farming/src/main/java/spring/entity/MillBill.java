package spring.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class MillBill {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int sno;
	private String date;
	private String farmername;
	private String vehicle;
	private String millname;
	private String variety;
	private String bags;
	private String weight;
	private String rate;
	private String amount;
	private String farmerplace;
	private String remarks;
}
