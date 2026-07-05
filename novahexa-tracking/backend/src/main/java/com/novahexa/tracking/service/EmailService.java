package com.novahexa.tracking.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Envoie d'emails transactionnels via Resend API (https://api.resend.com/emails).
 * Si RESEND_API_KEY n'est pas configuré, les emails sont logués en WARN sans erreur.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private static final String RESEND_URL = "https://api.resend.com/emails";

    private final RestTemplate http = new RestTemplate();

    @Value("${resend.api-key:}")
    private String apiKey;

    @Value("${resend.from-email:noreply@youmslogistics.com}")
    private String fromEmail;

    @Value("${resend.from-name:Youms Logistics}")
    private String fromName;

    private boolean isEnabled() {
        return apiKey != null && !apiKey.isBlank();
    }

    /**
     * Envoie un email transactionnel.
     *
     * @param to      adresse du destinataire
     * @param subject objet de l'email
     * @param html    contenu HTML
     */
    public void send(String to, String subject, String html) {
        if (!isEnabled()) {
            log.warn("[EmailService] RESEND_API_KEY non configuré — email non envoyé à {} : {}", to, subject);
            return;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> body = Map.of(
                    "from", fromName + " <" + fromEmail + ">",
                    "to", new String[]{to},
                    "subject", subject,
                    "html", html
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = http.postForEntity(RESEND_URL, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("[EmailService] Email envoyé à {} : {}", to, subject);
            } else {
                log.error("[EmailService] Erreur Resend ({}): {}", response.getStatusCode(), response.getBody());
            }
        } catch (Exception e) {
            log.error("[EmailService] Échec envoi email à {}: {}", to, e.getMessage());
        }
    }

    // ── Templates HTML ──────────────────────────────────────────

    public void sendSubmissionConfirmation(String to, String clientName, String trackingNumber) {
        String html = buildTemplate(
                "Demande de colis reçue",
                "Bonjour " + clientName + ",",
                "Votre demande de transport pour le colis <strong>" + trackingNumber + "</strong> a bien été enregistrée.",
                "Notre équipe va examiner votre demande et vous notifiera de la décision (validation ou refus) dans les plus brefs délais.",
                "Vous pouvez suivre l'état de votre demande depuis votre espace client.",
                "#C8A951"
        );
        send(to, "Confirmation de soumission — " + trackingNumber, html);
    }

    public void sendValidationEmail(String to, String clientName, String trackingNumber) {
        String html = buildTemplate(
                "Colis validé ✓",
                "Bonjour " + clientName + ",",
                "Bonne nouvelle ! Votre colis <strong>" + trackingNumber + "</strong> a été <strong>validé</strong> par notre équipe.",
                "Votre envoi est désormais enregistré et apparaît sur la carte de suivi. Vous pouvez suivre sa progression en temps réel.",
                "Un email de confirmation sera envoyé à chaque étape de livraison.",
                "#10b981"
        );
        send(to, "Colis validé — " + trackingNumber, html);
    }

    public void sendRefusalEmail(String to, String clientName, String trackingNumber, String reason) {
        String html = buildTemplate(
                "Colis refusé",
                "Bonjour " + clientName + ",",
                "Malheureusement, votre colis <strong>" + trackingNumber + "</strong> n'a pas pu être validé.",
                "<strong>Motif du refus :</strong> " + reason,
                "Si vous pensez qu'il s'agit d'une erreur, n'hésitez pas à contacter notre équipe ou à soumettre une nouvelle demande.",
                "#ef4444"
        );
        send(to, "Colis refusé — " + trackingNumber, html);
    }

    public void sendWaypointEmail(String to, String clientName, String trackingNumber, String waypointLabel) {
        String html = buildTemplate(
                "Point d'arrêt atteint",
                "Bonjour " + clientName + ",",
                "Votre colis <strong>" + trackingNumber + "</strong> vient de passer par l'étape : <strong>" + waypointLabel + "</strong>.",
                "Le colis poursuit son trajet vers la destination finale.",
                "Consultez la carte de suivi pour voir la progression en temps réel.",
                "#3b82f6"
        );
        send(to, "Étape atteinte — " + trackingNumber, html);
    }

    public void sendDeliveryEmail(String to, String clientName, String trackingNumber) {
        String html = buildTemplate(
                "Colis livré ! 🎉",
                "Bonjour " + clientName + ",",
                "Votre colis <strong>" + trackingNumber + "</strong> a été <strong>livré avec succès</strong>.",
                "Nous espérons que vous êtes satisfait de notre service. N'hésitez pas à nous contacter pour tout feedback.",
                "Merci de votre confiance !",
                "#10b981"
        );
        send(to, "Livraison confirmée — " + trackingNumber, html);
    }

    public void sendAdminMessageEmail(String to, String clientName, String trackingNumber, String subject, String messageBody) {
        String html = buildTemplate(
                "Message de Youms Logistics",
                "Bonjour " + clientName + ",",
                "Vous avez reçu un message concernant votre colis <strong>" + trackingNumber + "</strong> :",
                "<blockquote style=\"border-left:3px solid #C8A951;padding-left:12px;margin:16px 0;color:#555;\">" + messageBody + "</blockquote>",
                "Vous pouvez répondre depuis votre espace client.",
                "#C8A951"
        );
        send(to, subject + " — " + trackingNumber, html);
    }

    public void sendClientMessageEmail(String to, String trackingNumber, String clientName, String subject, String messageBody) {
        String html = buildTemplate(
                "Message client",
                "Bonjour,",
                "<strong>" + clientName + "</strong> a envoyé un message concernant le colis <strong>" + trackingNumber + "</strong> :",
                "<blockquote style=\"border-left:3px solid #3b82f6;padding-left:12px;margin:16px 0;color:#555;\">" + messageBody + "</blockquote>",
                "Connectez-vous à l'interface admin pour répondre.",
                "#3b82f6"
        );
        send(to, subject + " — " + trackingNumber, html);
    }

    // ── Auth templates ──────────────────────────────────────────

    public void sendVerificationEmail(String to, String clientName, String verifyUrl) {
        String html = buildTemplate(
                "Vérifiez votre email",
                "Bonjour " + clientName + ",",
                "Bienvenue sur Youms Logistics ! Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :",
                "<a href=\"" + verifyUrl + "\" style=\"display:inline-block;background:#C8A951;color:#060f24;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin:8px 0;\">Vérifier mon email</a>",
                "Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.",
                "#C8A951"
        );
        send(to, "Vérifiez votre email — Youms Logistics", html);
    }

    public void sendPasswordResetEmail(String to, String clientName, String resetUrl) {
        String html = buildTemplate(
                "Réinitialisation du mot de passe",
                "Bonjour " + clientName + ",",
                "Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour en créer un nouveau :",
                "<a href=\"" + resetUrl + "\" style=\"display:inline-block;background:#C8A951;color:#060f24;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin:8px 0;\">Réinitialiser mon mot de passe</a>",
                "Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.",
                "#C8A951"
        );
        send(to, "Réinitialisation du mot de passe — Youms Logistics", html);
    }

    // ── Template builder ────────────────────────────────────────

    private String buildTemplate(String title, String greeting, String mainText, String detailText, String footer, String accentColor) {
        String tpl = "<!DOCTYPE html><html><head><meta charset='utf-8'></head>"
            + "<body style='margin:0;padding:0;background:#f4f6f8;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;'>"
            + "<table width='100%' cellpadding='0' cellspacing='0' style='background:#f4f6f8;padding:40px 20px;'>"
            + "<tr><td align='center'>"
            + "<table width='600' cellpadding='0' cellspacing='0' style='background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);'>"
            + "<tr><td style='background:{{accent}};padding:24px 32px;'>"
            + "<h1 style='margin:0;color:#ffffff;font-size:20px;font-weight:700;'>{{title}}</h1></td></tr>"
            + "<tr><td style='padding:32px;'>"
            + "<p style='margin:0 0 16px;color:#333;font-size:15px;'>{{greeting}}</p>"
            + "<p style='margin:0 0 16px;color:#555;font-size:14px;line-height:1.6;'>{{main}}</p>"
            + "<p style='margin:0 0 24px;color:#555;font-size:14px;line-height:1.6;'>{{detail}}</p>"
            + "<hr style='border:none;border-top:1px solid #eee;margin:24px 0;'>"
            + "<p style='margin:0;color:#999;font-size:12px;line-height:1.5;'>{{footer}}</p>"
            + "</td></tr>"
            + "<tr><td style='background:#f9fafb;padding:20px 32px;text-align:center;'>"
            + "<p style='margin:0;color:#aaa;font-size:11px;'>Youms Logistics — 5 Rue du Beau Marais, 62100 Calais</p>"
            + "<p style='margin:4px 0 0;color:#aaa;font-size:11px;'>contact@youmslogistics.com | +33 3 21 00 00 00</p>"
            + "</td></tr></table></td></tr></table></body></html>";
        return tpl
            .replace("{{accent}}", accentColor)
            .replace("{{title}}", title)
            .replace("{{greeting}}", greeting)
            .replace("{{main}}", mainText)
            .replace("{{detail}}", detailText)
            .replace("{{footer}}", footer);
    }
}
