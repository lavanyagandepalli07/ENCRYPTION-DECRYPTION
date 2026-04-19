package com.encryption.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

public class DecryptionRequest {
    
    @NotNull(message = "Passphrase is required")
    @JsonProperty("passphrase")
    private String passphrase;

    public DecryptionRequest() {}

    public DecryptionRequest(String passphrase) {
        this.passphrase = passphrase;
    }

    public String getPassphrase() {
        return passphrase;
    }

    public void setPassphrase(String passphrase) {
        this.passphrase = passphrase;
    }
}
