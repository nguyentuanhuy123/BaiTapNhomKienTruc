package com.fit.microservices.notification.service;

import com.fit.microservices.notification.event.OrderCompletedEvent;
import com.fit.microservices.notification.event.OrderPlacedEvent;
import com.fit.microservices.notification.event.PaymentCompletedEvent;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

import static org.apache.kafka.common.requests.FetchMetadata.log;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    // ── Xác nhận payment từ checkout ──────────────────────────────────

    public void sendPaymentConfirmationEmail(PaymentCompletedEvent event) {
        if (event.getUserEmail() == null || event.getUserEmail().isBlank()) return;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("hello@demomailtrap.co");
            helper.setTo(event.getUserEmail());

            boolean isCod = "COD".equalsIgnoreCase(event.getPaymentMethod());
            String subject = isCod
                    ? "🛍️ Đặt hàng thành công – Đơn #" + event.getOrderId()
                    : "✅ Thanh toán thành công – Đơn #" + event.getOrderId();
            helper.setSubject(subject);

            String html = buildPaymentEmailHtml(event, isCod);
            helper.setText(html, true);
            mailSender.send(message);

            System.out.println("📧 Payment confirmation email sent to " + event.getUserEmail()
                    + " – order #" + event.getOrderId());

        } catch (MessagingException e) {
            System.err.println("❌ sendPaymentConfirmationEmail failed: " + e.getMessage());
        }
    }

    // ── Template HTML chi tiết đơn hàng ──────────────────────────────

    private String buildPaymentEmailHtml(PaymentCompletedEvent event, boolean isCod) {
        String userName    = event.getUserName() != null ? event.getUserName() : "Khách hàng";
        String orderIdStr  = "#" + event.getOrderId();
        String methodLabel = isCod ? "Thanh toán khi nhận hàng (COD)" : "Ví điện tử VNPay";
        String address     = event.getShippingAddress() != null ? event.getShippingAddress() : "—";
        String dateStr     = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));

        // Build items rows
        StringBuilder itemsHtml = new StringBuilder();
        double subtotal = 0;

        List<PaymentCompletedEvent.OrderItem> items = event.getItems();
        if (items != null && !items.isEmpty()) {
            for (PaymentCompletedEvent.OrderItem item : items) {
                double lineTotal = item.getPrice() * item.getQuantity();
                subtotal += lineTotal;
                itemsHtml.append("""
                    <tr>
                        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;">
                            <div style="font-weight:600;color:#1e293b;">%s</div>
                            <div style="font-size:12px;color:#64748b;margin-top:2px;">
                                %s%s
                            </div>
                        </td>
                        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:center;color:#475569;">
                            x%d
                        </td>
                        <td style="padding:12px 16px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600;color:#1e293b;">
                            $%.2f
                        </td>
                    </tr>
                """.formatted(
                        item.getName(),
                        item.getSize() != null ? "Size: " + item.getSize() : "",
                        item.getColor() != null ? " • " + item.getColor() : "",
                        item.getQuantity(),
                        lineTotal
                ));
            }
        } else {
            subtotal = event.getAmount();
            itemsHtml.append("""
                <tr>
                    <td colspan="3" style="padding:16px;text-align:center;color:#64748b;">
                        Chi tiết đơn hàng không có sẵn.
                    </td>
                </tr>
            """);
        }

        double tax      = subtotal * 0.08;
        double total    = subtotal + tax;
        String badgeColor = isCod ? "#f59e0b" : "#8b5cf6";
        String badgeText  = isCod ? "COD" : "VNPAY";

        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Arial,sans-serif;">

              <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;
                          overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                <!-- Header -->
                <div style="background:linear-gradient(135deg,#0f172a 0%%,#1e3a5f 100%%);
                             padding:40px 40px 32px;text-align:center;">
                  <div style="font-size:36px;margin-bottom:8px;">✅</div>
                  <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;
                             letter-spacing:-0.5px;">
                    %s
                  </h1>
                  <p style="color:#94a3b8;margin:8px 0 0;font-size:14px;">
                    Đơn hàng <strong style="color:#e2e8f0;">%s</strong> – %s
                  </p>
                </div>

                <!-- Body -->
                <div style="padding:32px 40px;">

                  <!-- Greeting -->
                  <p style="color:#334155;font-size:15px;margin:0 0 24px;">
                    Xin chào <strong>%s</strong>,<br><br>
                    %s
                  </p>

                  <!-- Info cards -->
                  <div style="display:flex;gap:16px;margin-bottom:28px;">
                    <div style="flex:1;background:#f8fafc;border-radius:12px;padding:16px;
                                border:1px solid #e2e8f0;">
                      <div style="font-size:11px;font-weight:700;color:#94a3b8;
                                  text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
                        Địa chỉ giao hàng
                      </div>
                      <div style="color:#1e293b;font-size:14px;font-weight:600;">%s</div>
                    </div>
                    <div style="flex:1;background:#f8fafc;border-radius:12px;padding:16px;
                                border:1px solid #e2e8f0;">
                      <div style="font-size:11px;font-weight:700;color:#94a3b8;
                                  text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">
                        Phương thức thanh toán
                      </div>
                      <div style="display:inline-block;background:%s;color:#fff;
                                  font-size:11px;font-weight:700;padding:3px 10px;
                                  border-radius:20px;margin-bottom:4px;">%s</div>
                      <div style="color:#1e293b;font-size:13px;">%s</div>
                    </div>
                  </div>

                  <!-- Items table -->
                  <h3 style="color:#1e293b;font-size:14px;font-weight:700;
                             text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">
                    📦 Chi tiết đơn hàng
                  </h3>
                  <table style="width:100%%;border-collapse:collapse;margin-bottom:20px;">
                    <thead>
                      <tr style="background:#f1f5f9;">
                        <th style="padding:10px 16px;text-align:left;font-size:12px;
                                   font-weight:700;color:#64748b;text-transform:uppercase;
                                   letter-spacing:1px;">Sản phẩm</th>
                        <th style="padding:10px 16px;text-align:center;font-size:12px;
                                   font-weight:700;color:#64748b;text-transform:uppercase;
                                   letter-spacing:1px;">SL</th>
                        <th style="padding:10px 16px;text-align:right;font-size:12px;
                                   font-weight:700;color:#64748b;text-transform:uppercase;
                                   letter-spacing:1px;">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      %s
                    </tbody>
                  </table>

                  <!-- Totals -->
                  <div style="border-top:2px solid #f1f5f9;padding-top:16px;">
                    <div style="display:flex;justify-content:space-between;
                                margin-bottom:8px;font-size:14px;color:#64748b;">
                      <span>Tạm tính</span>
                      <span>$%.2f</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;
                                margin-bottom:8px;font-size:14px;color:#64748b;">
                      <span>Phí vận chuyển</span>
                      <span style="color:#10b981;font-weight:700;">Miễn phí</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;
                                margin-bottom:16px;font-size:14px;color:#64748b;">
                      <span>Thuế (8%%)</span>
                      <span>$%.2f</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;
                                background:#0f172a;border-radius:12px;padding:16px 20px;">
                      <span style="color:#e2e8f0;font-size:16px;font-weight:800;">TỔNG CỘNG</span>
                      <span style="color:#ffffff;font-size:24px;font-weight:900;">$%.2f</span>
                    </div>
                  </div>
                </div>

                <!-- Footer -->
                <div style="background:#f8fafc;padding:24px 40px;text-align:center;
                             border-top:1px solid #e2e8f0;">
                  <p style="color:#94a3b8;font-size:12px;margin:0;">
                    🔒 Email này được gửi tự động từ hệ thống Velocity.<br>
                    Vui lòng không trả lời email này.
                  </p>
                </div>

              </div>
            </body>
            </html>
        """.formatted(
                isCod ? "Đặt hàng thành công!" : "Thanh toán thành công!",
                orderIdStr,
                dateStr,
                userName,
                isCod
                        ? "Cảm ơn bạn đã đặt hàng! Đơn hàng của bạn đang được xử lý và sẽ được giao đến địa chỉ bên dưới. Vui lòng chuẩn bị tiền mặt khi nhận hàng."
                        : "Thanh toán qua VNPay của bạn đã được xác nhận thành công! Đơn hàng đang được chuẩn bị để giao đến bạn.",
                address,
                badgeColor,
                badgeText,
                methodLabel,
                itemsHtml.toString(),
                subtotal,
                tax,
                total
        );
    }

    // ── Existing methods (giữ nguyên) ──────────────────────────────────

    public void sendOrderEmail(OrderPlacedEvent event) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("hello@demomailtrap.co");
            helper.setTo("khanhlandev04@gmail.com");
            helper.setSubject("🛒 Thông báo đơn hàng mới");

            StringBuilder itemsHtml = new StringBuilder();
            BigDecimal total = BigDecimal.ZERO;

            for (OrderPlacedEvent.OrderItem item : event.getItems()) {
                BigDecimal itemTotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                total = total.add(itemTotal);
                itemsHtml.append("""
                    <tr>
                        <td>%s</td>
                        <td style="text-align:center">%d</td>
                        <td style="text-align:right">%s</td>
                        <td style="text-align:right">%s</td>
                    </tr>
                """.formatted(item.getSkuCode(), item.getQuantity(), item.getPrice(), itemTotal));
            }

            String body = """
                <h3>Xin chào!</h3>
                <p>Đơn hàng <b>#%s</b> đã được tạo thành công.</p>
                <p>Mã đơn: <b>%s</b></p>
                <p>User ID: <b>%d</b></p>
                <h4>📦 Chi tiết đơn hàng</h4>
                <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%%">
                    <thead style="background-color:#f2f2f2">
                        <tr><th>SKU</th><th>Số lượng</th><th>Giá</th><th>Thành tiền</th></tr>
                    </thead>
                    <tbody>%s</tbody>
                </table>
                <h3>Tổng tiền: %s</h3>
                <hr/>
                <p style="color:gray;font-size:12px">Đây là email tự động, vui lòng không trả lời.</p>
            """.formatted(event.getOrderId(), event.getOrderNumber(), event.getUserId(), itemsHtml, total);

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
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("hello@demomailtrap.co");
            helper.setTo("khanhlandev04@gmail.com");
            helper.setSubject("🛒 Thông báo đơn hàng hoàn tất");

            String content = """
                <h3>Xin chào %s</h3>
                <p>Đơn hàng <b>%s</b> của bạn đã được <b>%s</b>.</p>
                <p>Cảm ơn bạn đã mua sắm ❤️</p>
            """.formatted(event.getUserId(), event.getOrderId(), event.getStatus());

            helper.setText(content, true);
            mailSender.send(message);
            System.out.println("📧 Email sent for order " + event.getOrderId());
        } catch (Exception e) {
            System.err.println("❌ Send email failed: " + e.getMessage());
        }
    }

    public void sendPasswordResetEmail(String toEmail, String resetToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("hello@demomailtrap.co");
            helper.setTo(toEmail);
            helper.setSubject("🔐 Reset your password");

            String resetLink = "http://localhost:5173/forgot-password?token=" + resetToken;
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
                        <p style="font-size:12px;color:#94a3b8;">This link will expire in 15 minutes.</p>
                        <p style="font-size:12px;color:#94a3b8;">If you didn't request this, ignore this email.</p>
                    </div>
                </div>
            """.formatted(resetLink);

            helper.setText(htmlContent, true);
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

            helper.setFrom("hello@demomailtrap.co");
            helper.setTo(toEmail);
            helper.setSubject("🔑 Mã xác thực đăng nhập (OTP)");

            String htmlContent = """
                <div style="font-family: Arial; background:#0f172a; padding:40px; color:white;">
                    <div style="max-width:500px;margin:auto;background:#1e293b;padding:30px;border-radius:10px;">
                        <h2 style="text-align:center; color:white;">🔐 Verify your login</h2>
                        <p style="color:white;">We detected a login attempt to your account.</p>
                        <p style="color:white;">Please use the OTP code below to continue:</p>
                        <div style="text-align:center;margin:30px 0;">
                            <span style="display:inline-block;background:#5865f2;color:white;
                                         padding:15px 25px;font-size:24px;letter-spacing:4px;
                                         border-radius:8px;font-weight:bold;">%s</span>
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
            log.error("❌ Lỗi gửi OTP email: {}", e.getMessage());
        }
    }
}
