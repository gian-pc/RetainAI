package com.retainai.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subscriptions")
@Data
@NoArgsConstructor
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String canalRegistro;
    private Integer mesesPermanencia;
    private String tipoContrato;
    private Double cuotaMensual;
    private Double ingresosTotales;
    private String metodoPago;
    private Integer erroresPago;
    private String descuentoAplicado; // Yes/No
    private String aumentoPrecio3m;   // Yes/No

    @OneToOne
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    private Customer customer;
}