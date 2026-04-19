package com.encryption;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class EncryptionDecryptionApplication {

    public static void main(String[] args) {
        // Load .env from root directory (one level up from backend/)
        try {
            Dotenv dotenv = Dotenv.configure()
                .directory("..")
                .ignoreIfMissing()
                .load();
            
            dotenv.entries().forEach(entry -> {
                if (System.getProperty(entry.getKey()) == null) {
                    System.setProperty(entry.getKey(), entry.getValue());
                }
            });
        } catch (Exception e) {
            System.err.println("Warning: Could not load .env file: " + e.getMessage());
        }

        SpringApplication.run(EncryptionDecryptionApplication.class, args);
    }

}
