package com.ERPSystem.demo.Repositories;

import com.ERPSystem.demo.Entities.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, Long> {
    List<LedgerEntry> findByReference(String reference);
    List<LedgerEntry> findByEntryType(LedgerEntry.EntryType type);
    @Query("SELECT COALESCE(SUM(e.debit),0) - COALESCE(SUM(e.credit),0) FROM LedgerEntry e WHERE e.account = :account")
    BigDecimal getBalanceForAccount(String account);
}
