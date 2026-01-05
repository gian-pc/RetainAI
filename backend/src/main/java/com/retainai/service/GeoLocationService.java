package com.retainai.service;

import com.retainai.dto.GeoCustomerDto;
import com.retainai.model.Customer;
import com.retainai.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class GeoLocationService {

    private final CustomerRepository customerRepository;
    private final Random random = new Random();

    // 🗺️ DICCIONARIO DE CIUDADES (AHORA COMPLETO 100%)
    private static final Map<String, double[]> CITY_CENTERS = new HashMap<>();

    static {
        // AMÉRICA
        CITY_CENTERS.put("New York", new double[]{40.7128, -74.0060});
        CITY_CENTERS.put("Toronto", new double[]{43.6532, -79.3832}); // 🇨🇦 NUEVO

        // EUROPA
        CITY_CENTERS.put("Londres", new double[]{51.5074, -0.1278});
        CITY_CENTERS.put("London", new double[]{51.5074, -0.1278});
        CITY_CENTERS.put("Berlin", new double[]{52.5200, 13.4050});   // 🇩🇪 NUEVO

        // ASIA / PACÍFICO
        CITY_CENTERS.put("Sydney", new double[]{-33.8688, 151.2093});
        CITY_CENTERS.put("Dhaka", new double[]{23.8103, 90.4125});
        CITY_CENTERS.put("Bangalore", new double[]{12.9716, 77.5946});
        CITY_CENTERS.put("Delhi", new double[]{28.7041, 77.1025});    // 🇮🇳 NUEVO
    }

    private static final double DISPERSION_DEGREE = 0.06;

    public GeoLocationService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    /**
     * Data Patching: Busca clientes sin coordenadas en las ciudades soportadas
     * y genera lat/lng aleatorias alrededor del centro.
     */
    @Transactional
    public int populateAllCoordinates() {
        List<Customer> allCustomers = customerRepository.findAll();
        int updatedCount = 0;

        for (Customer customer : allCustomers) {
            String city = customer.getCiudad();

            // Si la ciudad está en nuestro mapa y el cliente NO tiene coordenadas
            if (city != null && CITY_CENTERS.containsKey(city) &&
                    (customer.getLatitud() == null || customer.getLongitud() == null)) {

                double[] center = CITY_CENTERS.get(city);

                // Generar dispersión aleatoria
                double latOffset = (random.nextDouble() - 0.5) * DISPERSION_DEGREE;
                double lngOffset = (random.nextDouble() - 0.5) * DISPERSION_DEGREE;

                customer.setLatitud(center[0] + latOffset);
                customer.setLongitud(center[1] + lngOffset);

                updatedCount++;
            }
        }

        customerRepository.saveAll(allCustomers);
        return updatedCount;
    }

    /**
     * API PARA EL FRONTEND
     * Devuelve solo clientes con coordenadas válidas.
     */
    public List<GeoCustomerDto> getCustomersForMap() {
        return customerRepository.findAll().stream()
                .filter(c -> c.getLatitud() != null && c.getLongitud() != null)
                .map(this::mapToGeoDTO)
                .collect(Collectors.toList());
    }

    private GeoCustomerDto mapToGeoDTO(Customer c) {
        String risk = "Low";

        if (c.getMetrics() != null && Boolean.TRUE.equals(c.getMetrics().getAbandonoHistorico())) {
            risk = "High";
        }

        Double fee = 0.0;
        if (c.getSubscription() != null && c.getSubscription().getCuotaMensual() != null) {
            fee = c.getSubscription().getCuotaMensual().doubleValue();
        }

        return new GeoCustomerDto(
                c.getId(),
                c.getLatitud(),
                c.getLongitud(),
                risk,
                fee
        );
    }
}