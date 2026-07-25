package com.physiqo.product.controller;

import com.physiqo.product.entity.PriceAlert;
import com.physiqo.product.service.PriceAlertService;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/price-alerts")
@RequiredArgsConstructor
public class PriceAlertController {
    private final PriceAlertService priceAlertService;

    @PostMapping
    public PriceAlert createAlert(@RequestBody PriceAlert alert) {
        return priceAlertService.createAlert(alert);
    }

    @GetMapping
    public List<PriceAlert> getAlerts(@RequestParam UUID userId) {
        return priceAlertService.getUserAlerts(userId);
    }

    @PutMapping("/{id}")
    public PriceAlert updateAlert(@PathVariable UUID id, @RequestBody PriceAlert alert) {
        return priceAlertService.updateAlert(id, alert);
    }

    @DeleteMapping("/{id}")
    public void deleteAlert(@PathVariable UUID id) {
        priceAlertService.deleteAlert(id);
    }
}
