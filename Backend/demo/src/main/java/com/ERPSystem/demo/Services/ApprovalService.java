package com.ERPSystem.demo.Services;

import com.ERPSystem.demo.DTOs.ApprovalDto;
import com.ERPSystem.demo.Entities.*;
import com.ERPSystem.demo.Repositories.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor

public class ApprovalService {
    private final PurchaseOrderRepository poRepo;
    private final SalesOrderRepository     soRepo;
    private final LedgerEntryRepository ledgerRepo;
    private final LeaveRequestRepository leaveRepo;
    private final ApprovalLogRepository logRepo;
    private final AppUserRepository userRepo;
    private final EmailService             emailService;

    // ── Pending queue ─────────────────────────────────────────────────────────
    public List<ApprovalDto.PendingItem> getAllPending() {
        List<ApprovalDto.PendingItem> items = new ArrayList<>();

        poRepo.findByStatus(PurchaseOrder.PoStatus.PENDING_APPROVAL).forEach(po ->
                items.add(ApprovalDto.PendingItem.builder()
                        .id(po.getId())
                        .entityType("PURCHASE_ORDER")
                        .ref(po.getPoNumber())
                        .submittedBy(po.getSupplier() != null ? po.getSupplier().getName() : "—")
                        .description("Purchase order from " +
                                (po.getSupplier() != null ? po.getSupplier().getName() : "unknown supplier"))
                        .amount(po.getTotal())
                        .date(po.getOrderDate())
                        .status("PENDING_APPROVAL")
                        .createdAt(po.getCreatedAt())
                        .build())
        );

        soRepo.findByStatus(SalesOrder.OrderStatus.PENDING_APPROVAL).forEach(so ->
                items.add(ApprovalDto.PendingItem.builder()
                        .id(so.getId())
                        .entityType("SALES_ORDER")
                        .ref(so.getOrderNumber())
                        .submittedBy(so.getCustomer() != null ? so.getCustomer().getName() : "—")
                        .description("Sales order for " +
                                (so.getCustomer() != null ? so.getCustomer().getName() : "unknown customer"))
                        .amount(so.getTotal())
                        .date(so.getOrderDate())
                        .status("PENDING_APPROVAL")
                        .createdAt(so.getCreatedAt())
                        .build())
        );

        ledgerRepo.findByApprovalStatus(LedgerEntry.ApprovalStatus.PENDING_APPROVAL).forEach(e ->
                items.add(ApprovalDto.PendingItem.builder()
                        .id(e.getId())
                        .entityType("LEDGER_ENTRY")
                        .ref(e.getReference() != null ? e.getReference() : "JE-" + e.getId())
                        .submittedBy(e.getAccount())
                        .description(e.getMemo() != null ? e.getMemo() : e.getAccount())
                        .amount(e.getDebit() != null ? e.getDebit() : e.getCredit())
                        .date(e.getEntryDate())
                        .status("PENDING_APPROVAL")
                        .createdAt(e.getCreatedAt())
                        .build())
        );

        leaveRepo.findByStatus(LeaveRequest.LeaveStatus.PENDING_APPROVAL).forEach(lr ->
                items.add(ApprovalDto.PendingItem.builder()
                        .id(lr.getId())
                        .entityType("LEAVE_REQUEST")
                        .ref(lr.getLeaveNumber())
                        .submittedBy(lr.getEmployee() != null ? lr.getEmployee().getName() : "—")
                        .description(lr.getLeaveType() + " leave: " + lr.getStartDate() +
                                " → " + lr.getEndDate())
                        .date(lr.getStartDate())
                        .status("PENDING_APPROVAL")
                        .createdAt(lr.getCreatedAt())
                        .build())
        );

        items.sort(Comparator.comparing(
                ApprovalDto.PendingItem::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));

        return items;
    }

    // ── Approve ───────────────────────────────────────────────────────────────
    @Transactional
    public void approve(String entityType, Long id, String comment) {
        AppUser actor = currentUser();
        switch (entityType) {
            case "PURCHASE_ORDER" -> approvePo(id, actor, comment);
            case "SALES_ORDER"    -> approveSo(id, actor, comment);
            case "LEDGER_ENTRY"   -> approveJournal(id, actor, comment);
            case "LEAVE_REQUEST"  -> approveLeave(id, actor, comment);
            default -> throw new IllegalArgumentException("Unknown entity type: " + entityType);
        }
    }

    // ── Reject ────────────────────────────────────────────────────────────────
    @Transactional
    public void reject(String entityType, Long id, String comment) {
        AppUser actor = currentUser();
        switch (entityType) {
            case "PURCHASE_ORDER" -> rejectPo(id, actor, comment);
            case "SALES_ORDER"    -> rejectSo(id, actor, comment);
            case "LEDGER_ENTRY"   -> rejectJournal(id, actor, comment);
            case "LEAVE_REQUEST"  -> rejectLeave(id, actor, comment);
            default -> throw new IllegalArgumentException("Unknown entity type: " + entityType);
        }
    }

    // ── PO ────────────────────────────────────────────────────────────────────
    private void approvePo(Long id, AppUser actor, String comment) {
        PurchaseOrder po = poRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("PO not found: " + id));
        String prev = po.getStatus().name();
        po.setStatus(PurchaseOrder.PoStatus.APPROVED);
        poRepo.save(po);
        saveLog(ApprovalLog.EntityType.PURCHASE_ORDER, id, po.getPoNumber(),
                actor, ApprovalLog.Action.APPROVED, prev, "APPROVED", comment);
        if (po.getSupplier() != null && po.getSupplier().getEmail() != null)
            emailService.sendApprovalDecision(
                    po.getSupplier().getEmail(), po.getSupplier().getName(),
                    po.getPoNumber(), "Purchase Order", "APPROVED", comment);
    }

    private void rejectPo(Long id, AppUser actor, String comment) {
        PurchaseOrder po = poRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("PO not found: " + id));
        String prev = po.getStatus().name();
        po.setStatus(PurchaseOrder.PoStatus.CANCELLED);
        poRepo.save(po);
        saveLog(ApprovalLog.EntityType.PURCHASE_ORDER, id, po.getPoNumber(),
                actor, ApprovalLog.Action.REJECTED, prev, "CANCELLED", comment);
        if (po.getSupplier() != null && po.getSupplier().getEmail() != null)
            emailService.sendApprovalDecision(
                    po.getSupplier().getEmail(), po.getSupplier().getName(),
                    po.getPoNumber(), "Purchase Order", "REJECTED", comment);
    }

    // ── SO ────────────────────────────────────────────────────────────────────
    private void approveSo(Long id, AppUser actor, String comment) {
        SalesOrder so = soRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("SO not found: " + id));
        String prev = so.getStatus().name();
        so.setStatus(SalesOrder.OrderStatus.PROCESSING);
        soRepo.save(so);
        saveLog(ApprovalLog.EntityType.SALES_ORDER, id, so.getOrderNumber(),
                actor, ApprovalLog.Action.APPROVED, prev, "PROCESSING", comment);
        if (so.getCustomer() != null && so.getCustomer().getEmail() != null)
            emailService.sendApprovalDecision(
                    so.getCustomer().getEmail(), so.getCustomer().getName(),
                    so.getOrderNumber(), "Sales Order", "APPROVED", comment);
    }

    private void rejectSo(Long id, AppUser actor, String comment) {
        SalesOrder so = soRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("SO not found: " + id));
        String prev = so.getStatus().name();
        so.setStatus(SalesOrder.OrderStatus.CANCELLED);
        soRepo.save(so);
        saveLog(ApprovalLog.EntityType.SALES_ORDER, id, so.getOrderNumber(),
                actor, ApprovalLog.Action.REJECTED, prev, "CANCELLED", comment);
        if (so.getCustomer() != null && so.getCustomer().getEmail() != null)
            emailService.sendApprovalDecision(
                    so.getCustomer().getEmail(), so.getCustomer().getName(),
                    so.getOrderNumber(), "Sales Order", "REJECTED", comment);
    }

    private void approveJournal(Long id, AppUser actor, String comment) {
        LedgerEntry e = ledgerRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ledger entry not found: " + id));
        String prev = e.getApprovalStatus().name();
        e.setApprovalStatus(LedgerEntry.ApprovalStatus.APPROVED);
        ledgerRepo.save(e);
        String ref = e.getReference() != null ? e.getReference() : "JE-" + e.getId();
        saveLog(ApprovalLog.EntityType.LEDGER_ENTRY, id, ref,
                actor, ApprovalLog.Action.APPROVED, prev, "APPROVED", comment);
        // Email submitter if we have their info
        if (e.getSubmittedByEmail() != null)
            emailService.sendApprovalDecision(
                    e.getSubmittedByEmail(), e.getSubmittedByName(),
                    ref, "Journal Entry", "APPROVED", comment);
    }

    private void rejectJournal(Long id, AppUser actor, String comment) {
        LedgerEntry e = ledgerRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ledger entry not found: " + id));
        String prev = e.getApprovalStatus().name();
        e.setApprovalStatus(LedgerEntry.ApprovalStatus.REJECTED);
        ledgerRepo.save(e);
        String ref = e.getReference() != null ? e.getReference() : "JE-" + e.getId();
        saveLog(ApprovalLog.EntityType.LEDGER_ENTRY, id, ref,
                actor, ApprovalLog.Action.REJECTED, prev, "REJECTED", comment);
        if (e.getSubmittedByEmail() != null)
            emailService.sendApprovalDecision(
                    e.getSubmittedByEmail(), e.getSubmittedByName(),
                    ref, "Journal Entry", "REJECTED", comment);
    }
    // ── Leave ─────────────────────────────────────────────────────────────────
    private void approveLeave(Long id, AppUser actor, String comment) {
        LeaveRequest lr = leaveRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found: " + id));
        String prev = lr.getStatus().name();
        lr.setStatus(LeaveRequest.LeaveStatus.APPROVED);
        leaveRepo.save(lr);
        saveLog(ApprovalLog.EntityType.LEAVE_REQUEST, id, lr.getLeaveNumber(),
                actor, ApprovalLog.Action.APPROVED, prev, "APPROVED", comment);
        if (lr.getEmployee() != null && lr.getEmployee().getEmail() != null)
            emailService.sendApprovalDecision(
                    lr.getEmployee().getEmail(), lr.getEmployee().getName(),
                    lr.getLeaveNumber(), "Leave Request", "APPROVED", comment);
    }

    private void rejectLeave(Long id, AppUser actor, String comment) {
        LeaveRequest lr = leaveRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found: " + id));
        String prev = lr.getStatus().name();
        lr.setStatus(LeaveRequest.LeaveStatus.REJECTED);
        leaveRepo.save(lr);
        saveLog(ApprovalLog.EntityType.LEAVE_REQUEST, id, lr.getLeaveNumber(),
                actor, ApprovalLog.Action.REJECTED, prev, "REJECTED", comment);
        if (lr.getEmployee() != null && lr.getEmployee().getEmail() != null)
            emailService.sendApprovalDecision(
                    lr.getEmployee().getEmail(), lr.getEmployee().getName(),
                    lr.getLeaveNumber(), "Leave Request", "REJECTED", comment);
    }

    // ── Audit log ─────────────────────────────────────────────────────────────
    public List<ApprovalDto.LogItem> getLog(String entityType, Long entityId) {
        return logRepo.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
                        ApprovalLog.EntityType.valueOf(entityType), entityId)
                .stream()
                .map(l -> ApprovalDto.LogItem.builder()
                        .id(l.getId())
                        .entityType(l.getEntityType().name())
                        .entityRef(l.getEntityRef())
                        .actor(l.getActor() != null ? l.getActor().getFullName() : "System")
                        .action(l.getAction().name())
                        .previousStatus(l.getPreviousStatus())
                        .newStatus(l.getNewStatus())
                        .comment(l.getComment())
                        .createdAt(l.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private void saveLog(ApprovalLog.EntityType type, Long entityId, String ref,
                         AppUser actor, ApprovalLog.Action action,
                         String prev, String next, String comment) {
        logRepo.save(ApprovalLog.builder()
                .entityType(type)
                .entityId(entityId)
                .entityRef(ref)
                .actor(actor)
                .action(action)
                .previousStatus(prev)
                .newStatus(next)
                .comment(comment)
                .build());
    }

    private AppUser currentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

}
