package com.fit.microservices.notification.listener;

import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

/**
 * Dead Letter Topic (DLT) Listener
 *
 * Lắng nghe các topic DLT — nơi Kafka chuyển event tới khi đã retry
 * đủ số lần mà vẫn thất bại (xem KafkaConsumerConfig.errorHandler).
 *
 * Naming convention của Spring Kafka: "{original-topic}.DLT"
 *
 * LUỒNG:
 *   notification-service nhận event
 *     → xử lý thất bại (ví dụ: SMTP down, payload sai format)
 *       → retry 3 lần x 2 giây
 *         → vẫn thất bại → chuyển sang {topic}.DLT
 *           → DlqEventListener log lại để alert / xử lý thủ công
 *
 * TODO production: thay log.error bằng gửi alert thực (Slack webhook,
 * PagerDuty, lưu DB để re-process thủ công, v.v.)
 */
@Component
@Slf4j
public class DlqEventListener {

    private static final String DLT_GROUP = "notification-dlq-group";

    /**
     * Bắt toàn bộ DLT topics của notification-service trong một listener.
     * ConsumerRecord cho phép đọc header để biết nguyên nhân lỗi
     * (Spring Kafka tự động ghi vào header: kafka_dlt-exception-message, v.v.)
     */
    @KafkaListener(
            topics = {
                "user-otp-topic.DLT",
                "user-forgot-password-topic.DLT",
                "user-phone-otp-topic.DLT",
                "orders_completed.DLT",
                "orders_cancelled.DLT"
            },
            groupId = DLT_GROUP
    )
    public void handleDlqEvent(ConsumerRecord<String, Object> record) {
        // Đọc exception message từ header (Spring Kafka tự ghi)
        String exceptionMessage = extractHeader(record, "kafka_dlt-exception-message");
        String originalTopic    = extractHeader(record, "kafka_dlt-original-topic");
        String originalOffset   = extractHeader(record, "kafka_dlt-original-offset");
        String originalPartition= extractHeader(record, "kafka_dlt-original-partition");

        log.error(
            "[DLQ] ⚠️ Event xử lý thất bại sau tất cả các lần retry!\n" +
            "  DLT topic       : {}\n" +
            "  Original topic  : {}\n" +
            "  Original offset : {} (partition {})\n" +
            "  Payload         : {}\n" +
            "  Lỗi             : {}",
            record.topic(),
            originalTopic   != null ? originalTopic    : "(không rõ)",
            originalOffset  != null ? originalOffset   : "?",
            originalPartition != null ? originalPartition : "?",
            record.value(),
            exceptionMessage != null ? exceptionMessage : "(không có thông tin lỗi)"
        );

        // TODO: Tích hợp alert thực tế ở đây
        // Ví dụ:
        //   slackAlertService.sendAlert("DLQ event trên topic: " + record.topic());
        //   dlqEventRepository.save(new DlqEventRecord(record));
    }

    private String extractHeader(ConsumerRecord<?, ?> record, String headerKey) {
        var header = record.headers().lastHeader(headerKey);
        if (header == null) return null;
        return new String(header.value());
    }
}
