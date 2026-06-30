package com.novahexa.tracking.dto;

import jakarta.validation.constraints.NotBlank;

public record RefuseRequest(@NotBlank String reason) {}
