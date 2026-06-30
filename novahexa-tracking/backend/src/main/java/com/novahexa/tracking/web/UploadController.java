package com.novahexa.tracking.web;

import com.novahexa.tracking.service.CloudinaryService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
public class UploadController {

    private final CloudinaryService cloudinary;

    public UploadController(CloudinaryService cloudinary) {
        this.cloudinary = cloudinary;
    }

    /** Téléverse la photo du colis vers Cloudinary et renvoie son URL. */
    @PostMapping
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) throws IOException {
        return Map.of("url", cloudinary.upload(file));
    }
}
