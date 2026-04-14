package cz.matej.cojist.user.dto;

public record AuthUserResponse(
        Long id,
        String email,
        String displayName
) {
}
