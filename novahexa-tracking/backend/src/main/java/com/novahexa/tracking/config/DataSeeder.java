package com.novahexa.tracking.config;

import com.novahexa.tracking.domain.*;
import com.novahexa.tracking.repository.AppUserRepository;
import com.novahexa.tracking.repository.ParcelRepository;
import com.novahexa.tracking.service.TrackingNumberService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final AppUserRepository users;
    private final PasswordEncoder encoder;
    private final JdbcTemplate jdbc;
    private final ParcelRepository parcels;
    private final TrackingNumberService trackingNumbers;

    @Value("${app.admin.email:admin@youmslogistics.local}")
    private String adminEmail;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    public DataSeeder(AppUserRepository users, PasswordEncoder encoder, JdbcTemplate jdbc,
                       ParcelRepository parcels, TrackingNumberService trackingNumbers) {
        this.users = users;
        this.encoder = encoder;
        this.jdbc = jdbc;
        this.parcels = parcels;
        this.trackingNumbers = trackingNumbers;
    }

    @Override
    public void run(String... args) {
        // Supprimer la contrainte CHECK obsolète sur event_type si elle existe
        try {
            jdbc.execute("ALTER TABLE tracking_events DROP CONSTRAINT IF EXISTS tracking_events_event_type_check");
        } catch (Exception e) {
            log.warn("Impossible de supprimer la contrainte tracking_events_event_type_check : {}", e.getMessage());
        }

        // ── Migrer les anciens numéros NHX-* vers le nouveau format YL-XXXXXXXX-FR ──
        try {
            jdbc.execute("UPDATE packages SET tracking_number = 'YL-' || floor(random() * 90000000 + 10000000)::text || '-FR' WHERE tracking_number LIKE 'NHX-%'");
            log.info("[DataSeeder] Anciens numéros NHX migrés vers le format YL-XXXXXXXX-FR");
        } catch (Exception e) {
            log.warn("Migration NHX impossible (normal si aucun colis NHX): {}", e.getMessage());
        }

        // Seed 5 colis pour zidanetenkeu@gmail.com
        users.findByEmail("zidanetenkeu@gmail.com").ifPresent(owner -> {
            if (parcels.findByOwner_IdOrderByCreatedAtDesc(owner.getId()).isEmpty()) {
                record Seed(String name, String origin, String dest, TransportMode mode,
                            MaterialType mat, double kg, ParcelStatus status, double cost) {}
                List<Seed> seeds = List.of(
                    new Seed("Pièces moteur",       "Douala, CM",    "Lille, FR",    TransportMode.AIR,   MaterialType.AUTO_PARTS,  12.5, ParcelStatus.DELIVERED,  187.50),
                    new Seed("Ordinateur portable", "Paris, FR",     "Yaoundé, CM",  TransportMode.AIR,   MaterialType.ELECTRONIQUE, 2.3, ParcelStatus.IN_TRANSIT, 210.00),
                    new Seed("Documents notariés",  "Lyon, FR",      "Douala, CM",   TransportMode.AIR,   MaterialType.DOCUMENTS,    0.5, ParcelStatus.VALIDATED,   95.00),
                    new Seed("Mobilier salon",       "Marseille, FR", "Abidjan, CI",  TransportMode.MER,   MaterialType.GENERAL,     85.0, ParcelStatus.PENDING,    340.00),
                    new Seed("Équipement médical",   "Berlin, DE",    "Dakar, SN",    TransportMode.ROUTE, MaterialType.FRAGILE,      18.0, ParcelStatus.REFUSED,    155.00)
                );
                for (Seed s : seeds) {
                    Parcel p = new Parcel();
                    p.setTrackingNumber(trackingNumbers.generateUnique());
                    p.setOwner(owner);
                    p.setSenderName(owner.getFullName());
                    p.setSenderEmail(owner.getEmail());
                    p.setName(s.name());
                    p.setOriginAddress(s.origin());
                    p.setDestinationAddress(s.dest());
                    p.setTransportMode(s.mode());
                    p.setMaterial(s.mat());
                    p.setWeightKg(BigDecimal.valueOf(s.kg()));
                    p.setEstimatedCost(BigDecimal.valueOf(s.cost()));
                    p.setStatus(s.status());
                    p.setShippingDate(LocalDate.now().plusDays(3));
                    if (s.status() == ParcelStatus.REFUSED)
                        p.setRefusalReason("Adresse de livraison non desservie");
                    parcels.save(p);
                }
                log.info(">>> 5 colis seed créés pour zidanetenkeu@gmail.com");
            }
        });

        if (!users.existsByEmail(adminEmail)) {
            AppUser admin = new AppUser();
            admin.setFullName("Administrateur Youms Logistics");
            admin.setEmail(adminEmail);
            admin.setPasswordHash(encoder.encode(adminPassword));
            admin.setRole(Role.ADMIN);
            admin.setVerified(true);
            users.save(admin);
            log.info(">>> Compte admin créé : {}", adminEmail);
        }
    }
}
