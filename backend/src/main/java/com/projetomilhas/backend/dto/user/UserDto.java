package com.projetomilhas.backend.dto.user;

import com.projetomilhas.backend.entity.UserEntity;
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String name;
    private String email;

    public static UserDto fromEntity(UserEntity u) {
        UserDto r = new UserDto();
        r.setId(u.getId());
        r.setName(u.getName());
        r.setEmail(u.getEmail());
        return r;
    }
}
