package spring.service;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import spring.entity.CommissionDetails;
import spring.repository.ComDetails;

@Service
@Transactional
public class ComissionerDataService {
	
	@Autowired
	public ComDetails cmd;
	
	public Map<String,String> getCommissionDetails()
	{
		List<CommissionDetails>li= cmd.findAll();
		Map<String,String> ls=new HashMap<String,String>();
		for(int i=0;i<li.size();i++)
		{
			ls.put(li.get(i).getComname(),li.get(i).getComname());
		}
		return ls;
	}
	
	public String ComDetails(Map<String,String> m)
	{
		CommissionDetails cd=new CommissionDetails();
		cd.setComname(m.get("name"));
		cd.setMobile(m.get("mobile"));
		cd.setLocation(m.get("clocation"));
		cmd.save(cd);
		return "";
	}
	
	public Connection getJdbcCon() throws ClassNotFoundException, SQLException
	{
		Class.forName("com.mysql.cj.jdbc.Driver");
		Connection con=DriverManager.getConnection("jdbc:mysql://localhost:3306/farming","root","123456");
		return con;
	}
	
	public List<LinkedHashMap<String, String>> displayComdetails(Map<String, String> m) throws ClassNotFoundException, SQLException {
		Connection con=getJdbcCon();
		Statement st=con.createStatement();
		
		ResultSet rs=st.executeQuery("Select date,fname,fbags,variety,rate,weight,amount from "+m.get("comm")+" where date between '"+m.get("from")+"' and '"+m.get("to")+"'");
		List<LinkedHashMap<String,String>> lm=new ArrayList<LinkedHashMap<String,String>>();
		int i=0;
		while(rs.next())
		{
			
			LinkedHashMap<String,String> mp=new LinkedHashMap<String,String>();
			mp.put("Sno",(i+1)+"");
		    mp.put("Date", rs.getString("date"));
		    mp.put("Farmer_Name", rs.getString("fname"));
		    mp.put("Bags", rs.getString("fbags"));
//		    mp.put("fplace", rs.getString("fplace"));
//		    mp.put("mobile", rs.getString("mobile"));
		    mp.put("Variety", rs.getString("variety"));
		    mp.put("Rate", rs.getString("rate"));
		    mp.put("Weight", rs.getString("weight"));
		    mp.put("Amount", rs.getString("amount"));
			i++;
			lm.add(mp);
		}
		
		return lm;
	}
}
