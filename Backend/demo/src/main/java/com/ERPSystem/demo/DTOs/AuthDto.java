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
        @Email
        @NotBlank
        private String email;
        @NotBlank
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
        @NotBlank private String fullName;
        @Email @NotBlank private String email;
        @NotBlank @Size(min = 6) private String password;
        private AppUser.Role role;
    }

}
