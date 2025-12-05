package spring.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import jakarta.servlet.http.HttpSession;
import spring.entity.SmsService;


@Controller
public class Pagescontroller {
	
	@Autowired
	private final SmsService smsService;

	public Pagescontroller(SmsService smsService) {
	    this.smsService = smsService;
	 }

	@GetMapping("/")
	public String loginhtml()
	{
		return "login";
	}

	@PostMapping("/send")
	public String sendSms(@RequestParam String to, @RequestParam String message) {
	        smsService.sendSms("+91"+to, "Hi, this is durga ,I am sending this message through my spring boot application");
	        return "SMS sent successfully!";
	}
	
	@GetMapping("/login")
	String samplepage(HttpSession ses)
	{
		return "login";
	}
	
	@GetMapping("Admin")
	public String getAdmindata(Model m,HttpSession ses)
	{
			return "adminpage/dist/dashboard/index";
	}
	
	@GetMapping("/dashboard")
	public String dash()
	{
		  return "dashboard";
	}
	
    
}
