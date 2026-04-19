package com.encryption.dto;

public class TextEncryptionRequest {
    private String text;
    private String passphrase;

    public TextEncryptionRequest() {}

    public TextEncryptionRequest(String text, String passphrase) {
        this.text = text;
        this.passphrase = passphrase;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getPassphrase() {
        return passphrase;
    }

    public void setPassphrase(String passphrase) {
        this.passphrase = passphrase;
    }
}
