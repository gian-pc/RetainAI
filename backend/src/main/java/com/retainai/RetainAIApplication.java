package com.retainai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching // ✅ Habilita el sistema de caché
public class RetainAIApplication {
    public static void main(String[] args) {
        SpringApplication.run(RetainAIApplication.class, args);
    }
}
