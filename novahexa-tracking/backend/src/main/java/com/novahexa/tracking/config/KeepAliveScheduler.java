package com.novahexa.tracking.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
public class KeepAliveScheduler {

    private static final Logger log = LoggerFactory.getLogger(KeepAliveScheduler.class);

    @Value("${app.keep-alive.url:}")
    private String keepAliveUrl;

    private final WebClient webClient = WebClient.builder().build();

    @Scheduled(fixedRate = 180000) // Every 3 minutes
    public void ping() {
        if (keepAliveUrl == null || keepAliveUrl.isBlank()) {
            return;
        }
        try {
            String response = webClient.get()
                    .uri(keepAliveUrl)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            log.debug("[KeepAlive] Ping successful: {}", response);
        } catch (Exception e) {
            log.warn("[KeepAlive] Ping failed: {}", e.getMessage());
        }
    }
}
