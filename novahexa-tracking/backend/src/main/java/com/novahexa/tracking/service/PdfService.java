package com.novahexa.tracking.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.novahexa.tracking.domain.Parcel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    private static final Logger log = LoggerFactory.getLogger(PdfService.class);

    // ── Palette Youms Logistics (bleu nuit #060f24 + or #C8A951) ──
    private static final Color BRAND_BLUE = new Color(6, 15, 36);     // #060f24
    private static final Color BRAND_GOLD = new Color(200, 169, 81);  // #C8A951
    private static final Color GRAY       = new Color(120, 120, 120);
    private static final Color LTGRAY     = new Color(220, 220, 220);
    private static final Color HEADER_BG  = new Color(245, 245, 245);
    private static final Color ALERT_BG   = new Color(255, 245, 200);  // Jaune clair pour alerte
    private static final Color ALERT_BORDER = new Color(200, 169, 81);    // Or pour bordure alerte

    private static final Font SECTION_FONT = new Font(Font.HELVETICA, 10, Font.BOLD, BRAND_BLUE);
    private static final Font LABEL_FONT   = new Font(Font.HELVETICA, 8, Font.NORMAL, GRAY);
    private static final Font VALUE_FONT   = new Font(Font.HELVETICA, 9, Font.NORMAL, BRAND_BLUE);
    private static final Font BOLD_FONT    = new Font(Font.HELVETICA, 9, Font.BOLD, BRAND_BLUE);
    private static final Font SMALL_FONT   = new Font(Font.HELVETICA, 7, Font.NORMAL, GRAY);
    private static final Font TOTAL_FONT   = new Font(Font.HELVETICA, 9, Font.BOLD, BRAND_BLUE);
    private static final Font BARCODE_FONT = new Font(Font.HELVETICA, 12, Font.BOLD, BRAND_BLUE);
    private static final Font ALERT_FONT   = new Font(Font.HELVETICA, 10, Font.BOLD, BRAND_BLUE);

    private static final String DATE_FMT = "dd/MM/yyyy HH:mm";

    // ════════════════════════════════════════════════════════════
    //  FACTURE (Invoice)
    // ════════════════════════════════════════════════════════════
    public byte[] generateQuote(Parcel p) {
        return buildDocument("FACTURE", p, "Erreur generation facture PDF");
    }

    public byte[] generateInvoice(Parcel p) {
        return buildDocument("FACTURE", p, "Erreur generation facture PDF");
    }

    private byte[] buildDocument(String title, Parcel p, String errorMsg) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
        try {
            PdfWriter.getInstance(doc, out);
            doc.open();
            // Diagnostic log: afficher le délai renseigné pour ce colis
            log.info("[PdfService] Generating PDF '{}' for tracking={} deliveryDelay={} customDelay={}",
                    title, p.getTrackingNumber(), p.getDeliveryDelay(), p.getCustomDeliveryDelay());
            addDocumentHeader(doc, title, p);
            addSenderReceiverBlock(doc, p);
            addParcelDetailsTable(doc, p);
            addTotalsRow(doc, p);
            addDocumentFooter(doc);
            doc.close();
        } catch (Exception e) {
            throw new PdfException(errorMsg, e);
        }
        return out.toByteArray();
    }

    // ════════════════════════════════════════════════════════════
    //  ETIQUETTE SHIPPING (barcode label)
    // ════════════════════════════════════════════════════════════
    public byte[] generateShippingLabel(Parcel p) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(new Rectangle(226, 340), 15, 15, 15, 15);
        try {
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            doc.open();

            // White logo section + blue brand bar
            PdfPTable topBar = new PdfPTable(1);
            topBar.setWidthPercentage(100);
            Image labelLogo = loadLogo();
            if (labelLogo != null) {
                PdfPCell logoCell = new PdfPCell();
                logoCell.setBackgroundColor(Color.WHITE);
                logoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                logoCell.setPadding(6);
                labelLogo.scaleToFit(40, 40);
                labelLogo.setAlignment(Element.ALIGN_CENTER);
                logoCell.addElement(labelLogo);
                topBar.addCell(logoCell);
            }
            PdfPCell barCell = new PdfPCell();
            barCell.setBackgroundColor(BRAND_BLUE);
            barCell.setPadding(4);
            Paragraph brand = new Paragraph("YOUMS LOGISTICS", new Font(Font.HELVETICA, 9, Font.BOLD, Color.WHITE));
            brand.setAlignment(Element.ALIGN_CENTER);
            barCell.addElement(brand);
            topBar.addCell(barCell);
            doc.add(topBar);

            // Tracking number with barcode
            Paragraph tnTitle = new Paragraph("N° de suivi", new Font(Font.HELVETICA, 7, Font.NORMAL, GRAY));
            tnTitle.setAlignment(Element.ALIGN_CENTER);
            tnTitle.setSpacingBefore(8);
            doc.add(tnTitle);
            Paragraph tn = new Paragraph(p.getTrackingNumber(), BARCODE_FONT);
            tn.setAlignment(Element.ALIGN_CENTER);
            tn.setSpacingAfter(4);
            doc.add(tn);

            // Barcode
            Barcode128 barcode = new Barcode128();
            barcode.setCode(p.getTrackingNumber());
            barcode.setCodeType(Barcode.CODE128);
            barcode.setBarHeight(30);
            barcode.setX(0.8f);
            Image barcodeImg = barcode.createImageWithBarcode(writer.getDirectContent(), BRAND_BLUE, Color.WHITE);
            Paragraph barcodePara = new Paragraph();
            barcodePara.setAlignment(Element.ALIGN_CENTER);
            barcodeImg.scaleToFit(180, 35);
            barcodePara.add(barcodeImg);
            doc.add(barcodePara);
            doc.add(new Paragraph(" "));

            addLabelField(doc, "COLIS", p.getName());

            Paragraph routeTitle = new Paragraph("TRAJET", new Font(Font.HELVETICA, 7, Font.NORMAL, GRAY));
            routeTitle.setSpacingBefore(6);
            doc.add(routeTitle);
            Paragraph route = new Paragraph(
                    p.getOriginAddress() + "  →  " + p.getDestinationAddress(),
                    new Font(Font.HELVETICA, 9, Font.BOLD, BRAND_BLUE));
            route.setSpacingAfter(4);
            doc.add(route);

            addLabelField(doc, "TRANSPORT", p.getTransportMode() != null ? formatEnum(p.getTransportMode().name()) : "—");
            addLabelField(doc, "POIDS", p.getWeightKg() != null ? p.getWeightKg() + " kg" : "—");
            addLabelField(doc, "STATUT", "En cours");

            doc.add(new Paragraph(" "));
            doc.add(new Paragraph(" "));

            Paragraph footer = new Paragraph("youmslogistic.fr  |  youmslogistic@gmail.com",
                    new Font(Font.HELVETICA, 6, Font.NORMAL, GRAY));
            footer.setAlignment(Element.ALIGN_CENTER);
            doc.add(footer);

            doc.close();
        } catch (Exception e) {
            throw new PdfException("Erreur generation etiquette PDF", e);
        }
        return out.toByteArray();
    }

    // ════════════════════════════════════════════════════════════
    //  LOGO HELPER
    // ════════════════════════════════════════════════════════════
    /** Loads logo from classpath, returns Image or null. */
    private Image loadLogo() {
        try {
            ClassPathResource logoRes = new ClassPathResource("images/youms-logo-avec-arrière-plan.png");
            if (logoRes.exists()) {
                try (InputStream is = logoRes.getInputStream()) {
                    return Image.getInstance(is.readAllBytes());
                }
            }
        } catch (Exception e) {
            log.warn("[PdfService] Logo non charge: {}", e.getMessage());
        }
        return null;
    }

    // ════════════════════════════════════════════════════════════
    //  SHARED BLOCKS
    // ════════════════════════════════════════════════════════════

    /** Header: centered logo with white bg + blue band with company name + doc type. */
    private void addDocumentHeader(Document doc, String docType, Parcel p) throws DocumentException {
        // ── Logo section with white background (displays the full circular logo) ──
        PdfPTable logoTable = new PdfPTable(1);
        logoTable.setWidthPercentage(100);
        PdfPCell logoCell = new PdfPCell();
        logoCell.setBackgroundColor(Color.WHITE);
        logoCell.setPadding(14);
        logoCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        Image headerLogo = loadLogo();
        if (headerLogo != null) {
            headerLogo.scaleToFit(100, 100);
            headerLogo.setAlignment(Element.ALIGN_CENTER);
            logoCell.addElement(headerLogo);
        }
        logoTable.addCell(logoCell);
        doc.add(logoTable);

        // ── Blue band: company name + doc type ──
        PdfPTable headerTable = new PdfPTable(1);
        headerTable.setWidthPercentage(100);
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(BRAND_BLUE);
        cell.setPadding(14);

        Paragraph company = new Paragraph("Youms Logistics", new Font(Font.HELVETICA, 14, Font.BOLD, Color.WHITE));
        company.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(company);

        Paragraph sub = new Paragraph("Entreprise de transport et de logistique",
                new Font(Font.HELVETICA, 8, Font.NORMAL, new Color(180, 180, 180)));
        sub.setAlignment(Element.ALIGN_CENTER);
        sub.setSpacingBefore(2);
        cell.addElement(sub);

        Paragraph title = new Paragraph(docType, new Font(Font.HELVETICA, 18, Font.BOLD, BRAND_GOLD));
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingBefore(6);
        cell.addElement(title);

        headerTable.addCell(cell);
        doc.add(headerTable);

        // Date + tracking number row
        PdfPTable infoRow = new PdfPTable(2);
        infoRow.setWidthPercentage(100);
        infoRow.setWidths(new float[]{50, 50});

        PdfPCell dateCell = new PdfPCell();
        dateCell.setBorder(Rectangle.NO_BORDER);
        dateCell.setPadding(8);
        String now = java.time.LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern(DATE_FMT));
        dateCell.addElement(new Paragraph(now, SMALL_FONT));

        PdfPCell refCell = new PdfPCell();
        refCell.setBorder(Rectangle.NO_BORDER);
        refCell.setPadding(8);
        refCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        refCell.addElement(new Paragraph("N° de suivi : " + p.getTrackingNumber(), BOLD_FONT));

        infoRow.addCell(dateCell);
        infoRow.addCell(refCell);
        doc.add(infoRow);

        addSeparator(doc);
    }

    /** Sender and receiver details side by side. */
    private void addSenderReceiverBlock(Document doc, Parcel p) throws DocumentException {
        PdfPTable block = new PdfPTable(2);
        block.setWidthPercentage(100);
        block.setWidths(new float[]{50, 50});

        PdfPCell senderCell = new PdfPCell();
        senderCell.setBorder(Rectangle.NO_BORDER);
        senderCell.setPadding(6);
        senderCell.addElement(new Paragraph("DÉTAILS DE L'EXPÉDITEUR :", SECTION_FONT));
        senderCell.addElement(new Paragraph(" ", SMALL_FONT));
        addFieldInline(senderCell, "Nom de l'expéditeur :", safe(p.getSenderName()));
        addFieldInline(senderCell, "Numéro de téléphone :", safe(p.getSenderPhone()));
        addFieldInline(senderCell, "Adresse :", safe(p.getSenderAddress()));
        addFieldInline(senderCell, "E-mail :", safe(p.getSenderEmail()));
        block.addCell(senderCell);

        PdfPCell receiverCell = new PdfPCell();
        receiverCell.setBorder(Rectangle.NO_BORDER);
        receiverCell.setPadding(6);
        receiverCell.addElement(new Paragraph("DÉTAILS DU RÉCEPTEUR :", SECTION_FONT));
        receiverCell.addElement(new Paragraph(" ", SMALL_FONT));
        addFieldInline(receiverCell, "Nom du destinataire :", safe(p.getReceiverName()));
        addFieldInline(receiverCell, "Numéro de téléphone :", safe(p.getReceiverPhone()));
        addFieldInline(receiverCell, "Adresse :", safe(p.getReceiverAddress()));
        addFieldInline(receiverCell, "E-mail :", safe(p.getReceiverEmail()));
        block.addCell(receiverCell);

        doc.add(block);
        addSeparator(doc);
    }

    /** Détails du forfait table. */
    private void addParcelDetailsTable(Document doc, Parcel p) throws DocumentException {
        Paragraph title = new Paragraph("DÉTAILS DU FORFAIT :", SECTION_FONT);
        title.setSpacingBefore(4);
        title.setSpacingAfter(4);
        doc.add(title);

        // Display delivery delay: show an alert box when provided, otherwise show a labeled fallback
        String delayText = getDeliveryDelayText(p);
        if (delayText != null) {
            addAlertBox(doc, "⚠ DÉLAI DE LIVRAISON : " + delayText);
        } else {
            addLabelField(doc, "DÉLAI DE LIVRAISON :", "Non renseigné");
        }

        PdfPTable table = new PdfPTable(7);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{6, 12, 30, 13, 13, 13, 13});

        String[] headers = {"Qté", "Type de pièce", "Description", "Longueur(cm)", "Largeur(cm)", "Hauteur(cm)", "Poids(kg)"};
        for (String h : headers) {
            PdfPCell hc = new PdfPCell(new Paragraph(h, new Font(Font.HELVETICA, 7, Font.BOLD, BRAND_BLUE)));
            hc.setBackgroundColor(HEADER_BG);
            hc.setBorderColor(LTGRAY);
            hc.setBorderWidth(0.5f);
            hc.setPadding(5);
            hc.setHorizontalAlignment(Element.ALIGN_CENTER);
            table.addCell(hc);
        }

        PdfPCell qtyCell = new PdfPCell(new Paragraph("1", VALUE_FONT));
        qtyCell.setBorderColor(LTGRAY); qtyCell.setBorderWidth(0.5f); qtyCell.setPadding(5); qtyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(qtyCell);

        String typeName = p.getMaterial() != null ? formatEnum(p.getMaterial().name()) : "Général";
        PdfPCell typeCell = new PdfPCell(new Paragraph(typeName, VALUE_FONT));
        typeCell.setBorderColor(LTGRAY); typeCell.setBorderWidth(0.5f); typeCell.setPadding(5);
        table.addCell(typeCell);

        String desc = p.getName() != null ? p.getName() : "—";
        if (p.getMaterial() != null) {
            desc += ", " + formatEnum(p.getMaterial().name());
        }
        PdfPCell descCell = new PdfPCell(new Paragraph(desc, VALUE_FONT));
        descCell.setBorderColor(LTGRAY); descCell.setBorderWidth(0.5f); descCell.setPadding(5);
        table.addCell(descCell);

        addDimensionCell(table, p.getLengthCm());
        addDimensionCell(table, p.getWidthCm());
        addDimensionCell(table, p.getHeightCm());

        String weight = p.getWeightKg() != null ? p.getWeightKg().toString() : "0.00";
        PdfPCell wCell = new PdfPCell(new Paragraph(weight, VALUE_FONT));
        wCell.setBorderColor(LTGRAY); wCell.setBorderWidth(0.5f); wCell.setPadding(5); wCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(wCell);

        doc.add(table);
    }

    /** Returns the delivery delay text: custom number of days as "X jours", or enum label. */
    private String getDeliveryDelayText(Parcel p) {
        if (p.getCustomDeliveryDelay() != null && !p.getCustomDeliveryDelay().isBlank()) {
            try {
                int days = Integer.parseInt(p.getCustomDeliveryDelay().trim());
                return days + " jour" + (days > 1 ? "s" : "");
            } catch (NumberFormatException e) {
                // If not a plain number, display as-is
                return p.getCustomDeliveryDelay();
            }
        }
        if (p.getDeliveryDelay() != null) {
            return formatEnum(p.getDeliveryDelay().name());
        }
        return null;
    }

    /** Adds an alert box with colored background for important information. */
    private void addAlertBox(Document doc, String text) throws DocumentException {
        PdfPTable alertTable = new PdfPTable(1);
        alertTable.setWidthPercentage(100);
        
        PdfPCell alertCell = new PdfPCell();
        alertCell.setBackgroundColor(ALERT_BG);
        alertCell.setBorderColor(ALERT_BORDER);
        alertCell.setBorderWidth(1.5f);
        alertCell.setPadding(10);
        
        Paragraph alertPara = new Paragraph(text, ALERT_FONT);
        alertPara.setAlignment(Element.ALIGN_CENTER);
        alertCell.addElement(alertPara);
        
        alertTable.addCell(alertCell);
        doc.add(alertTable);
        doc.add(new Paragraph(" ")); // Spacing after alert
    }

    /** Totals row: Poids volumétrique, Volume, Poids total réel. */
    private void addTotalsRow(Document doc, Parcel p) throws DocumentException {
        PdfPTable totals = new PdfPTable(3);
        totals.setWidthPercentage(100);
        totals.setWidths(new float[]{34, 33, 33});

        double volWeight = 0;
        double volume = 0;
        if (p.getLengthCm() != null && p.getWidthCm() != null && p.getHeightCm() != null) {
            volume = (p.getLengthCm() * p.getWidthCm() * p.getHeightCm()) / 1_000_000.0;
            volWeight = (p.getLengthCm() * p.getWidthCm() * p.getHeightCm()) / 5000.0;
        }
        double realWeight = p.getWeightKg() != null ? p.getWeightKg().doubleValue() : 0;

        PdfPCell c1 = new PdfPCell();
        c1.setBorder(Rectangle.NO_BORDER);
        c1.setPadding(8);
        c1.addElement(new Paragraph("Poids volumétrique total :", LABEL_FONT));
        c1.addElement(new Paragraph(String.format("%.2fkg.", volWeight), TOTAL_FONT));
        totals.addCell(c1);

        PdfPCell c2 = new PdfPCell();
        c2.setBorder(Rectangle.NO_BORDER);
        c2.setPadding(8);
        c2.addElement(new Paragraph("Volume total :", LABEL_FONT));
        c2.addElement(new Paragraph(String.format("%.2fcu.m.", volume), TOTAL_FONT));
        totals.addCell(c2);

        PdfPCell c3 = new PdfPCell();
        c3.setBorder(Rectangle.NO_BORDER);
        c3.setPadding(8);
        c3.addElement(new Paragraph("Poids total réel :", LABEL_FONT));
        c3.addElement(new Paragraph(String.format("%.2fkg.", realWeight), TOTAL_FONT));
        totals.addCell(c3);

        doc.add(totals);
    }

    /** Footer with logo + company info. */
    private void addDocumentFooter(Document doc) throws DocumentException {
        addSeparator(doc);

        // Add logo in footer
        Image footerLogo = loadLogo();
        if (footerLogo != null) {
            footerLogo.scaleToFit(45, 45);
            footerLogo.setAlignment(Element.ALIGN_CENTER);
            doc.add(footerLogo);
        }

        Paragraph footer = new Paragraph(
                "Youms Logistics — youmslogistic@gmail.com\n" +
                "https://youmslogistic.fr",
                SMALL_FONT);
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(4);
        doc.add(footer);
    }

    // ════════════════════════════════════════════════════════════
    //  HELPERS
    // ════════════════════════════════════════════════════════════

    private void addSeparator(Document doc) throws DocumentException {
        PdfPTable sep = new PdfPTable(1);
        sep.setWidthPercentage(100);
        PdfPCell sepCell = new PdfPCell();
        sepCell.setBorder(Rectangle.BOTTOM);
        sepCell.setBorderColor(LTGRAY);
        sepCell.setBorderWidth(0.5f);
        sepCell.setFixedHeight(1);
        sep.addCell(sepCell);
        doc.add(sep);
    }

    private void addFieldInline(PdfPCell cell, String label, String value) {
        Paragraph p = new Paragraph(label + " ", LABEL_FONT);
        p.add(new Chunk(value, VALUE_FONT));
        p.setSpacingAfter(2);
        cell.addElement(p);
    }

    private void addDimensionCell(PdfPTable table, Integer cm) {
        String val = cm != null ? cm.toString() : "—";
        PdfPCell c = new PdfPCell(new Paragraph(val, VALUE_FONT));
        c.setBorderColor(LTGRAY); c.setBorderWidth(0.5f); c.setPadding(5); c.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(c);
    }

    private void addLabelField(Document doc, String label, String value) {
        Paragraph p = new Paragraph(label + " : ", new Font(Font.HELVETICA, 7, Font.NORMAL, GRAY));
        p.add(new Chunk(value, new Font(Font.HELVETICA, 9, Font.BOLD, BRAND_BLUE)));
        p.setSpacingAfter(2);
        doc.add(p);
    }

    private String safe(String s) { return s != null ? s : "—"; }

    private String formatEnum(String name) {
        return switch (name) {
            case "ROUTE" -> "Routier";
            case "AIR" -> "Aérien";
            case "MER" -> "Maritime";
            case "EXPRESS" -> "Express";
            case "STANDARD" -> "Standard";
            case "JOUR_MEME" -> "Jour même";
            case "GENERAL" -> "Général";
            case "AUTO_PARTS" -> "Pièces auto";
            case "FRAGILE" -> "Fragile";
            case "ELECTRONIQUE" -> "Électronique";
            case "DOCUMENTS" -> "Documents";
            default -> name;
        };
    }

    public static class PdfException extends RuntimeException {
        public PdfException(String msg, Throwable cause) { super(msg, cause); }
    }
}
