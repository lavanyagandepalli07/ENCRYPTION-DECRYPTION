package com.encryption.controller;

import com.encryption.dto.TextDecryptionRequest;
import com.encryption.dto.TextEncryptionRequest;
import com.encryption.service.AuditService;
import com.encryption.service.TextService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class TextControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TextService textService;

    @MockBean
    private AuditService auditService;

    @Autowired
    private ObjectMapper objectMapper;

    private static final String TEST_USER = "test-user-id";

    @BeforeEach
    void setUp() {
        reset(textService, auditService);
    }

    @Test
    @WithMockUser(username = TEST_USER)
    void encryptText_Success() throws Exception {
        TextEncryptionRequest request = new TextEncryptionRequest();
        request.setText("Hello World");
        request.setPassphrase("securepass");

        String encryptedBase64 = "encrypted-base64-data";
        when(textService.encryptText(anyString(), anyString())).thenReturn(encryptedBase64);

        mockMvc.perform(post("/api/text/encrypt")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.encryptedTextBase64").value(encryptedBase64))
                .andExpect(jsonPath("$.message").value("Text encrypted successfully"));

        verify(auditService).logActionAsync(eq(TEST_USER), eq("TEXT_ENCRYPT"), eq("TEXT_DATA"), anyLong());
    }

    @Test
    @WithMockUser(username = TEST_USER)
    void decryptText_Success() throws Exception {
        TextDecryptionRequest request = new TextDecryptionRequest();
        request.setEncryptedTextBase64("encrypted-base64-data");
        request.setPassphrase("securepass");

        String decryptedText = "Hello World";
        when(textService.decryptText(anyString(), anyString())).thenReturn(decryptedText);

        mockMvc.perform(post("/api/text/decrypt")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.decryptedText").value(decryptedText))
                .andExpect(jsonPath("$.message").value("Text decrypted successfully"));

        verify(auditService).logActionAsync(eq(TEST_USER), eq("TEXT_DECRYPT"), eq("TEXT_DATA"), anyLong());
    }

    @Test
    @WithMockUser(username = TEST_USER)
    void encryptText_EmptyText_BadRequest() throws Exception {
        TextEncryptionRequest request = new TextEncryptionRequest();
        request.setText("");
        request.setPassphrase("securepass");

        mockMvc.perform(post("/api/text/encrypt")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Text is required"));
    }

    @Test
    @WithMockUser(username = TEST_USER)
    void decryptText_InvalidPassphrase_BadRequest() throws Exception {
        TextDecryptionRequest request = new TextDecryptionRequest();
        request.setEncryptedTextBase64("data");
        request.setPassphrase("wrong");

        when(textService.decryptText(anyString(), anyString())).thenThrow(new IllegalArgumentException("Invalid passphrase"));

        mockMvc.perform(post("/api/text/decrypt")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid passphrase or corrupted data"));
    }
}
