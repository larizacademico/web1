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
import java.nio.charset.StandardCharsets;
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
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.setContentType("text/csv; charset=UTF-8");
            response.setHeader(
                    "Content-Disposition",
                    "attachment; filename=compras-" + LocalDate.now() + ".csv"
            );

            // BOM UTF-8 para Excel não quebrar acentos
            response.getOutputStream().write(0xEF);
            response.getOutputStream().write(0xBB);
            response.getOutputStream().write(0xBF);

            PrintWriter writer = response.getWriter();

            // Cabeçalho com acento
            writer.println("Data,Valor,Pontos,Status,Cartão,Descrição");

            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

            for (Purchase p : compras) {
                String data = p.getPurchaseDate() != null ? p.getPurchaseDate().format(fmt) : "";
                String cartao = p.getCard() != null ? p.getCard().getName() : "";
                String descricao = p.getDescription() != null ? p.getDescription() : "";

                writer.printf("%s,%s,%s,%s,%s,%s%n",
                        csv(data),
                        csv(String.format("%.2f", p.getAmount())),
                        csv(String.valueOf(p.getPointsGenerated())),
                        csv(String.valueOf(p.getStatus())),
                        csv(cartao),
                        csv(descricao)
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

    // CSV safe: aspas + quebra de linha + vírgula
    private String csv(String s) {
        if (s == null) return "\"\"";
        String v = s.replace("\"", "\"\"");
        return "\"" + v + "\"";
    }
}
