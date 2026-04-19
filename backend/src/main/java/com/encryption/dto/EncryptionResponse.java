package com.encryption.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class EncryptionResponse {
    
    @JsonProperty("fileId")
    private String fileId;
    
    @JsonProperty("fileName")
    private String fileName;
    
    @JsonProperty("fileSizeBytes")
    private long fileSizeBytes;
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("timestamp")
    private long timestamp;

    public EncryptionResponse() {}

    public EncryptionResponse(String fileId, String fileName, long fileSizeBytes, String message, long timestamp) {
        this.fileId = fileId;
        this.fileName = fileName;
        this.fileSizeBytes = fileSizeBytes;
        this.message = message;
        this.timestamp = timestamp;
    }

    public String getFileId() {
        return fileId;
    }

    public void setFileId(String fileId) {
        this.fileId = fileId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public long getFileSizeBytes() {
        return fileSizeBytes;
    }

    public void setFileSizeBytes(long fileSizeBytes) {
        this.fileSizeBytes = fileSizeBytes;
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
