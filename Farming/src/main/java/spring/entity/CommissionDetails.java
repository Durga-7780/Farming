package spring.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class CommissionDetails {
	
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int sno;
	private String comname;
	private String mobile;
	private String location;
	
}
