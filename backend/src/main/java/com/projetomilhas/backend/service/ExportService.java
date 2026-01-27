package com.projetomilhas.backend.service;

import com.projetomilhas.backend.entity.Purchase;
import com.projetomilhas.backend.entity.UserEntity;
import com.projetomilhas.backend.repository.PurchaseRepository;
import com.projetomilhas.backend.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.PrintWriter;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ExportService {

    private final PurchaseRepository purchaseRepository;
    private final UserRepository userRepository;

    public ExportService(PurchaseRepository purchaseRepository,
                         UserRepository userRepository) {
        this.purchaseRepository = purchaseRepository;
        this.userRepository = userRepository;
    }

    public void exportComprasCSV(String email, HttpServletResponse response) {

        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        List<Purchase> compras = purchaseRepository.findByUserId(user.getId());

        try {
            response.setContentType("text/csv; charset=UTF-8");
            response.setHeader(
                    "Content-Disposition",
                    "attachment; filename=compras-" + LocalDate.now() + ".csv"
            );

            PrintWriter writer = response.getWriter();

            // Cabeçalho
            writer.println("Data,Valor,Pontos,Status,Cartao,Descricao");

            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

            for (Purchase p : compras) {

                String data = p.getPurchaseDate() != null ? p.getPurchaseDate().format(fmt) : "";
                String cartao = p.getCard() != null ? p.getCard().getName() : "";
                String descricao = p.getDescription() != null ? p.getDescription() : "";

                // Escapa aspas duplas para CSV
                descricao = descricao.replace("\"", "\"\"");

                writer.printf(
                        "\"%s\",%.2f,%d,%s,\"%s\",\"%s\"%n",
                        data,
                        p.getAmount(),
                        p.getPointsGenerated(),
                        p.getStatus(),
                        cartao,
                        descricao
                );
            }

            writer.flush();

        } catch (Exception ex) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Erro ao gerar CSV"
            );
        }
    }
}
