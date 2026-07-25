package com.physiqo.notification.dto;
import lombok.Data;
import java.util.List;
@Data public class NotificationListResponse { private List<NotificationDto> notifications; private long totalCount; }
