package com.physiqo.notification.controller;

import com.physiqo.common.security.CurrentUser;
import com.physiqo.common.security.UserPrincipal;
import com.physiqo.notification.entity.Notification;
import com.physiqo.notification.service.NotificationService;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping
    public List<Notification> getNotifications(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(required = false) UUID userId) {
        UUID targetUserId = (userId != null) ? userId : (currentUser != null ? currentUser.getId() : null);
        if (targetUserId == null) {
            return List.of();
        }
        return notificationService.getUserNotifications(targetUserId);
    }

    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable UUID id) {
        notificationService.markAsRead(id);
    }

    @PutMapping("/read-all")
    public void markAllAsRead(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(required = false) UUID userId) {
        UUID targetUserId = (userId != null) ? userId : (currentUser != null ? currentUser.getId() : null);
        if (targetUserId != null) {
            notificationService.markAllAsRead(targetUserId);
        }
    }
}
