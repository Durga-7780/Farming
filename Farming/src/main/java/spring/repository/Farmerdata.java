package spring.repository;

import java.util.LinkedHashMap;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import spring.entity.Farmerdetails;

public interface Farmerdata extends JpaRepository<Farmerdetails,Long>{
	
	@Query(value="Select * from farmerdetails where setteled=0",nativeQuery=true)
	public List<Farmerdetails> getFarmerdetails();
	@Query(value="Select * from farmerdetails where setteled=1 and fmobile=:mob",nativeQuery=true)
	public List<Farmerdetails> findByFmobile(@Param("mob")String mob);
	@Query(value="Select * from farmerdetails where setteled=0 and fmobile=:mob",nativeQuery=true)
	public List<Farmerdetails> findByFmobile1(@Param("mob")String mob);
	@Query(value="select COALESCE(fvariety,0) from farmerdetails where setteled=0 group by fvariety",nativeQuery=true)
	public List<String> items();
	@Query(value="select COALESCE(sum(fbags),0) from farmerdetails where setteled=0 group by fvariety",nativeQuery=true)
	public List<String> totalbags();
	
	@Query(value="SELECT COALESCE(sum(fbags),0) FROM farmerdetails WHERE loaddate = CURDATE() && setteled=1 group by fvariety",nativeQuery=true)
	public List<String> totalloadingbags();
	@Query(value="SELECT COALESCE(fvariety,0) FROM farmerdetails WHERE loaddate = CURDATE() && setteled=1 group by fvariety",nativeQuery=true)
	public List<String> todaytotalitems();
	
	@Query(value="Select * from farmerdetails where fmobile=:mob and setteled=0",nativeQuery=true)
	public List<Farmerdetails> findByFmobileEditform(@Param("mob")String mob);
	
	@Query(value="Select * from farmerdetails where fmobile=:mob",nativeQuery=true)
	public List<Farmerdetails> findByFmobileEditform1(@Param("mob")String mob);
	
	@Query(value="SELECT COALESCE(fvariety,0),COALESCE(sum(fbags),0) FROM farmerdetails WHERE  setteled=0 group by fvariety;",nativeQuery=true)
	public List<Object[]> RemainingStock();
	
	@Query(value="SELECT COALESCE(fvariety,0),COALESCE(sum(fbags),0) FROM farmerdetails WHERE  setteled=1 AND YEAR(date) = YEAR(now()) AND MONTH(date) = Month(now()) group by fvariety;",nativeQuery=true)
	public List<Object[]> totalloadings();
	
	@Query(value="SELECT COALESCE(fvariety, '') AS fvariety, COALESCE(SUM(fbags), 0) AS total_fbags, m.month AS month \r\n"
			+ "FROM (SELECT 1 AS month UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12) AS m \r\n"
			+ "LEFT JOIN farmerdetails f ON m.month = MONTH(f.date) AND YEAR(f.date) = YEAR(NOW()) AND f.setteled = 1 GROUP BY m.month, fvariety ORDER BY m.month;",nativeQuery=true)
	public List<Object[]> yearilyloadings();
	
	//@Query(value="SELECT COALESCE(fvariety, 'Unknown') AS variety, COALESCE(SUM(fbags), 0) AS bags FROM farmerdetails WHERE setteled = 1 GROUP BY fvariety, DATE_FORMAT(loaddate, '%Y-%m') ORDER BY DATE_FORMAT(loaddate, '%Y-%m');", nativeQuery=true)
	//public List<LinkedHashMap<String, Object>> yearilyData();
	
	@Query(value = "SELECT COALESCE(fvariety, 'Unknown') AS variety, SUM(fbags) AS bags, DATE_FORMAT(loaddate, '%Y-%m') AS month "
            + "FROM farmerdetails WHERE setteled = 1 "
            + "GROUP BY fvariety, month "
            + "ORDER BY month;", nativeQuery = true)
	public List<LinkedHashMap<String, Object>> yearilyData();
}