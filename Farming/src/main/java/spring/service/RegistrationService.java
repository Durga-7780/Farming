package spring.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import spring.entity.Registration;
import spring.repository.Datastore;

@Service
@Transactional
public class RegistrationService {
	
	@Autowired
	public Datastore d;
	
	public boolean checkIslogin(Map<String,String>m) {
		return d.isLoginedUser(m.get("username")).isEmpty();
	}
	
	public String rejectadmin(String user)
	{
		d.deleteByUsername(user);
		return "";
	}
	
	public boolean registerdata(Registration reg)
	{
		d.save(reg);
		return true;
	}
	
	public boolean checkusername(String username)
	{
		List<Registration> li=d.findByUsername(username);
		if(!li.isEmpty())
		{
			return true;
		}
		return false;
	}
	
	public List<Registration> getAcceptedUsers()
	{
		List<Registration> li=d.findAgentsByAccepted();
		return li;
	}
	
	public List<Registration> LoginedUsers()
	{
		return d.LoginedUsers(); 
	}
	
	public boolean logoutUsers(String username)
	{
		List<Registration> l=d.logoutUsers(username);
		if(l.size()>0) {
		l.get(0).setFlag(0);
		d.save(l.get(0));
		return true;
		}
		return false;
	}
	public void saveAdminPassword(Map<String, String> mp) {
		
		List<Registration> li=d.findByUsername(mp.get("user"));
		li.get(0).setPassword(mp.get("pass"));
		d.save(li.get(0));
	}
	
	public void saveEditDetails(Map<String,String>m) {
		List<Registration> li=d.findByUsername(m.get("username"));
		li.get(0).setGender(m.get("username"));
		li.get(0).setName(m.get("name"));
		li.get(0).setPassword(m.get("password"));
		li.get(0).setGender(m.get("gender"));
		li.get(0).setMobile(m.get("mobile"));
		d.save(li.get(0));
	}
	public String checklogin(Map<String, String> mp) {
		List<Registration> li=d.findByUsername(mp.get("username"));
		if(!li.isEmpty()&& !li.get(0).getUsername().equals("admin") && li.get(0).getFlag()!=1 && li.get(0).getPassword().equals(mp.get("password")) && li.get(0).getUsername().equals(mp.get("username")) && li.get(0).getAccepted()==1)
		{
			li.get(0).setFlag(1);
			d.save(li.get(0));
			return "true";
		}
		else if(!li.isEmpty()&& !li.get(0).getUsername().equals("admin") && li.get(0).getFlag()==1 && li.get(0).getPassword().equals(mp.get("password")) && li.get(0).getUsername().equals(mp.get("username")) && li.get(0).getAccepted()==1) {
			return "User_already_Logined";
		}
		else if(!li.isEmpty()&& li.get(0).getUsername().equals("admin") && li.get(0).getPassword().equals(mp.get("password")))
		{
			li.get(0).setFlag(1);
			d.save(li.get(0));
		    return "admin";	
		}
		else
		return "false";
	}
	
	public List<Registration> getAdmindata()
	{
		List<Registration> li=d.findAgentsByAccept();
		return li;
	}
	
	public String acceptadmin(String user)
	{
		List<Registration> reg=d.findByUsername(user);
		Registration r=reg.get(0);
		r.setAccepted(1);
		d.save(r);
		return "";
	}
	public String getNameForDashboard(Map<String,String> mp)
	{
		 List<Registration> li=d.findByUsername(mp.get("username"));
		 if(li.isEmpty())
			 return null;
		 else
		     return li.get(0).getName();
	}
}
