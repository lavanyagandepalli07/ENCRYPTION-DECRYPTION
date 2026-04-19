package com.encryption.service;

import com.encryption.crypto.AesEncryptionService;
import com.encryption.crypto.EncryptedOutput;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class TextService {

    private final AesEncryptionService aesEncryptionService;

    public TextService(AesEncryptionService aesEncryptionService) {
        this.aesEncryptionService = aesEncryptionService;
    }

    public String encryptText(String text, String passphrase) throws Exception {
        aesEncryptionService.validatePassphrase(passphrase);
        byte[] textBytes = text.getBytes(StandardCharsets.UTF_8);
        EncryptedOutput output = aesEncryptionService.encrypt(textBytes, passphrase);
        return Base64.getEncoder().encodeToString(output.toByteArray());
    }

    public String decryptText(String encryptedTextBase64, String passphrase) throws Exception {
        aesEncryptionService.validatePassphrase(passphrase);
        
        byte[] encryptedData;
        try {
            encryptedData = Base64.getDecoder().decode(encryptedTextBase64);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid Base64 encoded string");
        }
        
        if (encryptedData == null || encryptedData.length < 48) {
            throw new IllegalArgumentException("Invalid encrypted text data");
        }

        int offset = 0;
        
        byte[] iv = new byte[16];
        System.arraycopy(encryptedData, offset, iv, 0, 16);
        offset += 16;

        byte[] salt = new byte[16];
        System.arraycopy(encryptedData, offset, salt, 0, 16);
        offset += 16;

        // Ciphertext starts after IV (16) + Salt (16) = 32
        // GCM tag is the last 16 bytes
        byte[] gcmTag = new byte[16];
        System.arraycopy(encryptedData, encryptedData.length - 16, gcmTag, 0, 16);

        byte[] ciphertext = new byte[encryptedData.length - 48];
        System.arraycopy(encryptedData, offset, ciphertext, 0, ciphertext.length);

        byte[] decryptedBytes = aesEncryptionService.decrypt(ciphertext, passphrase, salt, gcmTag, iv);
        return new String(decryptedBytes, StandardCharsets.UTF_8);
    }
}
