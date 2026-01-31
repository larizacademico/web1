package com.projetomilhas.backend.service;

import com.projetomilhas.backend.entity.Purchase;
import com.projetomilhas.backend.entity.UserEntity;
import com.projetomilhas.backend.repository.PurchaseRepository;
import com.projetomilhas.backend.repository.UserRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.awt.Color;
import java.io.PrintWriter;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class ExportService {

    private final PurchaseRepository purchaseRepository;
    private final UserRepository userRepository;

    public ExportService(PurchaseRepository purchaseRepository, UserRepository userRepository) {
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

            writer.println("Data,Valor,Pontos,Status,Cartão,Descrição");

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
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao gerar CSV");
        }
    }

    public void exportComprasPDF(String email, HttpServletResponse response) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));

        List<Purchase> compras = purchaseRepository.findByUserId(user.getId());

        // ordena por data (opcional, mas fica com cara de relatório)
        compras.sort(Comparator.comparing(p -> {
            LocalDateTime d = p.getPurchaseDate();
            return d != null ? d : LocalDateTime.MIN;
        }));

        try {
            response.setContentType("application/pdf");
            response.setHeader(
                    "Content-Disposition",
                    "attachment; filename=compras-" + LocalDate.now() + ".pdf"
            );

            Document doc = new Document(PageSize.A4, 36, 36, 48, 42);
            PdfWriter writer = PdfWriter.getInstance(doc, response.getOutputStream());
            writer.setPageEvent(new FooterPageEvent());

            doc.open();

            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            Font small = new Font(Font.HELVETICA, 10, Font.NORMAL);
            Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD, Color.WHITE);
            Font cellFont = new Font(Font.HELVETICA, 10, Font.NORMAL);

            DateTimeFormatter fmtMeta = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            DateTimeFormatter fmtData = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            NumberFormat brl = NumberFormat.getCurrencyInstance(new Locale("pt", "BR"));

            doc.add(new Paragraph("Relatório de Compras", titleFont));
            doc.add(new Paragraph("Usuário: " + user.getEmail(), small));
            doc.add(new Paragraph("Gerado em: " + LocalDate.now().format(fmtMeta), small));
            doc.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.2f, 1.0f, 0.8f, 1.1f, 1.1f, 2.2f});
            table.setHeaderRows(1);

            Color headerBg = new Color(60, 60, 60);

            addHeader(table, "Data", headerFont, headerBg);
            addHeader(table, "Valor", headerFont, headerBg);
            addHeader(table, "Pontos", headerFont, headerBg);
            addHeader(table, "Status", headerFont, headerBg);
            addHeader(table, "Cartão", headerFont, headerBg);
            addHeader(table, "Descrição", headerFont, headerBg);

            Color zebra = new Color(245, 245, 245);

            for (int i = 0; i < compras.size(); i++) {
                Purchase p = compras.get(i);
                Color bg = (i % 2 == 0) ? Color.WHITE : zebra;

                String data = p.getPurchaseDate() != null ? p.getPurchaseDate().format(fmtData) : "-";
                String valor = brl.format(p.getAmount() != null ? p.getAmount() : 0.0);
                String pontos = String.valueOf(p.getPointsGenerated() != null ? p.getPointsGenerated() : 0);

                String statusRaw = p.getStatus() != null ? p.getStatus().name() : "";
                String status = "CREDITED".equalsIgnoreCase(statusRaw) ? "CREDITADO"
                        : "PENDING".equalsIgnoreCase(statusRaw) ? "PENDENTE"
                        : (statusRaw.isBlank() ? "-" : statusRaw);

                String cartao = p.getCard() != null ? p.getCard().getName() : "-";
                String desc = p.getDescription() != null ? p.getDescription() : "-";

                addCell(table, data, cellFont, bg);
                addCell(table, valor, cellFont, bg);
                addCell(table, pontos, cellFont, bg);
                addCell(table, status, cellFont, bg);
                addCell(table, cartao, cellFont, bg);
                addCell(table, desc, cellFont, bg);
            }

            doc.add(table);
            doc.close();
            writer.flush();

        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao gerar PDF");
        }
    }

    private void addHeader(PdfPTable table, String text, Font font, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setPadding(7);
        cell.setBorderColor(new Color(90, 90, 90));
        table.addCell(cell);
    }

    private void addCell(PdfPTable table, String text, Font font, Color bg) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setPadding(7);
        cell.setBorderColor(new Color(210, 210, 210));
        table.addCell(cell);
    }

    private static class FooterPageEvent extends PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();
            Font font = new Font(Font.HELVETICA, 9, Font.NORMAL, new Color(120, 120, 120));

            Phrase left = new Phrase("Minhas Milhas • Relatório de Compras", font);
            Phrase right = new Phrase("Página " + writer.getPageNumber(), font);

            ColumnText.showTextAligned(
                    cb,
                    Element.ALIGN_LEFT,
                    left,
                    document.left(),
                    document.bottom() - 18,
                    0
            );

            ColumnText.showTextAligned(
                    cb,
                    Element.ALIGN_RIGHT,
                    right,
                    document.right(),
                    document.bottom() - 18,
                    0
            );
        }
    }
}
