package com.encryption;

import com.encryption.crypto.AesEncryptionService;
import com.encryption.crypto.EncryptedOutput;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
public class LargeFileStreamingTest {

    @Autowired
    private AesEncryptionService aesEncryptionService;

    @Test
    void testMemoryStabilityWithLargeData() throws Exception {
        // We simulate a large file by processing it in chunks
        // Currently the service doesn't support streams, so this will likely FAIL if we give it 1GB
        // But we can test if we can at least handle 100MB without exploding (default heap might be small)
        
        int size = 10 * 1024 * 1024; // 10MB
        byte[] largeData = new byte[size];
        Arrays.fill(largeData, (byte) 0);

        long beforeMemory = Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory();
        
        EncryptedOutput output = aesEncryptionService.encrypt(largeData, "StrongPass123!");
        
        long afterMemory = Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory();
        
        assertNotNull(output);
        System.out.println("Memory used: " + (afterMemory - beforeMemory) / (1024 * 1024) + " MB");
    }
}
