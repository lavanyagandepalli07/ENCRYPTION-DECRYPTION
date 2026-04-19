package com.encryption.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class SupabaseClient {

    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.serviceRoleKey}")
    private String serviceRoleKey;

    @Value("${supabase.anonKey}")
    private String anonKey;

    public SupabaseClient() {
        this.httpClient = new OkHttpClient();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Uploads encrypted file to Supabase Storage bucket
     */
    public void uploadFile(String bucketName, String filePath, byte[] fileContent) throws IOException {
        String url = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filePath;

        RequestBody body = RequestBody.create(fileContent, MediaType.parse("application/octet-stream"));

        Request request = new Request.Builder()
            .url(url)
            .header("Authorization", "Bearer " + serviceRoleKey)
            .header("apikey", anonKey)
            .header("Content-Type", "application/octet-stream")
            .post(body)
            .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Failed to upload file: " + response.body().string());
            }
        }
    }

    /**
     * Downloads encrypted file from Supabase Storage bucket
     */
    public byte[] downloadFile(String bucketName, String filePath) throws IOException {
        String url = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filePath;

        Request request = new Request.Builder()
            .url(url)
            .header("Authorization", "Bearer " + serviceRoleKey)
            .header("apikey", anonKey)
            .get()
            .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Failed to download file: " + response.message());
            }
            return response.body().bytes();
        }
    }

    /**
     * Deletes file from Supabase Storage bucket
     */
    public void deleteFile(String bucketName, String filePath) throws IOException {
        String url = supabaseUrl + "/storage/v1/object/" + bucketName + "/" + filePath;

        Request request = new Request.Builder()
            .url(url)
            .header("Authorization", "Bearer " + serviceRoleKey)
            .header("apikey", anonKey)
            .delete()
            .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Failed to delete file: " + response.message());
            }
        }
    }

    /**
     * Inserts a record into Supabase database
     */
    public void insertRecord(String table, Map<String, Object> data) throws IOException {
        String url = supabaseUrl + "/rest/v1/" + table;

        String jsonData = objectMapper.writeValueAsString(data);
        RequestBody body = RequestBody.create(jsonData, MediaType.parse("application/json"));

        Request request = new Request.Builder()
            .url(url)
            .header("Authorization", "Bearer " + serviceRoleKey)
            .header("apikey", anonKey)
            .header("Content-Type", "application/json")
            .header("Prefer", "return=minimal")
            .post(body)
            .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Failed to insert record: " + response.body().string());
            }
        }
    }

    /**
     * Queries records from Supabase database
     */
    public String queryRecords(String table, String filter) throws IOException {
        String url = supabaseUrl + "/rest/v1/" + table;
        if (filter != null && !filter.isEmpty()) {
            url += "?" + filter;
        }

        Request request = new Request.Builder()
            .url(url)
            .header("Authorization", "Bearer " + serviceRoleKey)
            .header("apikey", anonKey)
            .get()
            .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Failed to query records: " + response.message());
            }
            return response.body().string();
        }
    }

    /**
     * Deletes records from Supabase database
     */
    public void deleteRecords(String table, String filter) throws IOException {
        String url = supabaseUrl + "/rest/v1/" + table;
        if (filter != null && !filter.isEmpty()) {
            url += "?" + filter;
        }

        Request request = new Request.Builder()
            .url(url)
            .header("Authorization", "Bearer " + serviceRoleKey)
            .header("apikey", anonKey)
            .delete()
            .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Failed to delete records: " + response.message());
            }
        }
    }
}
