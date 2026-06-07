package com.ERPSystem.demo.Services;

import com.ERPSystem.demo.DTOs.ProductDto;
import com.ERPSystem.demo.Entities.Product;
import com.ERPSystem.demo.Entities.Supplier;
import com.ERPSystem.demo.Exceptions.ConflictException;
import com.ERPSystem.demo.Exceptions.ResourceNotFoundException;
import com.ERPSystem.demo.Repositories.ProductRepository;
import com.ERPSystem.demo.Repositories.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepo;
    private final SupplierRepository supplierRepo;

    public List<ProductDto.Response> findAll() {
        return productRepo.findAll().stream().map(this::toResponse).toList();
    }

    public ProductDto.Response findById(Long id) {
        return toResponse(productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id)));
    }

    public ProductDto.Response findBySku(String sku) {
        return toResponse(productRepo.findBySku(sku)
                .orElseThrow(() -> new ResourceNotFoundException("SKU not found: " + sku)));
    }

    public List<ProductDto.Response> findLowStock() {
        return productRepo.findLowStockProducts().stream().map(this::toResponse).toList();
    }

    public ProductDto.Response create(ProductDto.Request req) {
        if (productRepo.existsBySku(req.getSku()))
            throw new ConflictException("SKU already exists: " + req.getSku());

        Supplier supplier = req.getSupplierId() != null
                ? supplierRepo.findById(req.getSupplierId()).orElse(null)
                : null;

        Product p = Product.builder()
                .sku(req.getSku())
                .name(req.getName())
                .category(req.getCategory())
                .supplier(supplier)
                .stockQuantity(req.getStockQuantity() != null ? req.getStockQuantity() : 0)
                .reorderPoint(req.getReorderPoint() != null ? req.getReorderPoint() : 0)
                .unitPrice(req.getUnitPrice())
                .build();
        return toResponse(productRepo.save(p));
    }

    public ProductDto.Response update(Long id, ProductDto.Request req) {
        Product p = productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        p.setName(req.getName());
        p.setCategory(req.getCategory());
        p.setStockQuantity(req.getStockQuantity());
        p.setReorderPoint(req.getReorderPoint());
        p.setUnitPrice(req.getUnitPrice());
        if (req.getSupplierId() != null)
            p.setSupplier(supplierRepo.findById(req.getSupplierId()).orElse(null));
        return toResponse(productRepo.save(p));
    }

    public void delete(Long id) {
        if (!productRepo.existsById(id))
            throw new ResourceNotFoundException("Product not found: " + id);
        productRepo.deleteById(id);
    }

    private ProductDto.Response toResponse(Product p) {
        return ProductDto.Response.builder()
                .id(p.getId())
                .sku(p.getSku())
                .name(p.getName())
                .category(p.getCategory())
                .supplierName(p.getSupplier() != null ? p.getSupplier().getName() : null)
                .stockQuantity(p.getStockQuantity())
                .reorderPoint(p.getReorderPoint())
                .unitPrice(p.getUnitPrice())
                .lowStock(p.getStockQuantity() < p.getReorderPoint())
                .build();
    }

}
