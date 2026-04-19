package com.encryption.crypto;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

public class AesEncryptionServiceTest {

    private AesEncryptionService aesEncryptionService;

    @BeforeEach
    public void setUp() {
        aesEncryptionService = new AesEncryptionService();
        
        // Set default values using reflection
        ReflectionTestUtils.setField(aesEncryptionService, "keyDerivationAlgorithm", "PBKDF2WithHmacSHA256");
        ReflectionTestUtils.setField(aesEncryptionService, "pbkdf2Iterations", 100000);
        ReflectionTestUtils.setField(aesEncryptionService, "saltLength", 16);
        ReflectionTestUtils.setField(aesEncryptionService, "ivLength", 16);
        ReflectionTestUtils.setField(aesEncryptionService, "tagLength", 128);
    }

    @Test
    public void testEncryptDecryptConsistency() throws Exception {
        String passphrase = "SecurePassphrase123!";
        String testContent = "This is a test file content for encryption.";
        byte[] fileContent = testContent.getBytes();

        // Encrypt
        EncryptedOutput encryptedOutput = aesEncryptionService.encrypt(fileContent, passphrase);

        assertNotNull(encryptedOutput);
        assertNotNull(encryptedOutput.getIv());
        assertNotNull(encryptedOutput.getSalt());
        assertNotNull(encryptedOutput.getCiphertext());
        assertNotNull(encryptedOutput.getGcmTag());

        // Decrypt
        byte[] decryptedContent = aesEncryptionService.decrypt(
            encryptedOutput.getCiphertext(),
            passphrase,
            encryptedOutput.getSalt(),
            encryptedOutput.getGcmTag(),
            encryptedOutput.getIv()
        );

        // Verify
        assertEquals(testContent, new String(decryptedContent));
    }

    @Test
    public void testPassphraseValidation() {
        // Test short passphrase
        assertThrows(IllegalArgumentException.class, () -> {
            aesEncryptionService.validatePassphrase("short");
        });

        // Test null passphrase
        assertThrows(IllegalArgumentException.class, () -> {
            aesEncryptionService.validatePassphrase(null);
        });

        // Test valid passphrase
        assertDoesNotThrow(() -> {
            aesEncryptionService.validatePassphrase("ValidPassphrase123!");
        });
    }

    @Test
    public void testWrongPassphraseDecryption() throws Exception {
        String correctPassphrase = "CorrectPassphrase123!";
        String wrongPassphrase = "WrongPassphrase123!";
        String testContent = "Sensitive data that should not be decrypted with wrong passphrase.";
        byte[] fileContent = testContent.getBytes();

        // Encrypt with correct passphrase
        EncryptedOutput encryptedOutput = aesEncryptionService.encrypt(fileContent, correctPassphrase);

        // Attempt to decrypt with wrong passphrase
        assertThrows(Exception.class, () -> {
            aesEncryptionService.decrypt(
                encryptedOutput.getCiphertext(),
                wrongPassphrase,
                encryptedOutput.getSalt(),
                encryptedOutput.getGcmTag(),
                encryptedOutput.getIv()
            );
        });
    }

    @Test
    public void testIvRandomization() throws Exception {
        String passphrase = "RandomIVTestPassphrase!";
        String testContent = "Test content";
        byte[] fileContent = testContent.getBytes();

        // Encrypt twice
        EncryptedOutput output1 = aesEncryptionService.encrypt(fileContent, passphrase);
        EncryptedOutput output2 = aesEncryptionService.encrypt(fileContent, passphrase);

        // IVs should be different
        assertNotEquals(bytesToHex(output1.getIv()), bytesToHex(output2.getIv()));

        // Ciphertexts should be different
        assertNotEquals(bytesToHex(output1.getCiphertext()), bytesToHex(output2.getCiphertext()));
    }

    @Test
    public void testLargeFileEncryption() throws Exception {
        String passphrase = "LargeFilPassphrase123!";
        byte[] largeContent = new byte[10 * 1024 * 1024]; // 10 MB
        
        // Fill with random data
        for (int i = 0; i < largeContent.length; i++) {
            largeContent[i] = (byte) (i % 256);
        }

        // Encrypt large file
        EncryptedOutput encryptedOutput = aesEncryptionService.encrypt(largeContent, passphrase);

        assertNotNull(encryptedOutput);
        assertTrue(encryptedOutput.getCiphertext().length >= largeContent.length);

        // Decrypt and verify
        byte[] decryptedContent = aesEncryptionService.decrypt(
            encryptedOutput.getCiphertext(),
            passphrase,
            encryptedOutput.getSalt(),
            encryptedOutput.getGcmTag(),
            encryptedOutput.getIv()
        );

        assertEquals(largeContent.length, decryptedContent.length);
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
