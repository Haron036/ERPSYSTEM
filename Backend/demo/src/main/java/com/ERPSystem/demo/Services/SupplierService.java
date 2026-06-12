package com.ERPSystem.demo.Services;

import com.ERPSystem.demo.DTOs.SupplierDto;
import com.ERPSystem.demo.Entities.Supplier;
import com.ERPSystem.demo.Exceptions.ResourceNotFoundException;
import com.ERPSystem.demo.Repositories.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class SupplierService {
    private final SupplierRepository repo;
    private final AtomicLong seq = new AtomicLong(210);

    public List<SupplierDto.Response> findAll() {
        return repo.findAll().stream().map(this::map).toList();
    }

    public SupplierDto.Response findById(Long id) {
        return map(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + id)));
    }

    public SupplierDto.Response create(SupplierDto.Request req) {
        Supplier s = Supplier.builder()
                .supplierCode("S-" + seq.incrementAndGet())
                .name(req.getName())
                .contactPerson(req.getContactPerson())
                .email(req.getEmail())             // ← added
                .country(req.getCountry())
                .rating(req.getRating())
                .leadTime(req.getLeadTime())
                .build();
        return map(repo.save(s));
    }

    public SupplierDto.Response update(Long id, SupplierDto.Request req) {
        Supplier s = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + id));
        s.setName(req.getName());
        s.setContactPerson(req.getContactPerson());
        s.setEmail(req.getEmail());                // ← added
        s.setCountry(req.getCountry());
        s.setRating(req.getRating());
        s.setLeadTime(req.getLeadTime());
        return map(repo.save(s));
    }

    public void delete(Long id) {
        if (!repo.existsById(id))
            throw new ResourceNotFoundException("Supplier not found: " + id);
        repo.deleteById(id);
    }

    private SupplierDto.Response map(Supplier s) {
        return SupplierDto.Response.builder()
                .id(s.getId())
                .supplierCode(s.getSupplierCode())
                .name(s.getName())
                .contactPerson(s.getContactPerson())
                .email(s.getEmail())
                .country(s.getCountry())
                .rating(s.getRating())
                .leadTime(s.getLeadTime())
                .build();
    }
}