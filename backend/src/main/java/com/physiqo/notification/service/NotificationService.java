package com.physiqo.notification.service;

import com.physiqo.notification.entity.Notification;
import com.physiqo.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public Notification create(Notification notification) {
        return notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(UUID userId) {
        return notificationRepository.findByUserId(userId);
    }

    public void markAsRead(UUID id) {
        Notification n = notificationRepository.findById(id).orElseThrow();
        n.setIsRead(true);
        notificationRepository.save(n);
    }

    public void markAllAsRead(UUID userId) {
        List<Notification> notifs = notificationRepository.findByUserId(userId);
        notifs.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifs);
    }
}
