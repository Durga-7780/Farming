package spring.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Farmerdetails {
	
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long sno;
	private String fname;
	private String fmobile;
	private String flocation;
	private String fvariety;
	private String fbags;
	private int setteled=0;
	private String date;
	private String weight;
	private String loaddate;
}
