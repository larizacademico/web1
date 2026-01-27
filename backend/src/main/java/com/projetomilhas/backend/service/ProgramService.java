package com.projetomilhas.backend.service;

import com.projetomilhas.backend.entity.Program;
import com.projetomilhas.backend.repository.ProgramRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProgramService {

    private final ProgramRepository programRepository;

    // =========================
    // CRUD BÁSICO
    // =========================

    public List<Program> listarTodos() {
        return programRepository.findAll();
    }

    public Program buscarPorId(Long id) {
        return programRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programa não encontrado"));
    }

    public Program criar(Program program) {
        validarPrograma(program);

        programRepository.findByName(program.getName())
                .ifPresent(p -> {
                    throw new IllegalArgumentException("Já existe um programa com esse nome");
                });

        return programRepository.save(program);
    }

    public Program atualizar(Long id, Program novo) {
        Program existente = buscarPorId(id);

        if (!existente.getName().equals(novo.getName())) {
            programRepository.findByName(novo.getName())
                    .ifPresent(p -> {
                        throw new IllegalArgumentException("Já existe um programa com esse nome");
                    });
        }

        existente.setName(novo.getName());
        existente.setDescription(novo.getDescription());
        existente.setBalance(novo.getBalance());
        existente.setDefaultCreditDays(novo.getDefaultCreditDays());
        existente.setMultiplier(novo.getMultiplier());

        return programRepository.save(existente);
    }

    public void deletar(Long id) {
        Program program = buscarPorId(id);
        programRepository.delete(program);
    }

    // =========================
    // REGRAS DE NEGÓCIO
    // =========================

    public Program criarLiveloPadrao() {
        return programRepository.findByName("Livelo")
                .orElseGet(() -> {
                    Program livelo = new Program();
                    livelo.setName("Livelo");
                    livelo.setDescription("Programa padrão Livelo");
                    livelo.setBalance(0L);
                    livelo.setDefaultCreditDays(30);
                    livelo.setMultiplier(1.0);
                    return programRepository.save(livelo);
                });
    }

    public Program adicionarSaldo(Long programId, Long valor) {
        if (valor == null || valor <= 0) {
            throw new IllegalArgumentException("Valor deve ser maior que zero");
        }

        Program program = buscarPorId(programId);
        program.setBalance(program.getBalance() + valor);
        return programRepository.save(program);
    }

    public Program debitarSaldo(Long programId, Long valor) {
        if (valor == null || valor <= 0) {
            throw new IllegalArgumentException("Valor deve ser maior que zero");
        }

        Program program = buscarPorId(programId);

        if (program.getBalance() < valor) {
            throw new IllegalArgumentException("Saldo insuficiente");
        }

        program.setBalance(program.getBalance() - valor);
        return programRepository.save(program);
    }

    // =========================
    // VALIDAÇÕES
    // =========================

    private void validarPrograma(Program program) {
        if (program == null)
            throw new IllegalArgumentException("Programa não pode ser nulo");

        if (program.getName() == null || program.getName().isBlank())
            throw new IllegalArgumentException("Nome do programa é obrigatório");

        if (program.getBalance() == null || program.getBalance() < 0)
            throw new IllegalArgumentException("Saldo inválido");

        if (program.getDefaultCreditDays() == null || program.getDefaultCreditDays() <= 0)
            throw new IllegalArgumentException("Prazo de crédito inválido");

        if (program.getMultiplier() == null || program.getMultiplier() <= 0)
            throw new IllegalArgumentException("Multiplicador inválido");
    }
    public List<Program> findAll() {
        return programRepository.findAll();
    }
    public Program create(Program program) {
        program.setId(null);
        return programRepository.save(program);
    }


}
