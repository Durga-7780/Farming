package spring.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import spring.entity.Milldetails;

public interface MilldataInt extends JpaRepository<Milldetails,Integer> {
	
}
