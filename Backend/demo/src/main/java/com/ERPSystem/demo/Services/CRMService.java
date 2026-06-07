package com.ERPSystem.demo.Services;

import com.ERPSystem.demo.DTOs.CRMDto;
import com.ERPSystem.demo.Entities.CRM;
import com.ERPSystem.demo.Exceptions.ResourceNotFoundException;
import com.ERPSystem.demo.Repositories.LeadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class CRMService {

    private final LeadRepository repo;
    private final AtomicLong seq = new AtomicLong(510);

    public List<CRMDto.Response> findAll() {
        return repo.findAll().stream().map(this::map).toList();
    }

    public CRMDto.Response findById(Long id) {
        return map(repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + id)));
    }

    public CRMDto.Response create(CRMDto.Request req) {
        CRM l = CRM.builder()
                .leadCode("L-" + seq.incrementAndGet())
                .companyName(req.getCompanyName())
                .source(req.getSource())
                .stage(req.getStage() != null ? req.getStage() : CRM.LeadStage.DISCOVERY)
                .estimatedValue(req.getEstimatedValue())
                .ownerName(req.getOwnerName())
                .build();
        return map(repo.save(l));
    }

    public CRMDto.Response update(Long id, CRMDto.Request req) {
        CRM l = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Lead not found: " + id));
        l.setCompanyName(req.getCompanyName()); l.setSource(req.getSource());
        if (req.getStage() != null) l.setStage(req.getStage());
        l.setEstimatedValue(req.getEstimatedValue()); l.setOwnerName(req.getOwnerName());
        return map(repo.save(l));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw new ResourceNotFoundException("Lead not found: " + id);
        repo.deleteById(id);
    }

    private CRMDto.Response map(CRM l) {
        return CRMDto.Response.builder()
                .id(l.getId()).leadCode(l.getLeadCode()).companyName(l.getCompanyName())
                .source(l.getSource() != null ? l.getSource().name() : null)
                .stage(l.getStage().name()).estimatedValue(l.getEstimatedValue())
                .ownerName(l.getOwnerName()).createdAt(l.getCreatedAt()).build();
    }

}
