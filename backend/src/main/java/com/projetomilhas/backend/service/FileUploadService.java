package com.projetomilhas.backend.service;

import com.projetomilhas.backend.entity.Purchase;
import com.projetomilhas.backend.entity.UserEntity;
import com.projetomilhas.backend.repository.PurchaseRepository;
import com.projetomilhas.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.projetomilhas.backend.service.FileStorageService;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Service
public class FileUploadService {

    private static final Logger logger = LoggerFactory.getLogger(FileUploadService.class);

    private final FileStorageService fileStorageService;
    private final PurchaseRepository purchaseRepository;
    private final UserRepository userRepository;

    public FileUploadService(FileStorageService fileStorageService,
                             PurchaseRepository purchaseRepository,
                             UserRepository userRepository) {
        this.fileStorageService = fileStorageService;
        this.purchaseRepository = purchaseRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ResponseEntity<?> uploadReceipt(MultipartFile file,
                                           Long purchaseId,
                                           String userEmail) {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("Arquivo ausente ou vazio");
        }

        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        Purchase purchase = purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Compra não encontrada"));

        if (!purchase.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Você não tem permissão para alterar esta compra");
        }

        try {
            // Validação e armazenamento do arquivo
            String filename = fileStorageService.storeFile(file);

            purchase.setReceiptPath(filename);
            purchaseRepository.save(purchase);

            String downloadUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/files/")
                    .path(filename)
                    .toUriString();

            var responseBody = java.util.Map.of(
                    "filename", filename,
                    "downloadUrl", downloadUrl
            );

            logger.info("Upload concluído — purchaseId={} filename={} userId={}",
                    purchaseId, filename, user.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(responseBody);

        } catch (IllegalArgumentException ex) {
            logger.warn("Upload inválido para purchaseId={}: {}", purchaseId, ex.getMessage());
            return ResponseEntity.badRequest().body("Arquivo inválido: " + ex.getMessage());

        } catch (Exception ex) {
            logger.error("Erro ao salvar comprovante para purchaseId=" + purchaseId, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erro ao processar upload");
        }
    }
}
