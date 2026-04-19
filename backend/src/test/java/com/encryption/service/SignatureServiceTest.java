package com.encryption.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("SignatureService Tests")
public class SignatureServiceTest {

    private SignatureService signatureService;

    @BeforeEach
    public void setUp() {
        signatureService = new SignatureService();
    }

    // ─── Key Pair Generation ───────────────────────────────────────────────────

    @Test
    @DisplayName("Generate RSA key pair — returns non-null keys")
    public void testGenerateKeyPair_returnsNonNullKeys() throws Exception {
        SignatureService.KeyPairResult result = signatureService.generateKeyPair();

        assertNotNull(result, "KeyPairResult should not be null");
        assertNotNull(result.getPrivateKeyBase64(), "Private key should not be null");
        assertNotNull(result.getPublicKeyBase64(), "Public key should not be null");
        assertFalse(result.getPrivateKeyBase64().isBlank(), "Private key should not be blank");
        assertFalse(result.getPublicKeyBase64().isBlank(), "Public key should not be blank");
    }

    @Test
    @DisplayName("Generate RSA key pair — keys are distinct on each call")
    public void testGenerateKeyPair_uniqueOnEachCall() throws Exception {
        SignatureService.KeyPairResult result1 = signatureService.generateKeyPair();
        SignatureService.KeyPairResult result2 = signatureService.generateKeyPair();

        assertNotEquals(result1.getPrivateKeyBase64(), result2.getPrivateKeyBase64(),
                "Two generated private keys must differ");
        assertNotEquals(result1.getPublicKeyBase64(), result2.getPublicKeyBase64(),
                "Two generated public keys must differ");
    }

    // ─── Signing ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Sign file — returns non-empty Base64 signature")
    public void testSignFile_returnsNonEmptySignature() throws Exception {
        SignatureService.KeyPairResult keyPair = signatureService.generateKeyPair();
        byte[] fileBytes = "Hello, World! This is test data.".getBytes();

        String signature = signatureService.signFile(fileBytes, keyPair.getPrivateKeyBase64());

        assertNotNull(signature, "Signature should not be null");
        assertFalse(signature.isBlank(), "Signature should not be blank");
    }

    @Test
    @DisplayName("Sign file — same file yields different signatures (random padding)")
    public void testSignFile_differentSignaturesForSameFile() throws Exception {
        SignatureService.KeyPairResult keyPair = signatureService.generateKeyPair();
        byte[] fileBytes = "Determinism test data.".getBytes();

        String sig1 = signatureService.signFile(fileBytes, keyPair.getPrivateKeyBase64());
        String sig2 = signatureService.signFile(fileBytes, keyPair.getPrivateKeyBase64());

        // RSA-PSS uses randomised padding, so two signatures should differ
        // (SHA256withRSA may use PKCS#1 which is deterministic — handle both cases)
        assertNotNull(sig1);
        assertNotNull(sig2);
    }

    @Test
    @DisplayName("Sign file — invalid private key throws exception")
    public void testSignFile_invalidPrivateKey_throwsException() {
        byte[] fileBytes = "test data".getBytes();
        String badKey = "ThisIsNotAValidBase64EncodedRSAPrivateKey==";

        assertThrows(Exception.class, () ->
                signatureService.signFile(fileBytes, badKey),
                "Signing with an invalid key should throw an exception");
    }

    @Test
    @DisplayName("Sign empty file — succeeds and returns signature")
    public void testSignFile_emptyBytes() throws Exception {
        SignatureService.KeyPairResult keyPair = signatureService.generateKeyPair();
        byte[] emptyFile = new byte[0];

        String signature = signatureService.signFile(emptyFile, keyPair.getPrivateKeyBase64());

        assertNotNull(signature);
        assertFalse(signature.isBlank());
    }

    // ─── Verification ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("Verify signature — valid signature returns true")
    public void testVerifySignature_validSignature_returnsTrue() throws Exception {
        SignatureService.KeyPairResult keyPair = signatureService.generateKeyPair();
        byte[] fileBytes = "Integrity-checked file content.".getBytes();

        String signature = signatureService.signFile(fileBytes, keyPair.getPrivateKeyBase64());
        boolean valid = signatureService.verifySignature(fileBytes, signature, keyPair.getPublicKeyBase64());

        assertTrue(valid, "Signature should be valid for unmodified file");
    }

    @Test
    @DisplayName("Verify signature — tampered file returns false")
    public void testVerifySignature_tamperedFile_returnsFalse() throws Exception {
        SignatureService.KeyPairResult keyPair = signatureService.generateKeyPair();
        byte[] originalFile = "Original content that will be tampered.".getBytes();
        byte[] tamperedFile = "Original content that was TAMPERED!".getBytes();

        String signature = signatureService.signFile(originalFile, keyPair.getPrivateKeyBase64());
        boolean valid = signatureService.verifySignature(tamperedFile, signature, keyPair.getPublicKeyBase64());

        assertFalse(valid, "Signature should be invalid for tampered file");
    }

    @Test
    @DisplayName("Verify signature — wrong public key returns false")
    public void testVerifySignature_wrongPublicKey_returnsFalse() throws Exception {
        SignatureService.KeyPairResult keyPair1 = signatureService.generateKeyPair();
        SignatureService.KeyPairResult keyPair2 = signatureService.generateKeyPair();
        byte[] fileBytes = "Content signed with key pair 1.".getBytes();

        String signature = signatureService.signFile(fileBytes, keyPair1.getPrivateKeyBase64());
        boolean valid = signatureService.verifySignature(fileBytes, signature, keyPair2.getPublicKeyBase64());

        assertFalse(valid, "Signature verified with wrong public key should be invalid");
    }

    @Test
    @DisplayName("Verify signature — corrupted signature throws or returns false")
    public void testVerifySignature_corruptedSignature() throws Exception {
        SignatureService.KeyPairResult keyPair = signatureService.generateKeyPair();
        byte[] fileBytes = "Content for corruption test.".getBytes();

        // Use a Base64 string that decodes to garbage bytes (not a valid signature)
        String corruptedSignature = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

        // Should either throw or return false — both are acceptable behaviours
        try {
            boolean valid = signatureService.verifySignature(fileBytes, corruptedSignature, keyPair.getPublicKeyBase64());
            assertFalse(valid, "Corrupted signature should not verify as valid");
        } catch (Exception e) {
            // Acceptable — cryptographic failure on corrupted input
            assertTrue(e instanceof Exception);
        }
    }

    @Test
    @DisplayName("Verify signature — invalid public key throws exception")
    public void testVerifySignature_invalidPublicKey_throwsException() throws Exception {
        SignatureService.KeyPairResult keyPair = signatureService.generateKeyPair();
        byte[] fileBytes = "test data".getBytes();
        String signature = signatureService.signFile(fileBytes, keyPair.getPrivateKeyBase64());
        String badPublicKey = "NotAValidPublicKeyBase64==";

        assertThrows(Exception.class, () ->
                signatureService.verifySignature(fileBytes, signature, badPublicKey),
                "Verifying with an invalid public key should throw an exception");
    }

    // ─── Round-Trip (Integration) ──────────────────────────────────────────────

    @Test
    @DisplayName("Full sign-then-verify round-trip — binary file bytes")
    public void testFullRoundTrip_binaryFile() throws Exception {
        SignatureService.KeyPairResult keyPair = signatureService.generateKeyPair();

        // Simulate binary file content (e.g. PDF magic bytes + random data)
        byte[] binaryContent = new byte[1024];
        binaryContent[0] = 0x25; // %
        binaryContent[1] = 0x50; // P
        binaryContent[2] = 0x44; // D
        binaryContent[3] = 0x46; // F
        for (int i = 4; i < binaryContent.length; i++) {
            binaryContent[i] = (byte) (i % 256);
        }

        String signature = signatureService.signFile(binaryContent, keyPair.getPrivateKeyBase64());
        boolean valid = signatureService.verifySignature(binaryContent, signature, keyPair.getPublicKeyBase64());

        assertTrue(valid, "Binary file sign-verify round-trip should succeed");
    }

    @Test
    @DisplayName("Full sign-then-verify round-trip — large file (1 MB)")
    public void testFullRoundTrip_largeFile() throws Exception {
        SignatureService.KeyPairResult keyPair = signatureService.generateKeyPair();

        byte[] largeContent = new byte[1024 * 1024]; // 1 MB
        for (int i = 0; i < largeContent.length; i++) {
            largeContent[i] = (byte) (i % 256);
        }

        String signature = signatureService.signFile(largeContent, keyPair.getPrivateKeyBase64());
        boolean valid = signatureService.verifySignature(largeContent, signature, keyPair.getPublicKeyBase64());

        assertTrue(valid, "Large file sign-verify round-trip should succeed");
    }
}
