package com.ERPSystem.demo.DTOs;

import com.ERPSystem.demo.Entities.Project;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ProjectDto {
    @Getter
    @Setter
    public static class Request {
        @NotBlank
        private String name;
        private String leadName;
        @Min(0) @Max(100) private Integer progressPercent;
        private LocalDate deadline;
        private Project.ProjectStatus status;
    }

    @Getter @Setter @Builder
    public static class Response {
        private Long id;
        private String projectCode;
        private String name;
        private String leadName;
        private Integer progressPercent;
        private LocalDate deadline;
        private String status;
        private LocalDateTime createdAt;
    }
}
