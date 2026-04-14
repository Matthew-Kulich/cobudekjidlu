package cz.matej.cobudekjidlu.user;

import cz.matej.cobudekjidlu.user.dto.AuthUserResponse;
import cz.matej.cobudekjidlu.user.dto.LoginRequest;
import cz.matej.cobudekjidlu.user.dto.RegisterRequest;
import cz.matej.cobudekjidlu.user.model.AppUser;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@Service
public class AuthService {

    public static final String USER_ID_SESSION_KEY = "currentUserId";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AuthUserResponse register(RegisterRequest request, HttpSession session) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new ResponseStatusException(BAD_REQUEST, "Email uz je pouzity.");
        }

        AppUser user = new AppUser();
        user.setDisplayName(request.displayName());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        AppUser savedUser = userRepository.save(user);
        session.setAttribute(USER_ID_SESSION_KEY, savedUser.getId());
        return toResponse(savedUser);
    }

    public AuthUserResponse login(LoginRequest request, HttpSession session) {
        AppUser user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Neplatny email nebo heslo."));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(UNAUTHORIZED, "Neplatny email nebo heslo.");
        }

        session.setAttribute(USER_ID_SESSION_KEY, user.getId());
        return toResponse(user);
    }

    public AuthUserResponse getCurrentUser(HttpSession session) {
        Long userId = (Long) session.getAttribute(USER_ID_SESSION_KEY);
        if (userId == null) {
            return null;
        }

        return userRepository.findById(userId)
                .map(this::toResponse)
                .orElse(null);
    }

    public void logout(HttpSession session) {
        session.invalidate();
    }

    public AppUser requireCurrentUser(HttpSession session) {
        Long userId = (Long) session.getAttribute(USER_ID_SESSION_KEY);
        if (userId == null) {
            throw new ResponseStatusException(UNAUTHORIZED, "Pro tuhle akci se musis prihlasit.");
        }

        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Uzivatel nebyl nalezen."));
    }

    public AppUser findCurrentUser(HttpSession session) {
        Long userId = (Long) session.getAttribute(USER_ID_SESSION_KEY);
        if (userId == null) {
            return null;
        }

        return userRepository.findById(userId).orElse(null);
    }

    private AuthUserResponse toResponse(AppUser user) {
        return new AuthUserResponse(user.getId(), user.getEmail(), user.getDisplayName());
    }
}

