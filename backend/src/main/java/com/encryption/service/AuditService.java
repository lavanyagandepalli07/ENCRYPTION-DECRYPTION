package com.encryption.service;

import com.encryption.dto.AuditLogDTO;
import com.encryption.util.SupabaseClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.*;

@Service
public class AuditService {

    private final SupabaseClient supabaseClient;
    private final ObjectMapper objectMapper;
    private static final String TABLE_NAME = "audit_logs";

    public AuditService(SupabaseClient supabaseClient) {
        this.supabaseClient = supabaseClient;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Logs encryption operation asynchronously
     */
    @Async
    public void logEncryption(String userId, String fileName, long fileSizeBytes) {
        try {
            AuditLogDTO auditLog = new AuditLogDTO(
                UUID.randomUUID().toString(),
                userId,
                "ENCRYPT",
                fileName,
                fileSizeBytes,
                Instant.now().toString()
            );

            insertAuditLog(auditLog);
        } catch (Exception e) {
            // Log error but don't throw (async operation)
            System.err.println("Failed to log encryption operation: " + e.getMessage());
        }
    }

    /**
     * Logs decryption operation asynchronously
     */
    @Async
    public void logDecryption(String userId, String fileName, long fileSizeBytes) {
        logActionAsync(userId, "DECRYPT", fileName, fileSizeBytes);
    }

    /**
     * Generic asynchronous action logger
     */
    @Async
    public void logActionAsync(String userId, String action, String fileName, long fileSizeBytes) {
        try {
            AuditLogDTO auditLog = new AuditLogDTO(
                UUID.randomUUID().toString(),
                userId,
                action,
                fileName,
                fileSizeBytes,
                Instant.now().toString()
            );

            insertAuditLog(auditLog);
        } catch (Exception e) {
            System.err.println("Failed to log " + action + " operation: " + e.getMessage());
        }
    }

    /**
     * Retrieves audit logs for a user
     */
    public List<AuditLogDTO> getAuditLogs(String userId) throws Exception {
        // Query Supabase using RLS policy (user can only see their own logs)
        String filter = "user_id=eq." + userId + "&order=created_at.desc";
        String response = supabaseClient.queryRecords(TABLE_NAME, filter);

        // Parse JSON response
        List<AuditLogDTO> auditLogs = new ArrayList<>();
        try {
            AuditLogDTO[] logs = objectMapper.readValue(response, AuditLogDTO[].class);
            auditLogs = Arrays.asList(logs);
        } catch (Exception e) {
            System.err.println("Failed to parse audit logs: " + e.getMessage());
        }

        return auditLogs;
    }

    /**
     * Inserts audit log entry into Supabase
     */
    private void insertAuditLog(AuditLogDTO auditLog) throws Exception {
        Map<String, Object> data = new HashMap<>();
        data.put("id", auditLog.getId());
        data.put("user_id", auditLog.getUserId());
        data.put("action", auditLog.getAction());
        data.put("file_name", auditLog.getFileName());
        data.put("file_size_bytes", auditLog.getFileSizeBytes());
        data.put("created_at", auditLog.getCreatedAt());

        supabaseClient.insertRecord(TABLE_NAME, data);
    }
}
