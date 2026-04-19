package com.encryption.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Value("${supabase.jwtSecret}")
    private String jwtSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Skip JWT validation for health check and OPTIONS requests
        if (path.equals("/api/health") || "OPTIONS".equalsIgnoreCase(method)) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);

                // Decode JWT
                byte[] keyBytes;
                try {
                    // Try Base64 decoding first (Supabase default)
                    keyBytes = io.jsonwebtoken.io.Decoders.BASE64.decode(jwtSecret);
                } catch (Exception e) {
                    // Fallback to raw bytes if not valid Base64
                    keyBytes = jwtSecret.getBytes();
                }

                if (keyBytes.length < 32) {
                    logger.warn("JWT Secret is too short for HS256. Verify your SUPABASE_JWT_SECRET in .env");
                }

                Claims claims = Jwts.parser()
                    .verifyWith(Keys.hmacShaKeyFor(keyBytes))
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

                String userId = claims.getSubject();

                // Create authentication
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    userId, null, new ArrayList<>()
                );

                SecurityContextHolder.getContext().setAuthentication(auth);

            } catch (Exception e) {
                logger.error("JWT Validation failed: " + e.getMessage());
                // Let it fall through instead of returning 401 so SecurityConfig can permit all
            }
        }

        // Continue the filter chain. If authentication was successful, SecurityContext will have it.
        // If not, Spring Security's authorization rules in SecurityConfig will catch it.
        filterChain.doFilter(request, response);
    }
}
