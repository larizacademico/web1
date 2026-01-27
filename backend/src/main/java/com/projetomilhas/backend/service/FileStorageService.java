package com.projetomilhas.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    private final Path uploadDir;
    private final List<String> allowedContentTypes =
            List.of("application/pdf", "image/png", "image/jpeg", "image/jpg");

    private final long maxFileSize;

    public FileStorageService(
            @Value("${app.upload-dir:uploads}") String uploadDir,
            @Value("${app.upload-max-size-bytes:10485760}") long maxFileSize // 10MB default
    ) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.maxFileSize = maxFileSize;
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível criar diretório de uploads", e);
        }
    }

    /**
     * Salva o arquivo e retorna o nome gerado (somente o filename).
     */
    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio");
        }

        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("Arquivo excede o tamanho máximo permitido");
        }

        String contentType = file.getContentType();
        if (contentType == null || !allowedContentTypes.contains(contentType)) {
            throw new IllegalArgumentException("Tipo de arquivo não suportado");
        }

        String original = StringUtils.cleanPath(file.getOriginalFilename());
        if (original.contains("..")) {
            throw new IllegalArgumentException("Nome de arquivo inválido");
        }

        String extension = "";
        int i = original.lastIndexOf('.');
        if (i >= 0) extension = original.substring(i);

        String filename = UUID.randomUUID().toString() + extension;
        Path target = uploadDir.resolve(filename);

        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            logger.info("Arquivo salvo: {}", target.toString());
            return filename;
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar arquivo", e);
        }
    }

    public Path loadPath(String filename) {
        return uploadDir.resolve(filename).normalize();
    }
}
