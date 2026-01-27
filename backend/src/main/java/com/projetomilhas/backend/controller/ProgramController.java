package com.projetomilhas.backend.controller;

import com.projetomilhas.backend.dto.program.ProgramResponse;
import com.projetomilhas.backend.entity.Program;
import com.projetomilhas.backend.service.ProgramService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/programs")
@CrossOrigin(origins = "http://localhost:5173")
public class ProgramController {

    private final ProgramService programService;

    public ProgramController(ProgramService programService) {
        this.programService = programService;
    }

    @GetMapping
    public List<ProgramResponse> listarProgramas() {
        return programService.findAll()
                .stream()
                .map(ProgramResponse::fromEntity)
                .toList();
    }

    @PostMapping
    public ProgramResponse criar(@RequestBody Program program) {
        Program salvo = programService.create(program);
        return ProgramResponse.fromEntity(salvo);
    }
}
