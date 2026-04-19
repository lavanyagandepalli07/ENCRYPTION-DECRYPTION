package com.encryption.crypto;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.PBEKeySpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.security.Security;
import java.security.spec.KeySpec;

@Service
public class AesEncryptionService {

    @Value("${encryption.key-derivation-algorithm:PBKDF2WithHmacSHA256}")
    private String keyDerivationAlgorithm;

    @Value("${encryption.pbkdf2-iterations:100000}")
    private int pbkdf2Iterations;

    @Value("${encryption.salt-length:16}")
    private int saltLength;

    @Value("${encryption.iv-length:16}")
    private int ivLength;

    @Value("${encryption.tag-length:128}")
    private int tagLength;

    private static final String CIPHER_ALGORITHM = "AES/GCM/NoPadding";
    private static final int AES_KEY_SIZE = 256;

    static {
        Security.addProvider(new BouncyCastleProvider());
    }

    /**
     * Encrypts file content using AES-256-GCM with PBKDF2-derived key
     */
    public EncryptedOutput encrypt(byte[] fileContent, String passphrase) throws Exception {
        // Generate random salt
        byte[] salt = generateRandomBytes(saltLength);

        // Derive key from passphrase using PBKDF2
        SecretKey secretKey = deriveKeyFromPassphrase(passphrase, salt);

        // Generate random IV
        byte[] iv = generateRandomBytes(ivLength);

        // Create cipher
        Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM, "BC");
        GCMParameterSpec gcmSpec = new GCMParameterSpec(tagLength, iv);
        cipher.init(Cipher.ENCRYPT_MODE, secretKey, gcmSpec);

        // Encrypt - GCM mode appends the authentication tag to ciphertext
        byte[] ciphertextWithTag = cipher.doFinal(fileContent);

        // Extract GCM tag (last 16 bytes)
        int tagLengthBytes = tagLength / 8;
        byte[] gcmTag = new byte[tagLengthBytes];
        byte[] ciphertext = new byte[ciphertextWithTag.length - tagLengthBytes];
        
        System.arraycopy(ciphertextWithTag, 0, ciphertext, 0, ciphertext.length);
        System.arraycopy(ciphertextWithTag, ciphertext.length, gcmTag, 0, tagLengthBytes);

        // Return IV + Salt + Ciphertext + GCM Tag
        return new EncryptedOutput(iv, salt, ciphertext, gcmTag);
    }

    /**
     * Decrypts file content using AES-256-GCM with PBKDF2-derived key
     */
    public byte[] decrypt(byte[] encryptedData, String passphrase, byte[] salt, byte[] iv) throws Exception {
        // Derive key from passphrase and salt
        SecretKey secretKey = deriveKeyFromPassphrase(passphrase, salt);

        // Create cipher
        Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM, "BC");
        GCMParameterSpec gcmSpec = new GCMParameterSpec(tagLength, iv);
        cipher.init(Cipher.DECRYPT_MODE, secretKey, gcmSpec);

        // Decrypt
        return cipher.doFinal(encryptedData);
    }

    /**
     * Overloaded decrypt method that accepts IV, salt, ciphertext, and GCM tag separately
     */
    public byte[] decrypt(byte[] ciphertext, String passphrase, byte[] salt, byte[] gcmTag, byte[] iv) throws Exception {
        // Combine ciphertext + gcm tag for decryption
        byte[] ciphertextWithTag = new byte[ciphertext.length + gcmTag.length];
        System.arraycopy(ciphertext, 0, ciphertextWithTag, 0, ciphertext.length);
        System.arraycopy(gcmTag, 0, ciphertextWithTag, ciphertext.length, gcmTag.length);

        // Use the other decrypt method
        return decrypt(ciphertextWithTag, passphrase, salt, iv);
    }

    /**
     * Derives a 256-bit AES key from a passphrase using PBKDF2-SHA256
     */
    private SecretKey deriveKeyFromPassphrase(String passphrase, byte[] salt) throws Exception {
        PBEKeySpec keySpec = new PBEKeySpec(
            passphrase.toCharArray(),
            salt,
            pbkdf2Iterations,
            AES_KEY_SIZE
        );

        javax.crypto.SecretKeyFactory keyFactory = javax.crypto.SecretKeyFactory.getInstance(keyDerivationAlgorithm);
        javax.crypto.SecretKey tempKey = keyFactory.generateSecret(keySpec);

        // Convert to AES key
        return new SecretKeySpec(tempKey.getEncoded(), 0, tempKey.getEncoded().length, "AES");
    }

    /**
     * Generates random bytes of specified length
     */
    private byte[] generateRandomBytes(int length) {
        byte[] bytes = new byte[length];
        new SecureRandom().nextBytes(bytes);
        return bytes;
    }

    /**
     * Validates passphrase minimum length
     */
    public void validatePassphrase(String passphrase) throws IllegalArgumentException {
        if (passphrase == null || passphrase.length() < 8) {
            throw new IllegalArgumentException("Passphrase must be at least 8 characters long");
        }
    }
}
