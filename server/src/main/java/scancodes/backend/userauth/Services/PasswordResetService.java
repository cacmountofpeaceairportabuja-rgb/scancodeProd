package scancodes.backend.userauth.Services;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import scancodes.backend.userauth.Entity.AppUserEntity;
import scancodes.backend.userauth.Repository.UserRepository;
import scancodes.backend.userauth.Token.PasswordResetToken;
import scancodes.backend.userauth.Token.PasswordResetTokenRepository;
import scancodes.backend.userauth.Token.SecureToken;    
import org.springframework.security.crypto.password.PasswordEncoder;


@Service
public class PasswordResetService {
  private final UserRepository userRepository;
  private final PasswordResetTokenRepository tokenRepository;
  private final PasswordEncoder passwordEncoder;
  private final EmailSender emailSender;

  public PasswordResetService(UserRepository userRepository,
                              PasswordResetTokenRepository tokenRepository,
                              PasswordEncoder passwordEncoder,
                              EmailSender emailSender) {
    this.userRepository = userRepository;
    this.tokenRepository = tokenRepository;
    this.passwordEncoder = passwordEncoder;
    this.emailSender = emailSender;
  }

  @Transactional
  public void requestReset(String email) {
    var normalizedEmail = email.toLowerCase(Locale.ROOT);
    var userOpt = userRepository.findByEmail(normalizedEmail);
    if (userOpt.isEmpty()) {
      return; // Don't reveal if email exists
    }

    var rawToken = SecureToken.generateUrlSafe(32);
    var tokenHash = SecureToken.sha256Hex(rawToken);

    var token = new PasswordResetToken();
    token.setUser(userOpt.get());
    token.setTokenHash(tokenHash);
    token.setCreatedAt(Instant.now());
    token.setExpiresAt(Instant.now().plus(Duration.ofMinutes(15)));
    tokenRepository.save(token);

    var link = "https://yourapp/reset-password?token=" + rawToken;
    emailSender.send(normalizedEmail, "Reset your password", "Click: " + link);
  }

  @Transactional
  public void resetPassword(String rawToken, String newPassword) {
    var tokenHash = SecureToken.sha256Hex(rawToken);
    var token = tokenRepository.findValid(tokenHash, Instant.now())
      .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

    var user = (AppUserEntity) token.getUser();
    user.setPasswordHash(passwordEncoder.encode(newPassword));
    tokenRepository.save(token);
  }
}   
