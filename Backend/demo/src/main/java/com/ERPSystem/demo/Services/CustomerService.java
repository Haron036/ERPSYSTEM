package com.ERPSystem.demo.Services;

import com.ERPSystem.demo.DTOs.CustomerDto;
import com.ERPSystem.demo.Entities.Customer;
import com.ERPSystem.demo.Exceptions.ConflictException;
import com.ERPSystem.demo.Exceptions.ResourceNotFoundException;
import com.ERPSystem.demo.Repositories.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository repo;
    private final AtomicLong seq = new AtomicLong(1010);

    public List<CustomerDto.Response> findAll() {
        return repo.findAll().stream().map(this::map).toList();
    }

    public CustomerDto.Response findById(Long id) {
        return map(repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id)));
    }

    public CustomerDto.Response create(CustomerDto.Request req) {
        if (repo.existsByEmail(req.getEmail()))
            throw new ConflictException("Email already in use: " + req.getEmail());
        Customer c = Customer.builder()
                .customerCode("C-" + seq.incrementAndGet())
                .name(req.getName())
                .contactPerson(req.getContactPerson())
                .email(req.getEmail())
                .country(req.getCountry())
                .status(req.getStatus() != null ? req.getStatus() : Customer.CustomerStatus.ACTIVE)
                .build();
        return map(repo.save(c));
    }

    public CustomerDto.Response update(Long id, CustomerDto.Request req) {
        Customer c = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id));
        c.setName(req.getName());
        c.setContactPerson(req.getContactPerson());
        c.setEmail(req.getEmail());
        c.setCountry(req.getCountry());
        if (req.getStatus() != null) c.setStatus(req.getStatus());
        return map(repo.save(c));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw new ResourceNotFoundException("Customer not found: " + id);
        repo.deleteById(id);
    }

    private CustomerDto.Response map(Customer c) {
        return CustomerDto.Response.builder()
                .id(c.getId()).customerCode(c.getCustomerCode()).name(c.getName())
                .contactPerson(c.getContactPerson()).email(c.getEmail()).country(c.getCountry())
                .lifetimeValue(c.getLifetimeValue()).status(c.getStatus().name())
                .createdAt(c.getCreatedAt()).build();
    }
}
