package com.encryption;

import com.encryption.crypto.AesEncryptionService;
import java.io.*;
import java.nio.file.Files;
import java.util.Arrays;

public class StreamingTest {
    public static void main(String[] args) throws Exception {
        AesEncryptionService service = new AesEncryptionService();
        // Manually set values that @Value would provide
        setField(service, "keyDerivationAlgorithm", "PBKDF2WithHmacSHA256");
        setField(service, "pbkdf2Iterations", 100000);
        setField(service, "saltLength", 16);
        setField(service, "ivLength", 16);
        setField(service, "tagLength", 128);

        File inputFile = new File("large_input.bin");
        File encryptedFile = new File("large_encrypted.bin");
        File decryptedFile = new File("large_decrypted.bin");

        // 100MB of data
        long size = 100L * 1024 * 1024;
        System.out.println("Generating 100MB file...");
        try (OutputStream os = new BufferedOutputStream(new FileOutputStream(inputFile))) {
            byte[] chunk = new byte[8192];
            for (long i = 0; i < size; i += chunk.length) {
                os.write(chunk);
            }
        }

        System.out.println("Encrypting...");
        long start = System.currentTimeMillis();
        try (InputStream is = new BufferedInputStream(new FileInputStream(inputFile));
             OutputStream os = new BufferedOutputStream(new FileOutputStream(encryptedFile))) {
            service.encryptStream(is, os, "StrongPass123!");
        }
        System.out.println("Encryption took: " + (System.currentTimeMillis() - start) + "ms");

        System.out.println("Decrypting...");
        start = System.currentTimeMillis();
        try (InputStream is = new BufferedInputStream(new FileInputStream(encryptedFile));
             OutputStream os = new BufferedOutputStream(new FileOutputStream(decryptedFile))) {
            service.decryptStream(is, os, "StrongPass123!");
        }
        System.out.println("Decryption took: " + (System.currentTimeMillis() - start) + "ms");

        // Verify size
        if (inputFile.length() == decryptedFile.length()) {
            System.out.println("SUCCESS: Sizes match!");
        } else {
            System.out.println("FAILURE: Sizes mismatch! Input: " + inputFile.length() + ", Decrypted: " + decryptedFile.length());
        }

        // Cleanup
        inputFile.delete();
        encryptedFile.delete();
        decryptedFile.delete();
    }

    private static void setField(Object obj, String fieldName, Object value) throws Exception {
        java.lang.reflect.Field field = obj.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(obj, value);
    }
}
