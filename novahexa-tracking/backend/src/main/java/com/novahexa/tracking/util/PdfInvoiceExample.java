package com.novahexa.tracking.util;

import com.novahexa.tracking.domain.DeliveryDelay;
import com.novahexa.tracking.domain.MaterialType;
import com.novahexa.tracking.domain.Parcel;
import com.novahexa.tracking.service.PdfService;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;

/**
 * Petit utilitaire pour générer localement une facture PDF d'exemple
 * et vérifier visuellement que le délai de livraison est affiché.
 */
public class PdfInvoiceExample {
    public static void main(String[] args) throws Exception {
        PdfService pdfService = new PdfService();

        Parcel p = new Parcel();
        p.setTrackingNumber("TN-EXAMPLE-001");
        p.setName("Colis exemple");
        p.setSenderName("Alice Exemple");
        p.setSenderPhone("+33123456789");
        p.setSenderAddress("1 rue de Test, Paris");
        p.setReceiverName("Bob Exemple");
        p.setReceiverPhone("+33798765432");
        p.setReceiverAddress("10 avenue Demo, Lyon");

        p.setOriginAddress("Paris, FR");
        p.setDestinationAddress("Lyon, FR");
        p.setDeliveryDelay(DeliveryDelay.EXPRESS);
        // p.setCustomDeliveryDelay("Livraison avant 12h"); // dé-commenter pour tester custom
        p.setMaterial(MaterialType.GENERAL);
        p.setWeightKg(new BigDecimal("2.50"));
        p.setLengthCm(30);
        p.setWidthCm(20);
        p.setHeightCm(10);
        p.setEstimatedCost(new BigDecimal("25.00"));
        p.setEstimatedDurationMinutes(120);
        p.setShippingDate(LocalDate.now());

        byte[] pdf = pdfService.generateInvoice(p);
        Path out = Path.of("facture-sample.pdf");
        Files.write(out, pdf);
        System.out.println("Wrote " + out.toAbsolutePath());
    }
}
