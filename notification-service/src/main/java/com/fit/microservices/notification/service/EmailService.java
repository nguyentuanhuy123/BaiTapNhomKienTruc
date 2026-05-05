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

import static org.apache.kafka.common.requests.FetchMetadata.log;

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
    // Trong EmailService.java
    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("hello@demomailtrap.co");
            helper.setTo(toEmail);
            helper.setSubject("🔐 Reset your password");

            // Thay đổi URL này thành đường dẫn Frontend thực tế của bạn
            String resetLink = "http://localhost:3001/reset-password?token=" + resetToken;

            // Chuyển đổi template JS sang định dạng Java String với biến resetLink
            String htmlContent = """
                <div style="font-family: Arial; background:#0f172a; padding:40px; color:white;">
                    <div style="max-width:500px;margin:auto;background:#1e293b;padding:30px;border-radius:10px;">
                        
                        <h2 style="text-align:center; color:white;">🔐 Reset your password</h2>
                
                        <p style="color:white;">Looks like you forgot your password.</p>
                
                        <p style="color:white;">Click the button below to reset it:</p>
                
                        <div style="text-align:center;margin:30px 0;">
                            <a href="%s" 
                               style="background:#5865f2;color:white;padding:12px 20px;
                                      text-decoration:none;border-radius:5px;font-weight:bold;display:inline-block;">
                                Reset Password
                            </a>
                        </div>
                
                        <p style="font-size:12px;color:#94a3b8;">
                            This link will expire in 15 minutes.
                        </p>
                
                        <p style="font-size:12px;color:#94a3b8;">
                            If you didn't request this, ignore this email.
                        </p>
                    </div>
                </div>
                """.formatted(resetLink);

            helper.setText(htmlContent, true); // true để gửi dưới dạng HTML

            mailSender.send(message);
            System.out.println("📧 Reset password email sent to " + toEmail);

        } catch (MessagingException e) {
            System.err.println("❌ Send reset email failed: " + e.getMessage());
        }
    }
    public void sendOtpEmail(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("hello@demomailtrap.co"); // Đảm bảo khớp với các method khác của bạn
            helper.setTo(toEmail);
            helper.setSubject("🔑 Mã xác thực đăng nhập (OTP)");

            // Template được copy chính xác từ bản JS của bạn
            String htmlContent = """
            <div style="font-family: Arial; background:#0f172a; padding:40px; color:white;">
                <div style="max-width:500px;margin:auto;background:#1e293b;padding:30px;border-radius:10px;">
            
                    <h2 style="text-align:center; color:white;">🔐 Verify your login</h2>
            
                    <p style="color:white;">We detected a login attempt to your account.</p>
            
                    <p style="color:white;">Please use the OTP code below to continue:</p>
            
                    <div style="text-align:center;margin:30px 0;">
                        <span style="
                            display:inline-block;
                            background:#5865f2;
                            color:white;
                            padding:15px 25px;
                            font-size:24px;
                            letter-spacing:4px;
                            border-radius:8px;
                            font-weight:bold;
                        ">
                            %s
                        </span>
                    </div>
            
                    <p style="text-align:center; font-size:14px; color:white;">
                        This code will expire in <b>5 minutes</b>.
                    </p>
            
                    <p style="font-size:12px;color:#94a3b8;">
                        If this wasn't you, please secure your account immediately.
                    </p>
            
                </div>
            </div>
            """.formatted(otp);

            helper.setText(htmlContent, true);
            mailSender.send(message);

            System.out.println("📧 OTP email sent to " + toEmail);

        } catch (Exception e) {
            // Sử dụng log.error như trong code cũ của bạn
            log.error("❌ Lỗi gửi OTP email: {}", e.getMessage());
        }
    }
}

