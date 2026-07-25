package com.physiqo.notification.dto;
import lombok.Data;
import java.util.UUID;
@Data public class NotificationDto { private UUID id; private String title; private String message; private Boolean isRead; }
