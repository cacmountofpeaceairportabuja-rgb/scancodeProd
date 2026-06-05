package scancodes.backend.userauth.Controller;

import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import scancodes.backend.userauth.Repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
public class AuthApiController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;

    public AuthApiController(AuthenticationManager authenticationManager, UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body,
            HttpServletRequest request) {
        var emailOrUsername = body.getOrDefault("email", body.get("username"));
        var password = body.get("password");

        // Try to resolve username if an email was provided
        var userOpt = userRepository.findByEmail(emailOrUsername);
        String username = userOpt.map(u -> u.getUsername()).orElse(emailOrUsername);

        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(username, password);
        Authentication auth = authenticationManager.authenticate(token);

        // store in security context and create session (JSESSIONID cookie)
        SecurityContextHolder.getContext().setAuthentication(auth);
        request.getSession(true);

        var user = userRepository.findByUsername(username).orElseThrow();

        var resp = new java.util.HashMap<String, Object>();
        resp.put("user", Map.of("username", user.getUsername(), "email", user.getEmail()));
        resp.put("token", null);

        return ResponseEntity.ok(resp);
    }
}
