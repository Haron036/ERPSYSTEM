package com.ERPSystem.demo.Services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor

public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Async
    public void sendApprovalDecision(String toEmail, String toName,
                                     String entityRef, String entityType,
                                     String decision, String comment) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(toEmail);
            msg.setSubject("ROTECH ERP — " + entityRef + " " + decision);
            msg.setText(
                    "Hi " + toName + ",\n\n" +
                            "Your " + entityType + " " + entityRef + " has been " +
                            decision.toLowerCase() + ".\n\n" +
                            (comment != null && !comment.isBlank()
                                    ? "Comment: " + comment + "\n\n" : "") +
                            "View it here: " + frontendUrl + "/approvals\n\n" +
                            "— ROTECH ERP"
            );
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Email send failed for {}: {}", entityRef, e.getMessage());
        }
    }

    @Async
    public void notifyApproversOfPending(String approverEmail, String approverName,
                                         String entityRef, String entityType,
                                         String submittedBy) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(approverEmail);
            msg.setSubject("ROTECH ERP — Action Required: " + entityRef);
            msg.setText(
                    "Hi " + approverName + ",\n\n" +
                            submittedBy + " submitted " + entityType + " " + entityRef +
                            " and it requires your approval.\n\n" +
                            "Review it here: " + frontendUrl + "/approvals\n\n" +
                            "— ROTECH ERP"
            );
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Approver notify failed for {}: {}", entityRef, e.getMessage());
        }
    }
}
