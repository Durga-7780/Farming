package spring.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class TAccount {

    @Id
    private String account;
    private String access_token;
    private String phone;
  
}