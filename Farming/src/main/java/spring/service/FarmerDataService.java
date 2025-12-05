package spring.service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import spring.entity.CommissionDetails;
import spring.entity.Farmerdetails;
import spring.repository.ComDetails;
import spring.repository.Farmerdata;

@Service
@Transactional
public class FarmerDataService {
	
	@Autowired
	public Farmerdata fdt;
	@Autowired
	public ComDetails cmd;
	
	public String addfarmer(Map<String,String> mp)
	{
		Farmerdetails fd=new Farmerdetails();
		fd.setFname(mp.get("fname"));
		fd.setFmobile(mp.get("fmobile"));
		fd.setFlocation(mp.get("flocation"));
		fd.setFbags(mp.get("fbags"));
		fd.setFvariety(mp.get("fvariety"));
		fd.setDate(mp.get("dt"));
		fdt.save(fd);
		return "success";
	}
	
	public List<Farmerdetails> getFarmerData()
	{
		return fdt.getFarmerdetails();
	}
	
	public List<Map<String,String>> getFarmerDetail()
	{
		List<Map<String,String>> m =new LinkedList<Map<String,String>>();
		List<Farmerdetails> li=fdt.getFarmerdetails();
		for(Farmerdetails f:li)
		{
			Map<String,String> mp =new HashMap<String,String>();
			mp.put("farmer", f.getFname());
			mp.put("bags", f.getFbags());
			mp.put("place", f.getFlocation());
			mp.put("mobile",f.getFmobile());
			mp.put("variety", f.getFvariety());
			m.add(mp);
		}
		return m;
	}
	
	public String settlefarmer(String m)
	{ 
		List<Farmerdetails>li=fdt.findByFmobile1(m);
		Farmerdetails fd=li.get(0);
		System.out.println("date "+fd.getDate());
		SimpleDateFormat formatter = new SimpleDateFormat("dd/MM/YYYY");
		String formattedDate = formatter.format(new Date());  
		if(li.size()>0) {
		fd.setLoaddate(formattedDate);
		fd.setSetteled(1);
		fdt.save(fd);
		return "success";
		}
		return "failed";
	}
	
	public String rejectFarmer(String m)
	{
		List<Farmerdetails>li=fdt.findByFmobile1(m);
		System.out.println(li.get(0).getSno());
		fdt.deleteById(li.get(0).getSno());
		return "success";
	}
	
	public Map<String,String> getimagedata() {
		List<String> li1=fdt.totalbags();
		List<String> li2=fdt.items();
		Map<String,String> mp=new HashMap<String,String>();
		for(int i=0;i<li1.size();i++)
		{
			mp.put(li2.get(i), li1.get(i));
		}
		return mp;
	}
	
	public Map<String,String> getTodayGraph()
	{
		List<String> li1=fdt.totalloadingbags();
		List<String> li2=fdt.todaytotalitems();
		Map<String,String> mp=new HashMap<String,String>();
		for(int i=0;i<li1.size();i++)
		{
			mp.put(li2.get(i), li1.get(i));
		}
		return mp;
	}
public Map<String, String> getFarmerDetailsForMillBill(Map<String, String> m) {
		
		List<Farmerdetails>li= fdt.findByFmobile1(m.get("mobile"));
		 Map<String, String> mp=new  HashMap<String, String>();
		 for(Farmerdetails f:li) {
		    mp.put("name", f.getFname());
		    mp.put("location", f.getFlocation());
		    mp.put("bags", f.getFbags());
		    mp.put("variety", f.getFvariety());
		 }
		return mp;
	}

	public Map<String, String> getEditFarmerdetails(String mob,String bags,String fvariety) {
		List<Farmerdetails> li=fdt.findByFmobileEditform(mob);
		Map<String,String> mp=new HashMap<>();
	System.out.println("findByFmobileEditform "+li.size());
		if(li.size()>0) {
			for(Farmerdetails f:li)
			{
				mp.put("name", f.getFname());
				mp.put("bag", f.getFbags());
				mp.put("place", f.getFlocation());
				mp.put("mobile", f.getFmobile());
				mp.put("variety", f.getFvariety());
				
			}
		return mp;
		}
		return null;
	}

	public String updateFarmerdata(Map<String, String> m) {
		List<Farmerdetails>li=fdt.findByFmobileEditform1(m.get("mobile"));
		Farmerdetails f=li.get(0);
		if(li.size()>0)
		{
			f.setFname(m.get("name"));
			f.setFbags(m.get("bag"));
			f.setFvariety(m.get("variety"));
			f.setFlocation(m.get("place"));
			f.setFmobile(m.get("chmobile"));
			fdt.save(f);
			return "success";
		}
		return "failed";
	}

	public Map<String, String> getRemainingStock() {
	    List<Object[]> result = fdt.RemainingStock();  
	    Map<String, String> mp = new LinkedHashMap<>();

	    for (Object[] row : result) {
	        String variety = row[0].toString();  
	        String totalBags = row[1].toString();  
	        mp.put(variety, totalBags);  
	    }
	    return mp;  
	}
	
	public Map<String,String>totalloadings ()
	{
		 List<Object[]> li=fdt.totalloadings();
		 Map<String,String> mp=new LinkedHashMap<String,String>();
		 for(Object[] row:li)
		 {
			 mp.put(row[0].toString(), row[1].toString());
		 } 
		 return mp;
	}
	public Map<String, Object> yearlyloadings() {
	    List<Object[]> li = fdt.yearilyloadings(); // Fetch the data
	    Map<String, Object> mp = new LinkedHashMap<>();
	    
	    if (li != null) {
	        for (Object[] row : li) {
	            String month = (row[0] != null) ? row[0].toString() : "";
	            String variety = (row[1] != null) ? row[1].toString() : "";
	            String totalBags = (row[2] != null) ? row[2].toString() : "0";

	            String key = month + " - " + variety;
	            mp.put(key, totalBags);
	        }
	    }
	    return mp;
	}
	
	public List<Map<String, Object>> yearilyData() {
		
		 //List<LinkedHashMap<String, Object>>li= fdt.yearilyData();
		 List<LinkedHashMap<String, Object>> data = fdt.yearilyData();
		 List<Map<String, Object>> processedData = new ArrayList<>();

	        for (LinkedHashMap<String, Object> result : data) {
	            String variety = (String) result.get("variety");
	            Integer bags = ((Number) result.get("bags")).intValue(); // Safely cast bags to Integer
	            String month = (String) result.get("month");

	            Map<String, Object> item = new LinkedHashMap<>();
	            item.put("variety", variety);
	            item.put("bags", bags);
	            item.put("month", month);
	            System.out.println(item);
	            processedData.add(item);
	        }

	        return processedData;
	}
	public Connection getJdbcCon() throws ClassNotFoundException, SQLException
	{
		Class.forName("com.mysql.cj.jdbc.Driver");
		Connection con=DriverManager.getConnection("jdbc:mysql://localhost:3306/farming","root","123456");
		return con;
	}
	public void modifyFarmerdetails(Map<String, String> m) throws ClassNotFoundException, SQLException {
		Connection con=getJdbcCon();
		Statement st=con.createStatement();
		
		List<CommissionDetails> li=cmd.findAll();
		if(li.size()>0) {
			for(CommissionDetails c:li)
			{
				String comname=c.getComname().replace(" ", "_");
				try (ResultSet rs = st.executeQuery("SELECT * FROM " + comname + " WHERE fmobile='" + m.get("mobile") + "'")) {
			        if (rs.next()) {
			            int rowsAffected = st.executeUpdate("UPDATE " + comname + " SET rate='" + m.get("cost") + "', amount='" + m.get("amt") + "' WHERE fmobile='" + m.get("mobile") + "'");
			            System.out.println(rowsAffected + " rows updated.");
			            break;
			        }
			    } catch (SQLException e) {
			        e.printStackTrace(); 
			    }
			}
		}		
	}
	
	public Map<String,String> getFarmerBill(Map<String,String> m)
	{
		List<Farmerdetails> li=fdt.findByFmobile(m.get("mobile"));
		Map<String,String> mp=new HashMap<String,String>();
		for(Farmerdetails f:li)
		{
			mp.put("name", f.getFname());
			mp.put("mobile", f.getFmobile());
			mp.put("place", f.getFlocation());
			mp.put("variety", f.getFvariety());
			mp.put("bags", f.getFbags());
			mp.put("weight", f.getWeight());
			mp.put("date", f.getLoaddate());
		}
		return mp;
	}
}
