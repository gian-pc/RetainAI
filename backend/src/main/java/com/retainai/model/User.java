package com.retainai.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails; // <--- Import necesario

import java.util.Collection;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User implements UserDetails { // <--- ¡AQUÍ ESTÁ LA MAGIA! (implements UserDetails)

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String role;

    // =================================================================
    // MÉTODOS OBLIGATORIOS DE SPRING SECURITY (UserDetails Interface)
    // =================================================================

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Convierte el rol (String) en una Autoridad de Spring
        return List.of(new SimpleGrantedAuthority(role != null ? role : "USER"));
    }

    @Override
    public String getUsername() {
        return email; // Para Spring, el "usuario" es el email
    }

    @Override
    public String getPassword() {
        return password; // Devuelve la contraseña
    }

    // Estos 4 métodos indican si la cuenta está activa.
    // Los devolvemos todos en 'true' para no complicarnos ahora.
    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}