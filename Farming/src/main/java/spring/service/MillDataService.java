package spring.service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.activation.FileDataSource;
import jakarta.mail.internet.MimeMessage;
import spring.entity.Farmerdetails;
import spring.entity.MillBill;
import spring.entity.Milldetails;
import spring.repository.Farmerdata;
import spring.repository.MillBilldata;
import spring.repository.MilldataInt;

@Service
@Transactional
public class MillDataService {

	@Autowired
	public MilldataInt md;
	@Autowired
	public MillBilldata mbill;
	@Autowired
	public Farmerdata fdt;
    @Autowired
	private JavaMailSender mailSender;
	
	public List<Map<String,String>> getMilldata()
	{
		List<Milldetails> l= md.findAll();
		List<Map<String,String>> m =new LinkedList<Map<String,String>>();
		for(Milldetails f:l)
		{
			Map<String,String> mp =new HashMap<String,String>();
			mp.put("millname", f.getMname());
			mp.put("location", f.getMlocation());
			mp.put("email", f.getMemail());
			m.add(mp);
		}
		return m;
	}
	public String addmilldata(Map<String,String> mp)
	{
		Milldetails mdata=new Milldetails();
		mdata.setMname(mp.get("mname"));
		mdata.setMemail(mp.get("memail"));
		mdata.setMlocation(mp.get("mlocation"));
		md.save(mdata);
		return "success";
	}

	public Connection getJdbcCon() throws ClassNotFoundException, SQLException
	{
		Class.forName("com.mysql.cj.jdbc.Driver");
		Connection con=DriverManager.getConnection("jdbc:mysql://localhost:3306/farming","root","123456");
		return con;
	}
	
	public String savemillbilldata(Map<String,String>m) throws ClassNotFoundException, SQLException
	{
		MillBill mb=new MillBill();
		String millname= m.get("mill");
				
		mb.setFarmername(m.get("farmer"));
		mb.setFarmerplace(m.get("farmerplace"));
		System.out.println("formated date "+formateDate());
		mb.setDate(formateDate());
		mb.setBags(m.get("bag"));
		mb.setMillname(m.get("mill"));
		mb.setRate(m.get("amt"));
		mb.setVariety(m.get("item"));
		mb.setWeight(m.get("weights"));
		mb.setVehicle(m.get("vehicleno"));
		mb.setRemarks(m.get("remark"));
		List<Farmerdetails> fm=fdt.findByFmobile1(m.get("mobile"));
		
		Connection con=getJdbcCon();
		Statement st=con.createStatement();
		
		st.execute("CREATE TABLE IF NOT EXISTS `" + millname + "` AS SELECT date, vehicle, farmername, variety, bags, rate, weight, amount, remarks FROM mill_bill WHERE FALSE");	
		
		String modify="ALTER TABLE `"+millname+"`MODIFY `date` varchar(25), MODIFY `vehicle` VARCHAR(25), MODIFY `farmername` VARCHAR(40),\r\n"
				+ "MODIFY `variety` VARCHAR(25),\r\n"
				+ "MODIFY `bags` varchar(5),\r\n"
				+ "MODIFY `rate` varchar(7),\r\n"
				+ "MODIFY `weight` varchar(10),\r\n"
				+ "MODIFY `remarks` varchar(250),\r\n"
				+ "MODIFY `amount` varchar(20);";
		st.execute(modify);
		
//		String sql = "ALTER TABLE `" + millname + "` ADD UNIQUE (date, vehicle,farmername, variety, bags, rate, weight, amount)";
//		st.execute(sql);
		String query = "INSERT IGNORE INTO `" +millname+"` (farmername, variety, vehicle, weight, bags, rate, date, amount, remarks) " +
	               "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
		
		PreparedStatement p = con.prepareStatement(query);
		p.setString(1, m.get("farmer"));
		p.setString(2, m.get("item"));
		p.setString(3, m.get("vehicleno"));
		p.setString(4, m.get("weights"));
		p.setString(5, m.get("bag"));
		p.setString(6, m.get("amt"));
		p.setString(7, formateDate());
		p.setString(9, m.get("remark").replaceAll("_", " "));
		int amt=(int)((Integer.parseInt(m.get("weights"))-Integer.parseInt(m.get("bag")))/75)*(Integer.parseInt(m.get("amt")));
		
		mb.setAmount(amt+"");
		p.setString(8, amt+"");
		p.executeUpdate();
		mbill.save(mb);
		
		if(!m.get("comm").equals("") || m.get("comm")!=null)
		{
		String com=m.get("comm").replace(" ", "_");
		
		st.execute("CREATE TABLE IF NOT EXISTS `" + com + "` (sno int primary key auto_increment,date varchar(20),fname varchar(30),fbags varchar(5),fplace varchar(20),mobile varchar(12), variety varchar(8),rate varchar(10),weight varchar(10),amount varchar(10),remarks varchar(200))");	
		
		String place=fm.get(0).getFlocation();
		String mobile=m.get("mobile");
		
		String comquery = "INSERT IGNORE INTO `" + com + "` (date, fname, fbags, fplace, mobile, variety, rate, weight, amount, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
		PreparedStatement pp = con.prepareStatement(comquery);
		pp.setString(1, formateDate());
		pp.setString(2, m.get("farmer"));
		pp.setString(3, m.get("bag"));
		pp.setString(4, place);
		pp.setString(5, mobile);
		pp.setString(6, m.get("item"));
		pp.setString(7, m.get("amt"));
		pp.setString(8, m.get("weights"));
		pp.setString(9, amt+"");
		pp.setString(10, m.get("remark"));
		pp.executeUpdate();
		}
		if(fm.size()>0) {
			fm.get(0).setSetteled(1);
			fm.get(0).setWeight(m.get("weights"));
			fm.get(0).setLoaddate(formateDate());
			//fm.get(0).setDate(m.get("dt"));
			fdt.save(fm.get(0));
		}
		return "";
	}
	
	public List<LinkedHashMap<String,String>> getSelectedMilldata(Map<String,String> m)
	{
		System.out.println("getSelected mill data "+m.get("from")+" to "+m.get("to"));
		List<MillBill> li=mbill.findByMillnameAndDateBetween(m.get("mill"),m.get("from"),m.get("to"));
		List<LinkedHashMap<String,String>> mp1=new LinkedList<LinkedHashMap<String,String>>();
		System.out.println("data "+mp1);
		for(int i=0;i<li.size();i++)
		{
			LinkedHashMap<String,String> mp=new LinkedHashMap<String,String>();
			mp.put("sno",(i+1)+"");
			mp.put("date", li.get(i).getDate());
			mp.put("vehicle",li.get(i).getVehicle());
			mp.put("farmername",li.get(i).getFarmername());
			mp.put("variety", li.get(i).getVariety());
			mp.put("bags", li.get(i).getBags());
			mp.put("rate", li.get(i).getRate());
			mp.put("weight", li.get(i).getWeight());
			mp.put("amt", li.get(i).getAmount());
			mp.put("remarks", li.get(i).getRemarks());
			mp1.add(mp);
		}
		return mp1;
	}
	
	public String formateDate()
	{
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formattedDate = LocalDate.now().format(formatter);

		return formattedDate;
	}
	
	@SuppressWarnings("resource")
	public String generateExcel(List<LinkedHashMap<String, String>> data,Map<String, String> request) {
		String to_Email=request.get("to_Email");
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Mill Data");

        // Create header row
        Row header = sheet.createRow(0);
        String[] headers = {"S.No", "Date", "Vehicle", "Farmer Name", "Variety", "Bags", "Rate", "Weight", "Amount", "Remarks"};
        for (int i = 0; i < headers.length; i++) {
            header.createCell(i).setCellValue(headers[i]);
        }

        // Populate data rows
        int rowIdx = 1;
        for (LinkedHashMap<String, String> rowData : data) {
            Row dataRow = sheet.createRow(rowIdx++);
            dataRow.createCell(0).setCellValue(rowData.get("sno"));
            dataRow.createCell(1).setCellValue(rowData.get("date"));
            dataRow.createCell(2).setCellValue(rowData.get("vehicle"));
            dataRow.createCell(3).setCellValue(rowData.get("farmername"));
            dataRow.createCell(4).setCellValue(rowData.get("variety"));
            dataRow.createCell(5).setCellValue(rowData.get("bags"));
            dataRow.createCell(6).setCellValue(rowData.get("rate"));
            dataRow.createCell(7).setCellValue(rowData.get("weight"));
            dataRow.createCell(8).setCellValue(rowData.get("amt"));
            dataRow.createCell(9).setCellValue(rowData.get("remarks"));
        }

//        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
//        String formattedDate = LocalDate.now().format(formatter);

        String uploadDir = "./Mill_Pdfs";
        Path directoryPath = Paths.get(uploadDir,request.get("mill"));

        // Create directory if it doesn't exist
        if (!Files.exists(directoryPath)) {
            try {
                Files.createDirectories(directoryPath); 
            } catch (IOException e) {
                e.printStackTrace();
                return "Error creating directory: " + e.getMessage();
            }
        } 
        String from =request.get("from").replaceAll("/", "-");
        String to= request.get("to").replaceAll("/", "-");
        
        // Construct the file path using Paths.get()
        Path filePath = directoryPath.resolve(from+"_to_"+to+".xlsx");

        try (FileOutputStream fileOut = new FileOutputStream(filePath.toFile())) {
            workbook.write(fileOut);
            workbook.close(); 
            String result = send_email(filePath, "pdsaiprasad1193@gmail.com", to_Email, "srinivas",from,to);
            System.out.println(result); 
            return "Excel file saved successfully at " + filePath.toString();
        } catch (IOException e) {
            e.printStackTrace();
            return "Error while saving Excel file: " + e.getMessage();
        } finally {
            try {
                workbook.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
	}
	
    public String send_email(Path file, String from, String to, String filename,String fromdate,String todate) {
        // Email properties (these can be configured in application.properties)
        String subject = "Report from " + fromdate + " to " + todate + " data";
        String toEmail = to; 

        try {
            // Create the MimeMessage
            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(message, true); // true indicates multipart message

            // Set email fields
            helper.setTo(toEmail);
            helper.setFrom(from);
            helper.setSubject(subject);
            helper.setText("Hi<br><br>Good Day !!<br><br><strong> This is the report from <span style='color: red;'>" + fromdate + "</span> to <span style='color: red;'>" + todate + "</span>.<br></strong> Please review the attached report, and let me know if any transactions are missing or if there's any incorrect data.<br><br>Thank you! Have a nice Day<br><br>Durga",true);

            // Attach the file
            FileDataSource dataSource = new FileDataSource(file.toFile());
            helper.addAttachment(filename+".xlsx", dataSource);

            // Send the email
			try {
				mailSender.send(message);
				
				File file1 = file.toFile();
				 boolean success = true;
			        success &= file1.setWritable(true);
			        success &= file1.setReadable(true);
			        success &= file1.setExecutable(true);

			        if (success) {
			            System.out.println("Permissions set to all for the file.");
			        } else {
			            System.out.println("Failed to set some permissions on the file.");
			        }
				if (file1.exists()) {
					if (file1.delete()) {
						System.out.println("File deleted successfully.");
					} else {
						System.out.println("Failed to delete the file."+file);
					}
				} else {
					System.out.println("File does not exist.");
				}
				return "success";
			} catch (MailException e) {
				return "failure";
			}
        } catch (Exception e) {
            e.printStackTrace();
            return "failure: " + e.getMessage(); // Failure, return the error message
        }
    }
}
