package spring.Controller;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import spring.service.FarmerDataService;

@Controller
public class FarmersDataController {
	@Autowired
	public FarmerDataService s;

	@PostMapping("/addfarmer")
	public @ResponseBody Map<String,String> farmerdetail(@RequestBody Map<String,String> mp)
	{
//		if(mp.get("fmobile").equals("7780158135") || mp.get("fmobile").equals("8142818108")) {
//		   //sendSms(mp.get("fmobile"),"");
//		}
		Map<String,String>m=new HashMap<String,String>();
		m.put("messge", "success");
		s.addfarmer(mp);
		return m;
	}
	
	@PostMapping("settlefarmer")
	public @ResponseBody Map<String,String> settlefarmer(@RequestBody Map<String,String>mp)
	{
		Map<String,String>m=new HashMap<String,String>();
		m.put("messge", "success");
		s.settlefarmer(mp.get("mobile"));
		return m;
	}
	@PostMapping("/rejectFarmer")
	public @ResponseBody Map<String,String> rejectfarmer(@RequestBody Map<String,String>mp)
	{
		Map<String,String>m=new HashMap<String,String>();
		m.put("messge", "success");
		s.rejectFarmer(mp.get("mobile"));
		return m;
	}
	
	@GetMapping("getFarmerDetail")
	public @ResponseBody List<Map<String,String>> getFarmerDetails()
	{
		List<Map<String,String>> mp=s.getFarmerDetail();
		return mp;
	}
	
	@PostMapping("getFarmerBill")
	public @ResponseBody Map<String,String> getFarmerBill(@RequestBody Map<String,String> m)
	{
		Map<String,String> mmp=s.getFarmerBill(m);
		return mmp;
	}
	@PostMapping("getFarmerDetailsForMillBill")
	public @ResponseBody Map<String,String> getFarmerDetailsForMillBill(@RequestBody Map<String,String>m)
	{
		Map<String,String>mp=s.getFarmerDetailsForMillBill(m);
		return mp;
	}
	@PostMapping("getEditFarmerdetails")
	public @ResponseBody  Map<String,String> getEditFarmerdetails(@RequestBody Map<String,String>m)
	{
		Map<String,String> mp=s.getEditFarmerdetails(m.get("mobile"),m.get("bags"),m.get("variety"));
		return mp;
	}
	@PostMapping("updateFarmerdata")
	public @ResponseBody Map<String,String> updateFarmerdata(@RequestBody Map<String,String>m)
	{
		String me=s.updateFarmerdata(m);
		Map<String,String> mm=new HashMap<String,String>();
		mm.put("messg", me);
		return mm;
	}
	@PostMapping("modifyFarmerdetails")
	public @ResponseBody String modifyFarmerdetails(@RequestBody Map<String,String> m) throws ClassNotFoundException, SQLException
	{
		s.modifyFarmerdetails(m);
		return "";
	}
	
	@GetMapping("imagedata")
	public @ResponseBody Map<String,String> imagedata()
	{
		return s.getimagedata();
	}
	
	@GetMapping("getTodayGraph")
	public @ResponseBody Map<String,String> getTodayGraph()
	{
		return s.getTodayGraph();
	}
	
	@GetMapping("/getRemainingStock")
	@ResponseBody Map<String,String> getRemainingStock()
	{
		return s.getRemainingStock();
	}
	
	@GetMapping("/totalloadings")
	@ResponseBody Map<String,String> totalloadings()
	{
		return s.totalloadings();
	}
	@GetMapping("/yearilyloadings")
	@ResponseBody Map<String,Object> yearilyloadings()
	{
		return s.yearlyloadings();
	}
	
	@GetMapping("yearilyData")
	@ResponseBody List<Map<String, Object>> yearilyData()
	{
		List<Map<String, Object>> li=s.yearilyData();
		
		return li;
	}
}
