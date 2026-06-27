package com.ERPSystem.demo.Services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    // ── Internal helper ───────────────────────────────────────────────────────

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(from);
            msg.setTo(to);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
        } catch (Exception e) {
            log.error("Email failed [to={}, subject={}]: {}", to, subject, e.getMessage());
        }
    }

    private String footer() {
        return "\nDo not reply to this email — this mailbox is not monitored.\n" +
                "— ROTECH ERP System";
    }

    // ── Approval decision (sent to employee / supplier / customer) ────────────

    @Async
    public void sendApprovalDecision(String toEmail, String toName,
                                     String entityRef, String entityType,
                                     String decision, String comment) {
        String subject = "ROTECH ERP — " + entityType + " " + entityRef + " " + decision;

        String body =
                "Hi " + toName + ",\n\n" +
                        "This is an automated notification from ROTECH ERP.\n\n" +
                        "Reference : " + entityRef          + "\n" +
                        "Type      : " + entityType         + "\n" +
                        "Decision  : " + decision           + "\n" +
                        (comment != null && !comment.isBlank()
                                ? "Note      : " + comment + "\n" : "") +
                        "\nPlease log in to the ROTECH ERP portal to view your updated records.\n" +
                        footer();

        send(toEmail, subject, body);
    }

    // ── Pending approval alert (sent to approvers) ────────────────────────────

    @Async
    public void notifyApproversOfPending(String approverEmail, String approverName,
                                         String entityRef, String entityType,
                                         String submittedBy) {
        String subject = "ROTECH ERP — Action Required: " + entityRef;

        String body =
                "Hi " + approverName + ",\n\n" +
                        "This is an automated notification from ROTECH ERP.\n\n" +
                        "Reference    : " + entityRef   + "\n" +
                        "Type         : " + entityType  + "\n" +
                        "Submitted by : " + submittedBy + "\n" +
                        "Status       : PENDING APPROVAL\n" +
                        "\nPlease log in to the ROTECH ERP portal to review and action this request.\n" +
                        footer();

        send(approverEmail, subject, body);
    }

    // ── Leave ending reminder (sent 1 and 2 days before end date) ────────────

    @Async
    public void sendLeaveEndingReminder(String toEmail, String toName,
                                        String leaveNumber, LocalDate endDate,
                                        int daysLeft) {
        String subject = "ROTECH ERP — Your leave ends in " +
                daysLeft + " day" + (daysLeft > 1 ? "s" : "");

        String body =
                "Hi " + toName + ",\n\n" +
                        "This is an automated notification from ROTECH ERP.\n\n" +
                        "Reference      : " + leaveNumber + "\n" +
                        "Type           : Leave Reminder\n" +
                        "Leave End Date : " + endDate     + "\n" +
                        "Days Remaining : " + daysLeft + " day" + (daysLeft > 1 ? "s" : "") + "\n" +
                        "Return Date    : " + endDate.plusDays(1) + "\n" +
                        "\nPlease ensure you are prepared to return on " + endDate.plusDays(1) + ".\n" +
                        "Log in to the ROTECH ERP portal to view your leave details.\n" +
                        footer();

        send(toEmail, subject, body);
    }

    // ── Leave expired — employee restored to Active ───────────────────────────

    @Async
    public void sendLeaveExpired(String toEmail, String toName,
                                 String leaveNumber, LocalDate endDate) {
        String subject = "ROTECH ERP — Welcome back, " + toName + "!";

        String body =
                "Hi " + toName + ",\n\n" +
                        "This is an automated notification from ROTECH ERP.\n\n" +
                        "Reference  : " + leaveNumber + "\n" +
                        "Type       : Leave Completion\n" +
                        "End Date   : " + endDate     + "\n" +
                        "New Status : ACTIVE\n" +
                        "\nYour leave period has ended and your status has been automatically " +
                        "restored to Active.\n" +
                        "Welcome back! Log in to the ROTECH ERP portal to view your records.\n" +
                        footer();

        send(toEmail, subject, body);
    }
}