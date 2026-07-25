package com.physiqo.product.service;

import com.physiqo.product.entity.ProductVerification;
import com.physiqo.product.repository.ProductVerificationRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VerificationService {
    private final ProductVerificationRepository verificationRepository;

    public ProductVerification submitVerification(ProductVerification verification) {
        return verificationRepository.save(verification);
    }
}
