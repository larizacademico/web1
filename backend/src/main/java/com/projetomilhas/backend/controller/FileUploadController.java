package com.projetomilhas.backend.controller;

import com.projetomilhas.backend.service.FileUploadService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController
@RequestMapping("/api/compras")
public class FileUploadController {

    private final FileUploadService fileUploadService;

    public FileUploadController(FileUploadService fileUploadService) {
        this.fileUploadService = fileUploadService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadReceipt(@RequestParam("file") MultipartFile file,
                                           @RequestParam("purchaseId") Long purchaseId,
                                           Principal principal,
                                           HttpServletResponse response) {
        return fileUploadService.uploadReceipt(file, purchaseId, principal.getName());
    }
}
