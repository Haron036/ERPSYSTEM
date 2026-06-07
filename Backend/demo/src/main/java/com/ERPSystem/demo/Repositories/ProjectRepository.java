package com.ERPSystem.demo.Repositories;

import com.ERPSystem.demo.Entities.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    Optional<Project> findByProjectCode(String code);
    List<Project> findByStatus(Project.ProjectStatus status);
}
