package com.novahexa.tracking.web;

import com.novahexa.tracking.domain.Parcel;
import com.novahexa.tracking.service.PdfService;
import com.novahexa.tracking.service.ParcelService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pdf")
public class PdfController {

    private final PdfService pdfService;
    private final ParcelService parcelService;

    public PdfController(PdfService pdfService, ParcelService parcelService) {
        this.pdfService = pdfService;
        this.parcelService = parcelService;
    }

    /**
     * Télécharger le devis PDF d'un colis.
     */
    @GetMapping("/quote/{trackingNumber}")
    public ResponseEntity<byte[]> downloadQuote(@PathVariable String trackingNumber) {
        Parcel parcel = parcelService.getByTrackingNumber(trackingNumber);
        byte[] pdf = pdfService.generateQuote(parcel);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename("devis-" + trackingNumber + ".pdf")
                .build());
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    /**
     * Télécharger la facture PDF d'un colis.
     */
    @GetMapping("/invoice/{trackingNumber}")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable String trackingNumber) {
        Parcel parcel = parcelService.getByTrackingNumber(trackingNumber);
        byte[] pdf = pdfService.generateInvoice(parcel);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename("facture-" + trackingNumber + ".pdf")
                .build());
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    /**
     * Télécharger l'étiquette d'expédition PDF.
     */
    @GetMapping("/label/{trackingNumber}")
    public ResponseEntity<byte[]> downloadLabel(@PathVariable String trackingNumber) {
        Parcel parcel = parcelService.getByTrackingNumber(trackingNumber);
        byte[] pdf = pdfService.generateShippingLabel(parcel);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDisposition(ContentDisposition.builder("attachment")
                .filename("etiquette-" + trackingNumber + ".pdf")
                .build());
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }
}
