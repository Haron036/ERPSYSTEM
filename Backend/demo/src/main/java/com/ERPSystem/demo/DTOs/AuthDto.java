package com.ERPSystem.demo.DTOs;

import com.ERPSystem.demo.Entities.AppUser;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

public class AuthDto {

    @Getter
    @Setter
    public static class LoginRequest {
        @Email(message = "Invalid email format")
        @NotBlank(message = "Email cannot be blank")
        private String email;

        @NotBlank(message = "Password cannot be blank")
        private String password;
    }

    @Getter @Setter @Builder
    public static class LoginResponse {
        private String token;
        private String email;
        private String fullName;
        private String role;
    }

    @Getter @Setter
    public static class RegisterRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;

        @Email(message = "Invalid email format")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;


        private String role;
    }
}