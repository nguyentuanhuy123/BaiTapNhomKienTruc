package com.fit.microservices.notification.event;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class SmsOtpEvent {
    private String phone;
    private String otp;
    private String email; // để log
}
