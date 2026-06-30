package com.novahexa.tracking.config;

import com.novahexa.tracking.domain.AppUser;
import com.novahexa.tracking.domain.Role;
import com.novahexa.tracking.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final AppUserRepository users;
    private final PasswordEncoder encoder;

    @Value("${app.admin.email:admin@novahexa.local}")
    private String adminEmail;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    public DataSeeder(AppUserRepository users, PasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (!users.existsByEmail(adminEmail)) {
            AppUser admin = new AppUser();
            admin.setFullName("Administrateur Novahexa");
            admin.setEmail(adminEmail);
            admin.setPasswordHash(encoder.encode(adminPassword));
            admin.setRole(Role.ADMIN);
            admin.setVerified(true);
            users.save(admin);
            System.out.println(">>> Compte admin créé : " + adminEmail + " / " + adminPassword);
        }
    }
}
