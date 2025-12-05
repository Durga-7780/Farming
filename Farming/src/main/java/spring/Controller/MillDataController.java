package spring.Controller;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import spring.service.MillDataService;

@Controller
public class MillDataController {
	
	@Autowired
	public MillDataService s;
	
	@GetMapping("getMillDetails")
	public @ResponseBody List<Map<String,String>> getMillDetails()
	{
		List<Map<String,String>> mp=s.getMilldata();
		return mp;
	}
	@PostMapping("/addmill")
	public @ResponseBody Map<String,String> addmill(@RequestBody Map<String,String>mp)
	{
		s.addmilldata(mp);
		Map<String,String> m=new HashMap<String,String>();
		m.put("messg", "success");
		return m;
	}
	
	@PostMapping("getSelectedMilldata")
	public @ResponseBody List<LinkedHashMap<String,String>> getSelectedMilldata(@RequestBody Map<String,String> m)
	{	
		List<LinkedHashMap<String,String>> mp=s.getSelectedMilldata(m);
		return mp;
	}

	@PostMapping("savemillbilldata")
	public @ResponseBody Map<String,String> savemillbilldata(@RequestBody Map<String,String> m) throws ClassNotFoundException, SQLException
	{
		s.savemillbilldata(m);
		Map<String,String> mp=new HashMap<String,String>();
		mp.put("messg", "success");
		return mp;
	}
	
	@PostMapping("/generate")
    @ResponseBody
    public String saveExcelToFile(@RequestBody Map<String, String> request) {
        List<LinkedHashMap<String, String>> data = s.getSelectedMilldata(request);
        return s.generateExcel(data, request);
    }
	
}
