package spring.Controller;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import jakarta.servlet.http.HttpSession;
import spring.entity.Registration;
import spring.service.RegistrationService;

@Controller
public class RegistrationController {

	@Autowired
	public RegistrationService s;
	
	@GetMapping("/register")
	public String regi()
	{
		 return "register";
	}
	
	@PostMapping("/saveregdata")
	public @ResponseBody Map<String,String> savereg(@RequestBody Map<String,String> mp)
	{
		Registration reg=new Registration();
		reg.setName(mp.get("empname"));
		reg.setMobile(mp.get("mobile"));
		reg.setUsername(mp.get("user"));
		reg.setPassword(mp.get("pass"));
		reg.setGender(mp.get("gender"));
		Calendar calendar = Calendar.getInstance();
	    SimpleDateFormat formatter = new SimpleDateFormat("dd MMM HH:mm");
	    String dateStr = formatter.format(calendar.getTime());
		reg.setDate(dateStr.toUpperCase());
		
		if(mp.get("user").equals("admin"))
			reg.setAccepted(1);
		s.registerdata(reg);
		
		Map<String,String> op=new HashMap<String,String>();
		op.put("messg","login");
		return op;
	}
	
	@PostMapping("/checkusername")
	public @ResponseBody boolean checkusername(@RequestBody Map<String,String> mp)
	{
		if(s.checkusername(mp.get("id")))
		 return true;
		return false;
	}
	
	@GetMapping("registeredUsers")
	@ResponseBody
	public List<Map<String, String>> registeredUsers(){
	List<Registration> r2=s.getAcceptedUsers(); 
	List<Map<String, String>> li=new ArrayList<>();
	 for(Registration r:r2)
	 {
		 Map<String, String> m=new HashMap<String,String>();
		 m.put("name", r.getName());
		 m.put("gender", r.getGender());
		 m.put("username", r.getUsername());
		 m.put("password", r.getPassword());
		 m.put("mobileno", r.getMobile());
		 li.add(m);
	 }
	return li;
	}
	
	@PostMapping("/logoutUsers")
	public @ResponseBody String logoutUsers(@RequestBody Map<String,String>mp)
	{
		if(s.logoutUsers(mp.get("username")))
		return "success";
		return "failed";
	}
	@GetMapping("/loginedUsers")
	public @ResponseBody List<Map<String,String>> LoginedUsers() {
	    List<Map<String,String>> userList = new ArrayList<>();
	    List<Registration> r = s.LoginedUsers();
	    for (Registration l : r) {
	        Map<String, String> mp = new HashMap<>();
	        mp.put("name", l.getName());
	        mp.put("username", l.getUsername());
	        userList.add(mp);
	    }
	    return userList; // Return List of Maps
	}
	@PostMapping("saveAdminPassword")
	@ResponseBody String saveAdminPassword(@RequestBody Map<String,String>mp)
	{
		s.saveAdminPassword(mp);
		return "";
	}
	
	@PostMapping("saveEditDetails")
	@ResponseBody String saveEditDetails(@RequestBody Map<String,String>m)
	{
		s.saveEditDetails(m);
		return "";
	}
	
	@PostMapping("/checklogindata")
	public @ResponseBody Map<String,String> checklogdata(@RequestBody Map<String,String> mp, HttpSession session)
	{
		Map<String,String> obj=new HashMap<String,String>();
		String op=s.checklogin(mp);
		String name=s.getNameForDashboard(mp);
		if(op.equals("true"))
		{
		  obj.put("messg", "success");
		  obj.put("name",name);
		  return obj;
		}
		else if(op.equals("admin"))
		{
			obj.put("messg", "admin");
			obj.put("name",name);
			return obj;
		}
		else if(op.equals("User_already_Logined"))
		{
			obj.put("messg","User_already_Logined");
			return obj;
		}
		else {
		obj.put("messg", "Username or Password incorrect / Please contact admin");
		return obj;
		}
	}
	
	@GetMapping("RecentUsers")
	@ResponseBody
	public List<Map<String, String>> RecentUsers() {
	    List<Registration> r1 = s.getAdmindata();  
	    List<Map<String, String>> result = new ArrayList<>();

	    for (Registration r : r1) {
	        Map<String, String> userDetails = new HashMap<>();
	        userDetails.put("name", r.getName()); 
	        userDetails.put("gender", r.getGender());
	        userDetails.put("date", r.getDate().toString());
	        userDetails.put("username", r.getUsername());
	        result.add(userDetails); 
	    }
	    return result;
	}
	
	@PostMapping("/acceptadmin")
	public @ResponseBody String acceptadmin(@RequestBody Map<String,String>mp)
	{
		s.acceptadmin(mp.get("user"));
		return "success";
	}
	
	@PostMapping("isLoginedIn")
	public @ResponseBody Map<String,String> isLoginedIn(@RequestBody Map<String,String>m)
	{
		boolean l=s.checkIslogin(m);
		Map<String,String> mp=new HashMap<String,String>();
		if(!l) {
		mp.put("data", "success");
		}
		else {
			mp.put("data", "failed");
		}
		return mp;
	}
	
	@PostMapping("/rejectadmin")
	public @ResponseBody String rejectadmin(@RequestBody Map<String,String>mp)
	{
		s.rejectadmin(mp.get("user"));
		return "success";
	}
	
	@PostMapping("/logout")
	public @ResponseBody String logoutUser(@RequestBody Map<String,String>mp) {
		boolean flag = s.logoutUsers(mp.get("username"));
		return "success";
	}
}
