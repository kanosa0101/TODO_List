package com.todo.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "认证响应，包含JWT Token和用户信息")
public class AuthResponse {
    @Schema(description = "JWT Token", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    private String token;
    
    @Schema(description = "用户名", example = "admin")
    private String username;
    
    @Schema(description = "用户ID", example = "1")
    private Long userId;

    public AuthResponse() {
    }

    public AuthResponse(String token, String username, Long userId) {
        this.token = token;
        this.username = username;
        this.userId = userId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}

