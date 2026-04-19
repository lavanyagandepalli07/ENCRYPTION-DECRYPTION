package com.encryption.controller;

import com.encryption.dto.AuditLogDTO;
import com.encryption.dto.DecryptionRequest;
import com.encryption.dto.EncryptionResponse;
import com.encryption.service.AuditService;
import com.encryption.service.FileService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "${cors.allowed-origins}", maxAge = 3600)
public class FileController {

    private final FileService fileService;
    private final AuditService auditService;

    public FileController(FileService fileService, AuditService auditService) {
        this.fileService = fileService;
        this.auditService = auditService;
    }

    /**
     * Health check endpoint (no authentication required)
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("{\"status\": \"UP\", \"service\": \"File Encryption Service\"}");
    }

    /**
     * Encrypts and uploads a file
     * POST /api/encrypt
     */
    @PostMapping("/encrypt")
    public ResponseEntity<?> encryptFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("passphrase") String passphrase,
            Authentication authentication) {
        try {
            String userId = authentication.getName();
            String fileName = file.getOriginalFilename();
            byte[] fileContent = file.getBytes();

            // Validate input
            if (passphrase == null || passphrase.length() < 8) {
                return ResponseEntity.badRequest()
                    .body("{\"error\": \"Passphrase must be at least 8 characters long\"}");
            }

            // Encrypt and upload
            String fileId = fileService.encryptAndUploadFile(fileContent, fileName, passphrase, userId);

            // Log the operation
            auditService.logEncryption(userId, fileName, fileContent.length);

            // Return response
            EncryptionResponse response = new EncryptionResponse(
                fileId,
                fileName,
                fileContent.length,
                "File encrypted successfully",
                System.currentTimeMillis()
            );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body("{\"error\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"Encryption failed: " + e.getMessage() + "\"}");
        }
    }

    /**
     * Decrypts and downloads a file
     * POST /api/decrypt/{fileId}
     */
    @PostMapping("/decrypt/{fileId}")
    public ResponseEntity<?> decryptFile(
            @PathVariable String fileId,
            @RequestBody DecryptionRequest request,
            Authentication authentication) {
        try {
            String userId = authentication.getName();

            // Validate input
            if (request.getPassphrase() == null || request.getPassphrase().length() < 8) {
                return ResponseEntity.badRequest()
                    .body("{\"error\": \"Passphrase must be at least 8 characters long\"}");
            }

            // Validate file ownership
            if (!fileService.validateFileOwnership(fileId, userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("{\"error\": \"Access denied: You do not own this file\"}");
            }

            // Download and decrypt
            byte[] decryptedContent = fileService.downloadAndDecryptFile(fileId, request.getPassphrase(), userId);

            // Log the operation
            auditService.logDecryption(userId, fileId, decryptedContent.length);

            // Return decrypted file
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"decrypted_file\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(decryptedContent);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body("{\"error\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"Decryption failed: " + e.getMessage() + "\"}");
        }
    }

    /**
     * Retrieves audit logs for the authenticated user
     * GET /api/audit-logs
     */
    @GetMapping("/audit-logs")
    public ResponseEntity<?> getAuditLogs(Authentication authentication) {
        try {
            String userId = authentication.getName();
            List<AuditLogDTO> auditLogs = auditService.getAuditLogs(userId);

            return ResponseEntity.ok(auditLogs);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("{\"error\": \"Failed to retrieve audit logs: " + e.getMessage() + "\"}");
        }
    }
}
