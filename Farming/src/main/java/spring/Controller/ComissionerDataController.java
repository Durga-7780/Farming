package spring.Controller;

import java.sql.SQLException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import spring.service.ComissionerDataService;

@Controller
public class ComissionerDataController {
	

	@Autowired
	public ComissionerDataService s;
	
	@GetMapping("ComDetails")
	public @ResponseBody Map<String,String> getCommissionDetails()
	{
		return s.getCommissionDetails();
	}
	
	@PostMapping("saveComDetails")
	public @ResponseBody String saveComdetails(@RequestBody Map<String,String> m)
	{ 
		s.ComDetails(m);
		return "success";
	}
	
	@PostMapping("displayComdetails")
	public @ResponseBody List<LinkedHashMap<String,String>> displayComdetails(@RequestBody Map<String,String> m) throws ClassNotFoundException, SQLException
	{
		List<LinkedHashMap<String,String>> mp=s.displayComdetails(m);
		return mp;
	}
}
