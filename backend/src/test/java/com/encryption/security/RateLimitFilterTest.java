package com.encryption.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import jakarta.servlet.ServletException;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("RateLimitFilter Tests")
public class RateLimitFilterTest {

    private RateLimitFilter rateLimitFilter;

    @BeforeEach
    public void setUp() {
        rateLimitFilter = new RateLimitFilter();
        // Use very small limits for unit-testing speed
        ReflectionTestUtils.setField(rateLimitFilter, "generalMaxRequests", 5);
        ReflectionTestUtils.setField(rateLimitFilter, "cryptoMaxRequests", 3);
        ReflectionTestUtils.setField(rateLimitFilter, "windowSeconds", 60L);
    }

    // ─── Health check bypass ──────────────────────────────────────────────────

    @Test
    @DisplayName("Health-check endpoint is never rate-limited")
    public void testHealthEndpoint_neverRateLimited() throws ServletException, IOException {
        for (int i = 0; i < 200; i++) {
            MockHttpServletRequest  req  = request("/api/health", "10.0.0.1");
            MockHttpServletResponse resp = new MockHttpServletResponse();
            MockFilterChain         chain = new MockFilterChain();

            rateLimitFilter.doFilterInternal(req, resp, chain);

            assertNotEquals(HttpStatus.TOO_MANY_REQUESTS.value(), resp.getStatus(),
                    "Health endpoint should never return 429 (iteration " + i + ")");
        }
    }

    // ─── General endpoint rate limit ──────────────────────────────────────────

    @Test
    @DisplayName("General endpoint — allows requests up to the limit")
    public void testGeneralEndpoint_allowsUpToLimit() throws ServletException, IOException {
        String ip = "192.168.1.10";

        for (int i = 0; i < 5; i++) {
            MockHttpServletResponse resp = doRequest("/api/audit-logs", ip);
            assertNotEquals(429, resp.getStatus(),
                    "Request #" + (i + 1) + " should be allowed");
        }
    }

    @Test
    @DisplayName("General endpoint — blocks after limit is exceeded")
    public void testGeneralEndpoint_blocksAfterLimit() throws ServletException, IOException {
        String ip = "192.168.1.20";

        // Exhaust the 5-request limit
        for (int i = 0; i < 5; i++) {
            doRequest("/api/audit-logs", ip);
        }

        // The 6th request must be rate-limited
        MockHttpServletResponse resp = doRequest("/api/audit-logs", ip);
        assertEquals(429, resp.getStatus(), "6th request should return 429");
    }

    @Test
    @DisplayName("General endpoint — 429 response contains Retry-After header")
    public void testGeneralEndpoint_429ContainsRetryAfter() throws ServletException, IOException {
        String ip = "192.168.1.30";
        for (int i = 0; i <= 5; i++) doRequest("/api/audit-logs", ip); // exhaust + one over

        MockHttpServletResponse resp = doRequest("/api/audit-logs", ip);
        assertEquals(429, resp.getStatus());
        assertNotNull(resp.getHeader("Retry-After"), "Retry-After header must be present");
    }

    @Test
    @DisplayName("General endpoint — 429 response body contains error message")
    public void testGeneralEndpoint_429BodyHasError() throws ServletException, IOException {
        String ip = "192.168.1.40";
        for (int i = 0; i <= 5; i++) doRequest("/api/audit-logs", ip);

        MockHttpServletResponse resp = doRequest("/api/audit-logs", ip);
        assertEquals(429, resp.getStatus());
        String body = resp.getContentAsString();
        assertTrue(body.contains("\"error\""), "Response body should have an error field");
        assertTrue(body.contains("Too many requests"), "Response body should explain the issue");
    }

    @Test
    @DisplayName("General endpoint — different IPs have independent limits")
    public void testGeneralEndpoint_differentIpsAreIndependent() throws ServletException, IOException {
        String ip1 = "10.0.0.1";
        String ip2 = "10.0.0.2";

        // Exhaust ip1's limit
        for (int i = 0; i <= 5; i++) doRequest("/api/audit-logs", ip1);
        MockHttpServletResponse ip1Resp = doRequest("/api/audit-logs", ip1);
        assertEquals(429, ip1Resp.getStatus(), "ip1 should be rate-limited");

        // ip2 should still be allowed (fresh window)
        MockHttpServletResponse ip2Resp = doRequest("/api/audit-logs", ip2);
        assertNotEquals(429, ip2Resp.getStatus(), "ip2 should NOT be rate-limited");
    }

    // ─── Crypto endpoint rate limit ───────────────────────────────────────────

    @Test
    @DisplayName("Crypto endpoint — allows requests up to the tighter limit")
    public void testCryptoEndpoint_allowsUpToLimit() throws ServletException, IOException {
        String ip = "172.16.0.1";

        for (int i = 0; i < 3; i++) {
            MockHttpServletResponse resp = doRequest("/api/encrypt", ip);
            assertNotEquals(429, resp.getStatus(),
                    "Crypto request #" + (i + 1) + " should be allowed");
        }
    }

    @Test
    @DisplayName("Crypto endpoint — blocks after tighter limit")
    public void testCryptoEndpoint_blocksAfterTighterLimit() throws ServletException, IOException {
        String ip = "172.16.0.2";

        for (int i = 0; i < 3; i++) doRequest("/api/encrypt", ip);

        MockHttpServletResponse resp = doRequest("/api/encrypt", ip);
        assertEquals(429, resp.getStatus(), "4th crypto request should be blocked");
    }

    @Test
    @DisplayName("Crypto endpoint — /api/signature/sign respects crypto limit")
    public void testCryptoEndpoint_signatureSignRespectsCryptoLimit() throws ServletException, IOException {
        String ip = "172.16.0.3";

        for (int i = 0; i < 3; i++) doRequest("/api/signature/sign", ip);

        MockHttpServletResponse resp = doRequest("/api/signature/sign", ip);
        assertEquals(429, resp.getStatus(), "/api/signature/sign should use crypto bucket");
    }

    // ─── X-Forwarded-For support ──────────────────────────────────────────────

    @Test
    @DisplayName("Rate limit honours X-Forwarded-For header for real-IP detection")
    public void testRateLimit_honoursXForwardedFor() throws ServletException, IOException {
        String realIp = "203.0.113.45";

        // Exhaust limit using X-Forwarded-For
        for (int i = 0; i <= 5; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/audit-logs");
            req.addHeader("X-Forwarded-For", realIp + ", 10.0.0.1");
            req.setRemoteAddr("10.0.0.1"); // proxy IP
            MockHttpServletResponse  resp  = new MockHttpServletResponse();
            rateLimitFilter.doFilterInternal(req, resp, new MockFilterChain());
        }

        MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/audit-logs");
        req.addHeader("X-Forwarded-For", realIp + ", 10.0.0.1");
        req.setRemoteAddr("10.0.0.1");
        MockHttpServletResponse resp = new MockHttpServletResponse();
        rateLimitFilter.doFilterInternal(req, resp, new MockFilterChain());

        assertEquals(429, resp.getStatus(), "Real IP from X-Forwarded-For should be rate-limited");
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private MockHttpServletResponse doRequest(String path, String ip)
            throws ServletException, IOException {
        MockHttpServletRequest  req   = request(path, ip);
        MockHttpServletResponse resp  = new MockHttpServletResponse();
        MockFilterChain         chain = new MockFilterChain();
        rateLimitFilter.doFilterInternal(req, resp, chain);
        return resp;
    }

    private MockHttpServletRequest request(String path, String ip) {
        MockHttpServletRequest req = new MockHttpServletRequest("GET", path);
        req.setRemoteAddr(ip);
        return req;
    }
}
