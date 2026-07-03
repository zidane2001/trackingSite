package com.novahexa.tracking.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.novahexa.tracking.domain.Parcel;
import com.novahexa.tracking.domain.TrackingEvent;
import com.novahexa.tracking.domain.Waypoint;
import com.novahexa.tracking.domain.MaterialType;
import com.novahexa.tracking.domain.TransportMode;
import com.novahexa.tracking.domain.DeliveryDelay;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Génération de PDF : devis, factures, étiquettes d'expédition.
 * Cahier §3.1 (devis), §11 (facturation), §5.4 (étiquette).
 */
@Service
public class PdfService {

    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 18, Font.BOLD, new Color(6, 15, 36));
    private static final Font HEADER_FONT = new Font(Font.HELVETICA, 12, Font.BOLD, new Color(200, 169, 81));
    private static final Font BODY_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL, new Color(51, 51, 51));
    private static final Font SMALL_FONT = new Font(Font.HELVETICA, 8, Font.NORMAL, new Color(148, 163, 184));
    private static final Font BOLD_BODY = new Font(Font.HELVETICA, 10, Font.BOLD, new Color(51, 51, 51));

    private static final Color GOLD = new Color(200, 169, 81);
    private static final Color DARK = new Color(6, 15, 36);
    private static final Color LIGHT_BG = new Color(249, 250, 251);

    private static final String DATE_FORMAT = "dd/MM/yyyy";

    /**
     * Génère un devis PDF pour un colis soumis.
     */
    public byte[] generateQuote(Parcel parcel) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 40, 40, 40, 40);
        try {
            PdfWriter.getInstance(doc, out);
            doc.open();

            // Header band
            PdfPTable headerTable = new PdfPTable(1);
            headerTable.setWidthPercentage(100);
            PdfPCell headerCell = new PdfPCell();
            headerCell.setBackgroundColor(DARK);
            headerCell.setPadding(20);
            Paragraph title = new Paragraph("DEVIS", new Font(Font.HELVETICA, 24, Font.BOLD, Color.WHITE));
            title.setAlignment(Element.ALIGN_CENTER);
            headerCell.addElement(title);
            Paragraph subtitle = new Paragraph("Youms Logistics — Transport & logistique international",
                    new Font(Font.HELVETICA, 10, Font.NORMAL, GOLD));
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingBefore(8);
            headerCell.addElement(subtitle);
            headerTable.addCell(headerCell);
            doc.add(headerTable);
            doc.add(new Paragraph(" "));

            // Quote info
            Paragraph ref = new Paragraph("Référence : " + parcel.getTrackingNumber(), HEADER_FONT);
            ref.setSpacingAfter(4);
            doc.add(ref);
            Paragraph date = new Paragraph("Date : " + java.time.LocalDate.now()
                    .format(DateTimeFormatter.ofPattern(DATE_FORMAT)), BODY_FONT);
            date.setSpacingAfter(12);
            doc.add(date);

            // Sender info
            addSectionTitle(doc, "Expéditeur");
            addInfoLine(doc, "Nom", parcel.getSenderName() != null ? parcel.getSenderName() : "—");
            addInfoLine(doc, "Email", parcel.getSenderEmail() != null ? parcel.getSenderEmail() : "—");
            addInfoLine(doc, "Téléphone", parcel.getSenderPhone() != null ? parcel.getSenderPhone() : "—");
            doc.add(new Paragraph(" "));

            // Parcel info
            addSectionTitle(doc, "Détails du colis");
            addInfoLine(doc, "Désignation", parcel.getName());
            addInfoLine(doc, "Poids", parcel.getWeightKg() != null ? parcel.getWeightKg() + " kg" : "—");
            if (parcel.getHeightCm() != null) {
                addInfoLine(doc, "Dimensions", parcel.getHeightCm() + " × " + parcel.getWidthCm() + " × " + parcel.getLengthCm() + " cm");
            }
            addInfoLine(doc, "Matériau", parcel.getMaterial() != null ? formatEnum(parcel.getMaterial().name()) : "—");
            doc.add(new Paragraph(" "));

            // Route
            addSectionTitle(doc, "Trajet");
            addInfoLine(doc, "Départ", parcel.getOriginAddress());
            addInfoLine(doc, "Arrivée", parcel.getDestinationAddress());
            addInfoLine(doc, "Transport", parcel.getTransportMode() != null ? formatEnum(parcel.getTransportMode().name()) : "—");
            addInfoLine(doc, "Délai", parcel.getDeliveryDelay() != null ? formatEnum(parcel.getDeliveryDelay().name()) : "—");
            doc.add(new Paragraph(" "));

            // Pricing
            addSectionTitle(doc, "Tarification");
            PdfPTable priceTable = new PdfPTable(2);
            priceTable.setWidthPercentage(100);
            priceTable.setWidths(new float[]{70, 30});
            addPriceRow(priceTable, "Mode de transport", parcel.getTransportMode() != null ? formatEnum(parcel.getTransportMode().name()) : "—");
            addPriceRow(priceTable, "Délai de livraison", parcel.getDeliveryDelay() != null ? formatEnum(parcel.getDeliveryDelay().name()) : "—");
            if (parcel.getWeightKg() != null) {
                addPriceRow(priceTable, "Poids facturable", parcel.getWeightKg() + " kg");
            }
            doc.add(priceTable);
            doc.add(new Paragraph(" "));

            // Total
            PdfPTable totalTable = buildTotalTable(parcel.getEstimatedCost());
            doc.add(totalTable);

            // Footer
            doc.add(new Paragraph(" "));
            addFooter(doc);

            doc.close();
        } catch (Exception e) {
            throw new PdfGenerationException("Erreur génération devis PDF", e);
        }
        return out.toByteArray();
    }

    /**
     * Génère une facture PDF pour un colis validé/en transit/livré.
     */
    public byte[] generateInvoice(Parcel parcel) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 40, 40, 40, 40);
        try {
            PdfWriter.getInstance(doc, out);
            doc.open();

            // Header
            PdfPTable headerTable = new PdfPTable(1);
            headerTable.setWidthPercentage(100);
            PdfPCell headerCell = new PdfPCell();
            headerCell.setBackgroundColor(DARK);
            headerCell.setPadding(20);
            Paragraph title = new Paragraph("FACTURE", new Font(Font.HELVETICA, 24, Font.BOLD, Color.WHITE));
            title.setAlignment(Element.ALIGN_CENTER);
            headerCell.addElement(title);
            Paragraph subtitle = new Paragraph("Youms Logistics — Transport & logistique international",
                    new Font(Font.HELVETICA, 10, Font.NORMAL, GOLD));
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingBefore(8);
            headerCell.addElement(subtitle);
            headerTable.addCell(headerCell);
            doc.add(headerTable);
            doc.add(new Paragraph(" "));

            // Invoice info
            Paragraph ref = new Paragraph("Facture N° : INV-" + parcel.getTrackingNumber(), HEADER_FONT);
            ref.setSpacingAfter(4);
            doc.add(ref);
            Paragraph date = new Paragraph("Date : " + java.time.LocalDate.now()
                    .format(DateTimeFormatter.ofPattern(DATE_FORMAT)), BODY_FONT);
            date.setSpacingAfter(4);
            doc.add(date);
            if (parcel.getValidatedAt() != null) {
                Paragraph validated = new Paragraph("Date de validation : " + java.time.LocalDateTime.ofInstant(parcel.getValidatedAt(), java.time.ZoneId.systemDefault())
                        .format(DateTimeFormatter.ofPattern(DATE_FORMAT)), BODY_FONT);
                validated.setSpacingAfter(12);
                doc.add(validated);
            } else {
                doc.add(new Paragraph(" "));
            }

            // Client
            addSectionTitle(doc, "Client");
            addInfoLine(doc, "Nom", parcel.getSenderName() != null ? parcel.getSenderName() : "—");
            addInfoLine(doc, "Email", parcel.getSenderEmail() != null ? parcel.getSenderEmail() : "—");
            doc.add(new Paragraph(" "));

            // Route
            addSectionTitle(doc, "Trajet");
            addInfoLine(doc, "Départ", parcel.getOriginAddress());
            addInfoLine(doc, "Arrivée", parcel.getDestinationAddress());
            addInfoLine(doc, "Transport", parcel.getTransportMode() != null ? formatEnum(parcel.getTransportMode().name()) : "—");
            addInfoLine(doc, "Délai", parcel.getDeliveryDelay() != null ? formatEnum(parcel.getDeliveryDelay().name()) : "—");
            doc.add(new Paragraph(" "));

            // Line items
            addSectionTitle(doc, "Détail des prestations");
            PdfPTable itemsTable = new PdfPTable(2);
            itemsTable.setWidthPercentage(100);
            itemsTable.setWidths(new float[]{70, 30});
            addPriceRow(itemsTable, "Transport " + (parcel.getTransportMode() != null ? formatEnum(parcel.getTransportMode().name()) : ""), "—");
            if (parcel.getWeightKg() != null) {
                addPriceRow(itemsTable, "Poids facturable (" + parcel.getWeightKg() + " kg)", "—");
            }
            if (parcel.getMaterial() != null) {
                addPriceRow(itemsTable, "Majoration matériau (" + formatEnum(parcel.getMaterial().name()) + ")", "—");
            }
            if (parcel.getDeliveryDelay() != null) {
                addPriceRow(itemsTable, "Majoration délai (" + formatEnum(parcel.getDeliveryDelay().name()) + ")", "—");
            }
            doc.add(itemsTable);
            doc.add(new Paragraph(" "));

            // Total
            PdfPTable totalTable = buildTotalTable(parcel.getEstimatedCost());
            doc.add(totalTable);

            doc.add(new Paragraph(" "));
            addFooter(doc);

            doc.close();
        } catch (Exception e) {
            throw new PdfGenerationException("Erreur génération facture PDF", e);
        }
        return out.toByteArray();
    }

    /**
     * Génère une étiquette d'expédition PDF avec code-barres.
     */
    public byte[] generateShippingLabel(Parcel parcel) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(new Rectangle(226, 340), 15, 15, 15, 15); // ~8cm x 12cm label
        try {
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            doc.open();

            // Gold top bar
            PdfPTable topBar = new PdfPTable(1);
            topBar.setWidthPercentage(100);
            PdfPCell barCell = new PdfPCell();
            barCell.setBackgroundColor(GOLD);
            barCell.setPadding(6);
            Paragraph brand = new Paragraph("YOUMS LOGISTICS", new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE));
            brand.setAlignment(Element.ALIGN_CENTER);
            barCell.addElement(brand);
            topBar.addCell(barCell);
            doc.add(topBar);

            // Tracking number with barcode
            Paragraph tnTitle = new Paragraph("N° de suivi", new Font(Font.HELVETICA, 7, Font.NORMAL, new Color(148, 163, 184)));
            tnTitle.setAlignment(Element.ALIGN_CENTER);
            tnTitle.setSpacingBefore(8);
            doc.add(tnTitle);
            Paragraph tn = new Paragraph(parcel.getTrackingNumber(),
                    new Font(Font.HELVETICA, 16, Font.BOLD, DARK));
            tn.setAlignment(Element.ALIGN_CENTER);
            tn.setSpacingAfter(4);
            doc.add(tn);

            // Barcode
            Barcode128 barcode = new Barcode128();
            barcode.setCode(parcel.getTrackingNumber());
            barcode.setCodeType(Barcode.CODE128);
            barcode.setBarHeight(30);
            barcode.setX(0.8f);
            Image barcodeImg = barcode.createImageWithBarcode(writer.getDirectContent(), Color.BLACK, Color.WHITE);
            Paragraph barcodePara = new Paragraph();
            barcodePara.setAlignment(Element.ALIGN_CENTER);
            barcodeImg.scaleToFit(180, 35);
            barcodePara.add(barcodeImg);
            doc.add(barcodePara);
            doc.add(new Paragraph(" "));

            // Name
            addLabelField(doc, "COLIS", parcel.getName());

            // Route
            Paragraph routeTitle = new Paragraph("TRAJET", new Font(Font.HELVETICA, 7, Font.NORMAL, new Color(148, 163, 184)));
            routeTitle.setSpacingBefore(6);
            doc.add(routeTitle);
            Paragraph route = new Paragraph(
                    parcel.getOriginAddress() + "  →  " + parcel.getDestinationAddress(),
                    new Font(Font.HELVETICA, 9, Font.BOLD, DARK));
            route.setSpacingAfter(4);
            doc.add(route);

            // Info grid
            addLabelField(doc, "TRANSPORT", parcel.getTransportMode() != null ? formatEnum(parcel.getTransportMode().name()) : "—");
            addLabelField(doc, "POIDS", parcel.getWeightKg() != null ? parcel.getWeightKg() + " kg" : "—");
            addLabelField(doc, "STATUT", "En cours");

            doc.add(new Paragraph(" "));
            doc.add(new Paragraph(" "));

            // Footer
            Paragraph footer = new Paragraph("youmslogistics.com  |  +33 3 21 00 00 00",
                    new Font(Font.HELVETICA, 6, Font.NORMAL, new Color(148, 163, 184)));
            footer.setAlignment(Element.ALIGN_CENTER);
            doc.add(footer);

            doc.close();
        } catch (Exception e) {
            throw new PdfGenerationException("Erreur génération étiquette PDF", e);
        }
        return out.toByteArray();
    }

    // ── Helpers ────────────────────────────────────────────────

    private void addSectionTitle(Document doc, String text) throws DocumentException {
        Paragraph p = new Paragraph(text, HEADER_FONT);
        p.setSpacingAfter(6);
        doc.add(p);
    }

    private void addInfoLine(Document doc, String label, String value) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{30, 70});
        PdfPCell labelCell = new PdfPCell(new Paragraph(label, new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(148, 163, 184))));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(3);
        table.addCell(labelCell);
        PdfPCell valueCell = new PdfPCell(new Paragraph(value, BOLD_BODY));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(3);
        table.addCell(valueCell);
        doc.add(table);
    }

    private void addLabelField(Document doc, String label, String value) throws DocumentException {
        Paragraph p = new Paragraph(label + " : ", new Font(Font.HELVETICA, 7, Font.NORMAL, new Color(148, 163, 184)));
        p.add(new Chunk(value, new Font(Font.HELVETICA, 9, Font.BOLD, DARK)));
        p.setSpacingAfter(2);
        doc.add(p);
    }

    private void addPriceRow(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Paragraph(label, BODY_FONT));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(5);
        table.addCell(labelCell);
        PdfPCell valueCell = new PdfPCell(new Paragraph(value, BOLD_BODY));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(5);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(valueCell);
    }

    private void addFooter(Document doc) throws DocumentException {
        Paragraph footer = new Paragraph("Youms Logistics — 5 Rue du Beau Marais, 62100 Calais\n" +
                "contact@youmslogistics.com  |  +33 3 21 00 00 00", SMALL_FONT);
        footer.setAlignment(Element.ALIGN_CENTER);
        doc.add(footer);
    }

    private PdfPTable buildTotalTable(java.math.BigDecimal cost) throws DocumentException {
        PdfPTable totalTable = new PdfPTable(2);
        totalTable.setWidthPercentage(100);
        totalTable.setWidths(new float[]{70, 30});
        PdfPCell totalLabel = new PdfPCell(new Paragraph("TOTAL À PAYER", new Font(Font.HELVETICA, 14, Font.BOLD, DARK)));
        totalLabel.setBorder(Rectangle.NO_BORDER);
        totalLabel.setPadding(12);
        totalLabel.setBackgroundColor(LIGHT_BG);
        totalTable.addCell(totalLabel);
        String costStr = cost != null ? String.format("%.2f €", cost) : "—";
        PdfPCell totalValue = new PdfPCell(new Paragraph(costStr, new Font(Font.HELVETICA, 14, Font.BOLD, GOLD)));
        totalValue.setBorder(Rectangle.NO_BORDER);
        totalValue.setPadding(12);
        totalValue.setBackgroundColor(LIGHT_BG);
        totalValue.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totalTable.addCell(totalValue);
        return totalTable;
    }

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

    /** Custom exception for PDF generation errors. */
    public static class PdfGenerationException extends RuntimeException {
        public PdfGenerationException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
