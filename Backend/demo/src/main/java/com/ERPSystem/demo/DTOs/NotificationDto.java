package com.ERPSystem.demo.DTOs;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class NotificationDto {
    private String title;
    private String body;
    private String severity;

}
