package spring.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import spring.entity.MillBill;

public interface MillBilldata extends JpaRepository<MillBill,Integer>{

	@Query("SELECT m FROM MillBill m WHERE m.millname = :mill AND m.date BETWEEN :from AND :to")
	public List<MillBill> findByMillnameAndDateBetween(@Param("mill") String mill, @Param("from") String from,@Param("to") String to);
}
