package spring.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Registration {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long sno;
	private String name;
	private String mobile;
	private String username;
	private String password;
	private String gender;
	private int accepted=0;
	private String date;
	private int flag=0;
}
