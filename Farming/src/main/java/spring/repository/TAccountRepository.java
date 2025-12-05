package spring.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import spring.entity.TAccount;

public interface TAccountRepository extends JpaRepository<TAccount, String> {
	public TAccount findByPhone(String phone);
}