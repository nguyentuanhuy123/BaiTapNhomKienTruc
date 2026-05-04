package com.fit.microservices.notification.service;


import com.fit.microservices.notification.event.OrderCompletedEvent;
import com.fit.microservices.notification.event.OrderPlacedEvent;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOrderEmail(OrderPlacedEvent event) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("hello@demomailtrap.co");
            helper.setTo("khanhlandev04@gmail.com");
            helper.setSubject("🛒 Thông báo đơn hàng mới");

            // ========== Build table items ==========
            StringBuilder itemsHtml = new StringBuilder();
            BigDecimal total = BigDecimal.ZERO;

            for (OrderPlacedEvent.OrderItem item : event.getItems()) {
                BigDecimal itemTotal =
                        item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                total = total.add(itemTotal);

                itemsHtml.append("""
                <tr>
                    <td>%s</td>
                    <td style="text-align:center">%d</td>
                    <td style="text-align:right">%s</td>
                    <td style="text-align:right">%s</td>
                </tr>
            """.formatted(
                        item.getSkuCode(),
                        item.getQuantity(),
                        item.getPrice(),
                        itemTotal
                ));
            }

            String body = """
            <h3>Xin chào!</h3>
            <p>Đơn hàng <b>#%s</b> đã được tạo thành công.</p>
            <p>Mã đơn: <b>%s</b></p>
            <p>User ID: <b>%d</b></p>

            <h4>📦 Chi tiết đơn hàng</h4>
            <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%%">
                <thead style="background-color:#f2f2f2">
                    <tr>
                        <th>SKU</th>
                        <th>Số lượng</th>
                        <th>Giá</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    %s
                </tbody>
            </table>

            <h3>Tổng tiền: %s</h3>

            <hr/>
            <p style="color:gray;font-size:12px">
                Đây là email tự động, vui lòng không trả lời.
            </p>
            """.formatted(
                    event.getOrderId(),
                    event.getOrderNumber(),
                    event.getUserId(),
                    itemsHtml,
                    total
            );

            helper.setText(body, true);
            mailSender.send(message);

            System.out.println("📧 Email sent for order " + event.getOrderId());

        } catch (MessagingException e) {
            System.err.println("Send email failed: " + e.getMessage());
        }
    }

    public void sendOrderCompletedEvent(OrderCompletedEvent event) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("hello@demomailtrap.co");
            helper.setTo("khanhlandev04@gmail.com");
//            helper.setTo(event.getEmail()); // tốt hơn là lấy từ event
            helper.setSubject("🛒 Thông báo đơn hàng hoàn tất");

            String content = """
                    <h3>Xin chào %s</h3>
                    <p>Đơn hàng <b>%s</b> của bạn đã được <b>%s</b>.</p>
                    <p>Cảm ơn bạn đã mua sắm ❤️</p>
                    """.formatted(
                    event.getUserId(),
                    event.getOrderId(),
                    event.getStatus()
            );

            helper.setText(content, true); // true = HTML

            mailSender.send(message);
            System.out.println("📧 Email sent for order " + event.getOrderId());

        } catch (Exception e) {
            System.err.println("❌ Send email failed: " + e.getMessage());
        }
    }

}

