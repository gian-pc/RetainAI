package com.retainai.model.dto;

import jakarta.validation.constraints.*;

public record CustomersDTO(

        @NotBlank(message = "Es necesario introducir un valor")
        String genero,

        @NotNull(message = "Es necesario introducir un valor")
        @Min(value = 0, message = "La edad debe ser mayor o igual a 0")
        @Max(value = 120, message = "La edad no puede ser mayor a 120")
        Integer edad,

        @NotBlank(message = "Es necesario introducir un valor")
        String pais,

        @NotBlank(message = "Es necesario introducir un valor")
        String ciudad,

        @NotBlank(message = "Es necesario introducir un valor")
        String segmento,

        @NotNull(message = "Es necesario introducir un valor")
        @DecimalMin(value = "-90.0", message = "Latitud inválida")
        @DecimalMax(value = "90.0", message = "Latitud inválida")
        Double latitud,

        @NotNull(message = "Es necesario introducir un valor")
        @DecimalMin(value = "-180.0", message = "Longitud inválida")
        @DecimalMax(value = "180.0", message = "Longitud inválida")
        Double longitud
) {
}