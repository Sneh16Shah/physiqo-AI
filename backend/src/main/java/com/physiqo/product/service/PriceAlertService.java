package com.physiqo.product.service;

import com.physiqo.product.entity.PriceAlert;
import com.physiqo.product.repository.PriceAlertRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PriceAlertService {
    private final PriceAlertRepository priceAlertRepository;

    public PriceAlert createAlert(PriceAlert alert) {
        if(priceAlertRepository.findByUserIdAndProductId(alert.getUserId(), alert.getProduct().getId()).isPresent()) {
            throw new RuntimeException("Alert already exists for this product");
        }
        return priceAlertRepository.save(alert);
    }
    
    public List<PriceAlert> getUserAlerts(UUID userId) {
        return priceAlertRepository.findByUserId(userId);
    }
    
    public PriceAlert updateAlert(UUID id, PriceAlert alertDetails) {
        PriceAlert alert = priceAlertRepository.findById(id).orElseThrow();
        alert.setTargetPrice(alertDetails.getTargetPrice());
        return priceAlertRepository.save(alert);
    }
    
    public void deleteAlert(UUID id) {
        priceAlertRepository.deleteById(id);
    }
}
