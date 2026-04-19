package com.encryption.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

public class EncryptionRequest {
    
    @NotNull(message = "File content is required")
    @JsonProperty("file")
    private byte[] fileContent;
    
    @NotNull(message = "Passphrase is required")
    @JsonProperty("passphrase")
    private String passphrase;
    
    @JsonProperty("fileName")
    private String fileName;

    public EncryptionRequest() {}

    public EncryptionRequest(byte[] fileContent, String passphrase, String fileName) {
        this.fileContent = fileContent;
        this.passphrase = passphrase;
        this.fileName = fileName;
    }

    public byte[] getFileContent() {
        return fileContent;
    }

    public void setFileContent(byte[] fileContent) {
        this.fileContent = fileContent;
    }

    public String getPassphrase() {
        return passphrase;
    }

    public void setPassphrase(String passphrase) {
        this.passphrase = passphrase;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
}
