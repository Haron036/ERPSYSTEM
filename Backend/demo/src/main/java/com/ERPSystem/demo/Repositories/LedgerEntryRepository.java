package com.ERPSystem.demo.Repositories;

import com.ERPSystem.demo.Entities.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, Long> {

    List<LedgerEntry> findByReference(String reference);
    List<LedgerEntry> findByEntryType(LedgerEntry.EntryType type);
    List<LedgerEntry> findByApprovalStatus(LedgerEntry.ApprovalStatus status);

    @Query("SELECT COALESCE(SUM(e.debit),0) - COALESCE(SUM(e.credit),0) " +
            "FROM LedgerEntry e WHERE e.account = :account")
    BigDecimal getBalanceForAccount(@Param("account") String account);

    @Query(value = """
            SELECT TO_CHAR(entry_date, 'Mon')           AS month,
                   EXTRACT(MONTH FROM entry_date)::int  AS month_num,
                   COALESCE(SUM(credit), 0)             AS total
            FROM ledger_entries
            WHERE account = '4000 · Sales Revenue'
              AND EXTRACT(YEAR FROM entry_date)::int = :year
            GROUP BY TO_CHAR(entry_date, 'Mon'),
                     EXTRACT(MONTH FROM entry_date)::int
            ORDER BY EXTRACT(MONTH FROM entry_date)::int
            """, nativeQuery = true)
    List<Object[]> monthlyRevenue(@Param("year") int year);

    @Query(value = """
            SELECT TO_CHAR(entry_date, 'Mon')           AS month,
                   EXTRACT(MONTH FROM entry_date)::int  AS month_num,
                   COALESCE(SUM(debit), 0)              AS total
            FROM ledger_entries
            WHERE (account LIKE '5%' OR account LIKE '6%')
              AND EXTRACT(YEAR FROM entry_date)::int = :year
            GROUP BY TO_CHAR(entry_date, 'Mon'),
                     EXTRACT(MONTH FROM entry_date)::int
            ORDER BY EXTRACT(MONTH FROM entry_date)::int
            """, nativeQuery = true)
    List<Object[]> monthlyExpenses(@Param("year") int year);
}