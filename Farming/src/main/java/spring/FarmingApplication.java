package spring;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FarmingApplication implements CommandLineRunner {

    public static void main(String[] args) {
        SpringApplication.run(FarmingApplication.class, args);
    }

	@Override
	public void run(String... args) throws Exception {
		// TODO Auto-generated method stub
		
	}

//    @Override
//    public void run(String... args) {
//        openBrowser("http://localhost:2004");
//      }
//
//    private void openBrowser(String url) {
//        try {
//            String os = System.getProperty("os.name").toLowerCase();
//            if (os.contains("win")) {
//                Runtime.getRuntime().exec("rundll32 url.dll,FileProtocolHandler " + url);
//            } else if (os.contains("mac")) {
//                Runtime.getRuntime().exec("open " + url);
//            } else if (os.contains("nix") || os.contains("nux")) {
//                Runtime.getRuntime().exec("xdg-open " + url);
//            } else {
//                System.out.println("Unable to open browser. Unsupported operating system.");
//            }
//        } catch (Exception e) {
//            System.out.println("Failed to open browser: " + e.getMessage());
//        }
//    }

}
