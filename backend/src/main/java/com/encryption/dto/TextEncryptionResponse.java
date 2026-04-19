package com.encryption.dto;

public class TextEncryptionResponse {
    private String encryptedTextBase64;
    private String message;
    private long timestamp;

    public TextEncryptionResponse() {}

    public TextEncryptionResponse(String encryptedTextBase64, String message, long timestamp) {
        this.encryptedTextBase64 = encryptedTextBase64;
        this.message = message;
        this.timestamp = timestamp;
    }

    public String getEncryptedTextBase64() {
        return encryptedTextBase64;
    }

    public void setEncryptedTextBase64(String encryptedTextBase64) {
        this.encryptedTextBase64 = encryptedTextBase64;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
