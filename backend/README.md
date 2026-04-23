# Backend - File Encryption & Decryption Service

Spring Boot 3.x REST API backend for file encryption/decryption with Supabase integration.

## Prerequisites

- Java 25+
- Gradle 8.10.2 (or use `./gradlew` wrapper)
- Supabase account and project

## Project Structure

```
src/main/java/com/encryption/
├── config/               # Spring Security & Crypto configuration
├── controller/           # REST API endpoints
├── crypto/               # AES-256-GCM encryption logic
├── dto/                  # Request/Response models
├── exception/            # Exception handling
├── security/             # JWT filter
├── service/              # Business logic (FileService, AuditService)
└── EncryptionDecryptionApplication.java  # Main entry point
```

## Build & Run

### Development

```bash
# Build the project
./gradlew build

# Run the application
./gradlew bootRun

# Run tests
./gradlew test

# Clean build
./gradlew clean
```

### Docker

```bash
# Build Docker image
docker build -t encryption-backend:latest .

# Run container
docker run -p 8080:8080 --env-file .env encryption-backend:latest
```

## Configuration

Set environment variables in `.env`:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

## API Endpoints

### Health Check
```
GET /api/health
```

### Encrypt File
```
POST /api/encrypt
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

Parameters:
  - file: <binary file>
  - passphrase: <string, min 8 chars>

Response: { fileId, fileName, fileSizeBytes, message, timestamp }
```

### Decrypt File
```
POST /api/decrypt/{fileId}
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Body: { "passphrase": "<string>" }

Response: <binary decrypted file>
```

### Audit Logs
```
GET /api/audit-logs
Authorization: Bearer <JWT_TOKEN>

Response: [ { id, user_id, action, file_name, file_size_bytes, created_at }, ... ]
```

## Key Components

### AesEncryptionService
- AES-256-GCM encryption with PBKDF2-SHA256 key derivation
- Random IV generation per encryption
- GCM authentication tag validation
- Supports files up to 5GB

### FileService
- Handles file upload/download with Supabase Storage
- File ownership validation
- Multipart file streaming support

### AuditService
- Async logging of encryption/decryption operations
- RLS policy integration with Supabase

### FileController
- REST endpoints for encryption/decryption/audit logs
- Input validation and error handling
- JWT authentication via JwtFilter

### SecurityConfig
- Spring Security with stateless JWT authentication
- CORS configuration
- CSRF protection disabled for API

## Testing

```bash
# Run all tests
./gradlew test

# Run specific test class
./gradlew test --tests AesEncryptionServiceTest

# Run with coverage
./gradlew test jacocoTestReport
```

## Troubleshooting

### Port Already in Use
Change the port in `application.yml`:
```yaml
server:
  port: 8081
```

### JWT Validation Failed
- Verify `SUPABASE_JWT_SECRET` is correctly set
- Check JWT token expiry
- Ensure Authorization header format: `Bearer <token>`

### File Upload Size Exceeded
Update in `application.yml`:
```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10GB
      max-request-size: 10GB
```

## Dependencies

- Spring Boot 3.2.0
- Spring Security
- Bouncy Castle (cryptography)
- JJWT (JWT parsing)
- OkHttp 4.11.0 (HTTP client)
- Jackson (JSON processing)

## Security Considerations

✓ **Implemented:**
- AES-256-GCM authenticated encryption
- PBKDF2-SHA256 key derivation (100k iterations)
- Random IV per encryption
- JWT authentication via Supabase
- CORS policy enforcement
- Secure file ownership validation

⚠️ **TODO:**
- Rate limiting on endpoints
- File size validation
- Passphrase complexity validation
- Request signing/verification
- Log monitoring and alerting

## Future Enhancements

- [ ] Text encryption/decryption endpoints
- [ ] File signing and signature verification
- [ ] Additional algorithms (RSA, ECC, Twofish)
- [ ] Batch file encryption
- [ ] Scheduled encryption tasks
- [ ] API key management

## License

MIT License - See LICENSE file in project root
