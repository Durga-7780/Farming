package spring.entity;

import org.springframework.stereotype.Component;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

import jakarta.annotation.PostConstruct;
import spring.repository.TAccountRepository;

@Component
public class SmsService {

	
    private TAccountRepository appSettingRepository;

    private String accountSid;
    private String authToken;
    private String twilioPhoneNumber;

    public SmsService(TAccountRepository appSettingRepository) {
        this.appSettingRepository = appSettingRepository;
    }

    @PostConstruct
    public void init() {
    	TAccount t=appSettingRepository.findByPhone("+17755045333");
    	if(t!=null) {
        this.accountSid = t.getAccount();
        this.authToken = t.getAccess_token();
        this.twilioPhoneNumber = t.getPhone();
        Twilio.init(this.accountSid, this.authToken);
    	}
    	else {
    		System.out.println("Error Found Taccount");
    	}
    }

    public void sendSms(String to, String messageBody) {
    	if(this.accountSid !=null || this.accountSid!="") {
        Message message = Message.creator(new PhoneNumber(to), 
                new PhoneNumber(twilioPhoneNumber), 
                messageBody) 
                .create();
        System.out.println("SMS sent! SID: " + message.getSid());
    	}
    }
}