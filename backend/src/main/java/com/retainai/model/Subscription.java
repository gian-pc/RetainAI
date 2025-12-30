package com.retainai.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "subscriptions")
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "customer_id", referencedColumnName = "id")
    @JsonBackReference
    @ToString.Exclude // <--- IMPORTANTE
    @EqualsAndHashCode.Exclude // <--- IMPORTANTE
    private Customer customer;

    @Column(name = "meses_permanencia")
    private Integer mesesPermanencia;

    @Column(name = "canal_registro")
    private String canalRegistro;

    @Column(name = "tipo_contrato")
    private String tipoContrato;

    @Column(name = "cuota_mensual")
    private Double cuotaMensual;

    @Column(name = "ingresos_totales")
    private Double ingresosTotales;

    @Column(name = "metodo_pago")
    private String metodoPago;

    @Column(name = "errores_pago")
    private Integer erroresPago;

    @Column(name = "descuento_aplicado")
    private String descuentoAplicado;

    @Column(name = "aumento_precio_3m")
    private String aumentoPrecio3m;
}