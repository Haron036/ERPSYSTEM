package com.ERPSystem.demo;

import java.security.SecureRandom;
import java.util.Base64;

public class GenerateSecretkey {
    public static void main(String[] args) {
        SecureRandom random = new SecureRandom();
        byte[] secret = new byte[64]; // 512 bits — matches HS512
        random.nextBytes(secret);
        System.out.println(Base64.getEncoder().encodeToString(secret));
    }
}
