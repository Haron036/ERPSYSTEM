package com.ERPSystem.demo.Services;

import com.ERPSystem.demo.Configuration.JwtUtil;
import com.ERPSystem.demo.DTOs.AuthDto;
import com.ERPSystem.demo.Entities.AppUser;
import com.ERPSystem.demo.Exceptions.ConflictException;
import com.ERPSystem.demo.Repositories.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;

    public AuthDto.LoginResponse login(AuthDto.LoginRequest req) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        AppUser user = userRepo.findByEmail(req.getEmail()).orElseThrow();
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return AuthDto.LoginResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    public AuthDto.LoginResponse register(AuthDto.RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail()))
            throw new ConflictException("Email already registered: " + req.getEmail());

        // ── Convert String Role to Domain Enum type Safely ────────────────────
        AppUser.Role userRole = AppUser.Role.VIEWER; // Fallback default

        if (req.getRole() != null && !req.getRole().trim().isEmpty()) {
            try {
                // Converts "ADMIN" or "admin" to AppUser.Role.ADMIN
                userRole = AppUser.Role.valueOf(req.getRole().toUpperCase().trim());
            } catch (IllegalArgumentException e) {
                // Fallback default if an invalid role string somehow reaches the backend
                userRole = AppUser.Role.VIEWER;
            }
        }

        // ── Map and persist the complete AppUser Record ───────────────────────
        AppUser user = AppUser.builder()
                .fullName(req.getFullName())
                .email(req.getEmail())
                .password(encoder.encode(req.getPassword()))
                .role(userRole) // Assigned cleanly parsed enum object here
                .build();
        userRepo.save(user);

        // ── Issue standard payload token context response ─────────────────────
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        return AuthDto.LoginResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }
}