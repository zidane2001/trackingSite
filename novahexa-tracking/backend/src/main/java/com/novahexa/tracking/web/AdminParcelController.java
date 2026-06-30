package com.novahexa.tracking.web;

import com.novahexa.tracking.domain.AppUser;
import com.novahexa.tracking.dto.ParcelView;
import com.novahexa.tracking.dto.RefuseRequest;
import com.novahexa.tracking.repository.AppUserRepository;
import com.novahexa.tracking.service.ParcelService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/packages")
public class AdminParcelController {

    private final ParcelService parcels;
    private final AppUserRepository users;

    public AdminParcelController(ParcelService parcels, AppUserRepository users) {
        this.parcels = parcels;
        this.users = users;
    }

    /** File de validation (cahier §6.2). status=PENDING (défaut) ou ALL. */
    @GetMapping
    public List<ParcelView> list(@RequestParam(defaultValue = "PENDING") String status) {
        var source = "ALL".equalsIgnoreCase(status) ? parcels.listAll() : parcels.listPending();
        return source.stream().map(ParcelView::of).toList();
    }

    @PatchMapping("/{trackingNumber}/validate")
    public ParcelView validate(@PathVariable String trackingNumber, Authentication auth) {
        AppUser admin = (auth != null)
                ? users.findByEmail(auth.getName()).orElse(null)
                : null;
        return ParcelView.of(parcels.validate(trackingNumber, admin));
    }

    @PatchMapping("/{trackingNumber}/refuse")
    public ParcelView refuse(@PathVariable String trackingNumber, @Valid @RequestBody RefuseRequest body) {
        return ParcelView.of(parcels.refuse(trackingNumber, body.reason()));
    }
}
