package com.projetomilhas.backend.dto.program;

import com.projetomilhas.backend.entity.Program;
import lombok.Data;

@Data
public class ProgramResponse {
    private Long id;
    private String name;
    private Double multiplier;
    private Integer defaultCreditDays;
    private Long balance;

    public static ProgramResponse fromEntity(Program p) {
        ProgramResponse r = new ProgramResponse();
        r.setId(p.getId());
        r.setName(p.getName());
        r.setMultiplier(p.getMultiplier());
        r.setDefaultCreditDays(p.getDefaultCreditDays());
        r.setBalance(p.getBalance());
        return r;
    }
}
