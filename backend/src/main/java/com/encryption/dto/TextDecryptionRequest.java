package com.encryption.dto;

public class TextDecryptionRequest {
    private String encryptedTextBase64;
    private String passphrase;

    public TextDecryptionRequest() {}

    public TextDecryptionRequest(String encryptedTextBase64, String passphrase) {
        this.encryptedTextBase64 = encryptedTextBase64;
        this.passphrase = passphrase;
    }

    public String getEncryptedTextBase64() {
        return encryptedTextBase64;
    }

    public void setEncryptedTextBase64(String encryptedTextBase64) {
        this.encryptedTextBase64 = encryptedTextBase64;
    }

    public String getPassphrase() {
        return passphrase;
    }

    public void setPassphrase(String passphrase) {
        this.passphrase = passphrase;
    }
}
