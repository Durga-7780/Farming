package spring.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import spring.entity.Registration;

public interface Datastore extends JpaRepository<Registration,Long> {
	public List<Registration> findByUsername(String name);
	
	@Query(value = "SELECT * FROM registration WHERE accepted = 0", nativeQuery = true)
    List<Registration> findAgentsByAccept();
	
	public void deleteByUsername(String user);
	
	@Query(value = "SELECT * FROM registration WHERE accepted = 1 and username!='admin'", nativeQuery = true)
    List<Registration> findAgentsByAccepted();
	
	@Query(value = "SELECT * FROM registration WHERE accepted = 1 and username!='admin' and flag=1", nativeQuery = true)
    List<Registration> LoginedUsers();
	
	@Query(value = "SELECT * FROM registration WHERE accepted = 1 and username=:user and flag=1", nativeQuery = true)
    public List<Registration> logoutUsers(@Param("user") String username);
	
	@Query(value = "SELECT * FROM registration WHERE accepted = 1 and username=:username and flag=1", nativeQuery = true)
    List<Registration> isLoginedUser(@Param("username") String username);
	
}

