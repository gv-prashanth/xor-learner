package com.vadrin.xorlearner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.vadrin")
public class XorLearnerApplication {

	public static void main(String[] args) {
		SpringApplication.run(XorLearnerApplication.class, args);
	}

}
