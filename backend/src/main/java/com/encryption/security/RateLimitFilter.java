package com.encryption.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Per-IP sliding-window rate limiter applied before JWT authentication.
 *
 * <p>Default limits (configurable via application.yml):
 * <ul>
 *   <li>100 requests per minute on the general API</li>
 *   <li>20 requests per minute on the crypto endpoints (encrypt / decrypt / sign)</li>
 * </ul>
 *
 * <p>When the limit is exceeded the filter responds immediately with HTTP 429
 * and sets a Retry-After header so clients know when to retry.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    /** General limit: max requests per IP per window. */
    @Value("${rate.limit.general.maxRequests:100}")
    private int generalMaxRequests;

    /** Crypto limit: max requests per IP per window on sensitive endpoints. */
    @Value("${rate.limit.crypto.maxRequests:20}")
    private int cryptoMaxRequests;

    /** Window duration in seconds (default: 60 seconds). */
    @Value("${rate.limit.windowSeconds:60}")
    private long windowSeconds;

    // ─── State ────────────────────────────────────────────────────────────────

    /** Holds (requestCount, windowStartEpochSecond) per IP for general endpoints. */
    private final Map<String, RateWindow> generalBucket  = new ConcurrentHashMap<>();

    /** Holds (requestCount, windowStartEpochSecond) per IP for crypto endpoints. */
    private final Map<String, RateWindow> cryptoBucket   = new ConcurrentHashMap<>();

    // ─── Crypto endpoint prefixes that get a tighter limit ───────────────────
    private static final String[] CRYPTO_PREFIXES = {
        "/api/encrypt", "/api/decrypt", "/api/text/encrypt", "/api/text/decrypt",
        "/api/signature/sign", "/api/signature/verify"
    };

    // ─── Filter logic ─────────────────────────────────────────────────────────

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Health-check and OPTIONS requests are always allowed without rate limiting
        if ("/api/health".equals(request.getRequestURI()) || "OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = extractClientIp(request);
        String path     = request.getRequestURI();
        boolean isCrypto = isCryptoEndpoint(path);

        Map<String, RateWindow> bucket  = isCrypto ? cryptoBucket  : generalBucket;
        int                     maxReqs = isCrypto ? cryptoMaxRequests : generalMaxRequests;

        long nowEpoch = Instant.now().getEpochSecond();
        RateWindow window = bucket.compute(clientIp, (ip, existing) -> {
            if (existing == null || nowEpoch - existing.windowStart >= windowSeconds) {
                return new RateWindow(nowEpoch, 1);
            }
            existing.count.incrementAndGet();
            return existing;
        });

        if (window.count.get() > maxReqs) {
            long retryAfter = windowSeconds - (nowEpoch - window.windowStart);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.setHeader("Retry-After", String.valueOf(Math.max(1, retryAfter)));
            response.getWriter().write(
                    "{\"error\":\"Too many requests. Please retry after " + retryAfter + " seconds.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Extracts the real client IP, honouring the X-Forwarded-For header set by
     * reverse proxies / load-balancers.
     */
    private String extractClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            // X-Forwarded-For can be a comma-separated list; take the first entry
            return forwarded.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }

    /** Returns true if {@code path} is a crypto-sensitive endpoint. */
    private boolean isCryptoEndpoint(String path) {
        for (String prefix : CRYPTO_PREFIXES) {
            if (path.startsWith(prefix)) return true;
        }
        return false;
    }

    // ─── Inner types ──────────────────────────────────────────────────────────

    /** Mutable sliding-window counter. */
    private static class RateWindow {
        final long         windowStart;
        final AtomicInteger count;

        RateWindow(long windowStart, int initialCount) {
            this.windowStart = windowStart;
            this.count = new AtomicInteger(initialCount);
        }
    }
}
