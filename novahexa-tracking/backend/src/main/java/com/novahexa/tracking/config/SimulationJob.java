package com.novahexa.tracking.config;

import com.novahexa.tracking.service.SimulationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Cahier §7.2 : Tâche planifiée qui recalcule régulièrement la position simulée
 * de chaque colis « en transit » et déclenche les événements (passage de point
 * d'arrêt, livraison) en conséquence.
 *
 * Runs every 60 seconds.
 */
@Component
public class SimulationJob {

    private static final Logger log = LoggerFactory.getLogger(SimulationJob.class);

    private final SimulationService simulationService;

    public SimulationJob(SimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @Scheduled(fixedRate = 60000) // Every 60 seconds
    public void run() {
        log.debug("[SimulationJob] Tick started");
        simulationService.tick();
        log.debug("[SimulationJob] Tick completed");
    }
}
