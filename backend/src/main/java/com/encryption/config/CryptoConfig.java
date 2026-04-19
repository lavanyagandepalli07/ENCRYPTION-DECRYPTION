package com.encryption.config;

import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.context.annotation.Configuration;

import java.security.Security;

@Configuration
public class CryptoConfig {

    public CryptoConfig() {
        // Register Bouncy Castle as a security provider
        Security.addProvider(new BouncyCastleProvider());
    }
}
