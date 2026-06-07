package com.ERPSystem.demo.Services;

import com.ERPSystem.demo.DTOs.LedgerEntryDto;
import com.ERPSystem.demo.Entities.LedgerEntry;
import com.ERPSystem.demo.Exceptions.ResourceNotFoundException;
import com.ERPSystem.demo.Repositories.LedgerEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LedgerEntryService {
    private final LedgerEntryRepository repo;

    public List<LedgerEntryDto.Response> findAll() {
        return repo.findAll().stream().map(this::map).toList();
    }

    public LedgerEntryDto.Response create(LedgerEntryDto.Request req) {
        LedgerEntry e = LedgerEntry.builder()
                .entryDate(req.getEntryDate())
                .account(req.getAccount())
                .debit(req.getDebit()  != null ? req.getDebit()  : BigDecimal.ZERO)
                .credit(req.getCredit()!= null ? req.getCredit() : BigDecimal.ZERO)
                .reference(req.getReference())
                .memo(req.getMemo())
                .entryType(req.getEntryType())
                .build();
        return map(repo.save(e));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw new ResourceNotFoundException("Ledger entry not found: " + id);
        repo.deleteById(id);
    }

    private LedgerEntryDto.Response map(LedgerEntry e) {
        return LedgerEntryDto.Response.builder()
                .id(e.getId()).entryDate(e.getEntryDate()).account(e.getAccount())
                .debit(e.getDebit()).credit(e.getCredit()).reference(e.getReference())
                .memo(e.getMemo())
                .entryType(e.getEntryType() != null ? e.getEntryType().name() : null)
                .createdAt(e.getCreatedAt()).build();
    }
}
