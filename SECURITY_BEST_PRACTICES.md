# 🛡️ Security Best Practices Guide

This document outlines the security measures implemented in the File Encryption & Decryption Web App and provides recommendations for maintaining a secure deployment.

## 1. Cryptographic Implementation

### AES-256-GCM
- **Authenticated Encryption**: We use AES in Galois/Counter Mode (GCM), which provides both confidentiality and data integrity (authentication).
- **Initialization Vectors (IV)**: A unique, random 12-byte IV is generated for every encryption operation. **Never reuse an IV with the same key.**
- **Authentication Tag**: A 128-bit authentication tag is appended to the ciphertext to ensure it hasn't been tampered with.

### Key Derivation (PBKDF2)
- **Algorithm**: PBKDF2 with SHA-256.
- **Iterations**: 100,000 iterations are used to make brute-force attacks computationally expensive.
- **Salt**: A random salt should be used (currently implemented as part of the encryption service).

## 2. Authentication & Authorization

### Supabase Auth
- **JWT Validation**: All API requests (except `/api/health`) must include a valid JWT issued by Supabase.
- **Role-Based Access**: Currently, users can only access and decrypt files they have encrypted themselves.

### Password Security
- **Complexity**: Passphrases should be at least 12 characters long, containing a mix of uppercase, lowercase, numbers, and symbols.
- **Passphrase Strength Indicator**: The frontend includes a visual indicator to help users choose strong passphrases.

## 3. Infrastructure Security

### HTTPS/TLS
- **Requirement**: Always use HTTPS in production. This prevents man-in-the-middle attacks and protects JWTs and passphrases in transit.
- **HSTS**: HTTP Strict Transport Security should be enabled to force browsers to use HTTPS.

### Container Security
- **Non-root Users**: Run Docker containers as non-root users whenever possible.
- **Image Scanning**: Regularly scan Docker images for vulnerabilities in base layers.

## 4. Operational Security

### Audit Logs
- All encryption, decryption, and integrity check operations are logged.
- Monitor audit logs for suspicious activity (e.g., multiple failed decryption attempts).

### Rate Limiting
- The backend implements rate limiting on sensitive endpoints (`/api/encrypt`, `/api/decrypt`) to prevent brute-force and DoS attacks.

## 5. Deployment Checklist
- [ ] Change all default secrets and keys in `.env`.
- [ ] Enable HTTPS via a reverse proxy (e.g., Nginx, Traefik).
- [ ] Configure proper CORS origins (avoid `*`).
- [ ] Set up regular backups for the Supabase database.
- [ ] Implement log rotation and monitoring.
