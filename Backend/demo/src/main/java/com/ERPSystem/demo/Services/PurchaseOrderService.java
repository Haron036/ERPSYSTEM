package com.ERPSystem.demo.Services;

import com.ERPSystem.demo.DTOs.PurchaseOrderDto;
import com.ERPSystem.demo.Entities.PurchaseOrder;
import com.ERPSystem.demo.Entities.Supplier;
import com.ERPSystem.demo.Exceptions.ResourceNotFoundException;
import com.ERPSystem.demo.Repositories.PurchaseOrderRepository;
import com.ERPSystem.demo.Repositories.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository poRepo;
    private final SupplierRepository supplierRepo;
    private final AtomicLong codeSeq = new AtomicLong(2850);

    public List<PurchaseOrderDto.Response> findAll() {
        return poRepo.findAll().stream().map(this::toResponse).toList();
    }

    public PurchaseOrderDto.Response findById(Long id) {
        return toResponse(poRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PO not found: " + id)));
    }

    public PurchaseOrderDto.Response create(PurchaseOrderDto.Request req) {
        Supplier supplier = supplierRepo.findById(req.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + req.getSupplierId()));

        String num = "PO-" + codeSeq.incrementAndGet();
        PurchaseOrder po = PurchaseOrder.builder()
                .poNumber(num)
                .supplier(supplier)
                .orderDate(req.getOrderDate())
                .total(req.getTotal())
                .status(PurchaseOrder.PoStatus.PENDING_APPROVAL)
                .notes(req.getNotes())
                .build();
        return toResponse(poRepo.save(po));
    }

    public PurchaseOrderDto.Response updateStatus(Long id, PurchaseOrder.PoStatus status) {
        PurchaseOrder po = poRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PO not found: " + id));
        po.setStatus(status);
        return toResponse(poRepo.save(po));
    }

    public void delete(Long id) {
        if (!poRepo.existsById(id)) throw new ResourceNotFoundException("PO not found: " + id);
        poRepo.deleteById(id);
    }

    private PurchaseOrderDto.Response toResponse(PurchaseOrder p) {
        return PurchaseOrderDto.Response.builder()
                .id(p.getId())
                .poNumber(p.getPoNumber())
                .supplierName(p.getSupplier().getName())
                .orderDate(p.getOrderDate())
                .total(p.getTotal())
                .status(p.getStatus().name())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
