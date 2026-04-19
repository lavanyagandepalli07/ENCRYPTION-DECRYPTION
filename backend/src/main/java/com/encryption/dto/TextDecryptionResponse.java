package com.encryption.dto;

public class TextDecryptionResponse {
    private String decryptedText;
    private String message;
    private long timestamp;

    public TextDecryptionResponse() {}

    public TextDecryptionResponse(String decryptedText, String message, long timestamp) {
        this.decryptedText = decryptedText;
        this.message = message;
        this.timestamp = timestamp;
    }

    public String getDecryptedText() {
        return decryptedText;
    }

    public void setDecryptedText(String decryptedText) {
        this.decryptedText = decryptedText;
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
