package com.ERPSystem.demo.Services;

import com.ERPSystem.demo.DTOs.ProjectDto;
import com.ERPSystem.demo.Entities.Project;
import com.ERPSystem.demo.Exceptions.ResourceNotFoundException;
import com.ERPSystem.demo.Repositories.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository repo;
    private final AtomicLong seq = new AtomicLong(20);

    public List<ProjectDto.Response> findAll() {
        return repo.findAll().stream().map(this::map).toList();
    }

    public ProjectDto.Response findById(Long id) {
        return map(repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id)));
    }

    public ProjectDto.Response create(ProjectDto.Request req) {
        Project p = Project.builder()
                .projectCode("PRJ-" + String.format("%03d", seq.incrementAndGet()))
                .name(req.getName())
                .leadName(req.getLeadName())
                .progressPercent(req.getProgressPercent() != null ? req.getProgressPercent() : 0)
                .deadline(req.getDeadline())
                .status(req.getStatus() != null ? req.getStatus() : Project.ProjectStatus.ON_TRACK)
                .build();
        return map(repo.save(p));
    }

    public ProjectDto.Response update(Long id, ProjectDto.Request req) {
        Project p = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));
        p.setName(req.getName()); p.setLeadName(req.getLeadName());
        if (req.getProgressPercent() != null) p.setProgressPercent(req.getProgressPercent());
        if (req.getDeadline() != null) p.setDeadline(req.getDeadline());
        if (req.getStatus() != null) p.setStatus(req.getStatus());
        return map(repo.save(p));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw new ResourceNotFoundException("Project not found: " + id);
        repo.deleteById(id);
    }

    private ProjectDto.Response map(Project p) {
        return ProjectDto.Response.builder()
                .id(p.getId()).projectCode(p.getProjectCode()).name(p.getName())
                .leadName(p.getLeadName()).progressPercent(p.getProgressPercent())
                .deadline(p.getDeadline()).status(p.getStatus().name())
                .createdAt(p.getCreatedAt()).build();
    }

}
