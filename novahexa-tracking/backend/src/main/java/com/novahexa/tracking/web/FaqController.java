package com.novahexa.tracking.web;

import com.novahexa.tracking.domain.FaqItem;
import com.novahexa.tracking.repository.FaqItemRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class FaqController {

    private final FaqItemRepository repo;

    public FaqController(FaqItemRepository repo) {
        this.repo = repo;
    }

    /** Liste publique des FAQ activées. */
    @GetMapping("/faq")
    public List<FaqItem> listPublic() {
        return repo.findByEnabledTrueOrderBySortOrderAsc();
    }

    /** Liste admin de toutes les FAQ (activées + désactivées). */
    @GetMapping("/admin/faq")
    public List<FaqItem> listAll() {
        return repo.findAllByOrderBySortOrderAsc();
    }

    /** Créer une FAQ. */
    @PostMapping("/admin/faq")
    @ResponseStatus(HttpStatus.CREATED)
    public FaqItem create(@RequestBody FaqItem body) {
        FaqItem item = new FaqItem();
        item.setQuestion(body.getQuestion());
        item.setAnswer(body.getAnswer());
        item.setSortOrder(body.getSortOrder());
        item.setEnabled(body.isEnabled());
        return repo.save(item);
    }

    /** Modifier une FAQ. */
    @PutMapping("/admin/faq/{id}")
    public FaqItem update(@PathVariable UUID id, @RequestBody FaqItem body) {
        FaqItem item = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "FAQ introuvable"));
        item.setQuestion(body.getQuestion());
        item.setAnswer(body.getAnswer());
        item.setSortOrder(body.getSortOrder());
        item.setEnabled(body.isEnabled());
        return repo.save(item);
    }

    /** Supprimer une FAQ. */
    @DeleteMapping("/admin/faq/{id}")
    public Map<String, String> delete(@PathVariable UUID id) {
        repo.deleteById(id);
        return Map.of("status", "deleted");
    }
}
