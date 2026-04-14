package cz.matej.cobudekjidlu.user.dto;

public record AuthUserResponse(
        Long id,
        String email,
        String displayName
) {
}

