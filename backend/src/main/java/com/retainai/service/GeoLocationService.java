package com.retainai.service;

import com.retainai.dto.GeoCustomerDto;
import com.retainai.model.AiPrediction;
import com.retainai.model.Customer;
import com.retainai.repository.CustomerRepository;
import com.retainai.repository.PredictionRepository; // 👈 Usamos TU repositorio
import com.retainai.util.NyRealData;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
public class GeoLocationService {

    private final CustomerRepository customerRepository;
    private final PredictionRepository predictionRepository; // Inyección de tu repo
    private final Random random = new Random();

    // 🎯 ZONAS ESTRATÉGICAS (Epicentros de la historia)
    private static final double ZONE_BRONX_LAT = 40.8256;
    private static final double ZONE_BRONX_LNG = -73.9250;

    private static final double ZONE_RICH_LAT = 40.7736;
    private static final double ZONE_RICH_LNG = -73.9566;

    private static final double ZONE_HIPSTER_LAT = 40.7145;
    private static final double ZONE_HIPSTER_LNG = -73.9553;

    public GeoLocationService(CustomerRepository customerRepository, PredictionRepository predictionRepository) {
        this.customerRepository = customerRepository;
        this.predictionRepository = predictionRepository;
    }

    @Transactional
    public int populateAllCoordinates() {
        List<Customer> allCustomers = customerRepository.findAll();
        int updatedCount = 0;
        int nyIndex = 0;

        for (Customer customer : allCustomers) {
            String city = customer.getCiudad();
            if (city == null) continue;

            String cityClean = city.trim().toLowerCase();

            // Filtramos solo NY para la demo
            if (cityClean.contains("new york") || cityClean.equals("ny") ||
                    cityClean.contains("manhattan") || cityClean.contains("brooklyn") ||
                    cityClean.contains("queens") || cityClean.contains("bronx")) {

                // 1. Asignar Coordenada Real (Edificios Reales)
                double[] realCoords = NyRealData.COORDINATES[nyIndex % NyRealData.COORDINATES.length];
                double lat = realCoords[0];
                double lng = realCoords[1];

                customer.setLatitud(lat);
                customer.setLongitud(lng);

                // 2. 🧠 GENERAR PREDICCIÓN DE IA BASADA EN ZONA
                generateAiPrediction(customer, lat, lng);

                nyIndex++;
                updatedCount++;
            }
        }

        customerRepository.saveAll(allCustomers);
        System.out.println("✅ IA GEOLOCALIZADA: " + updatedCount + " predicciones generadas en NY.");
        return updatedCount;
    }

    private void generateAiPrediction(Customer c, double lat, double lng) {
        // Calcular distancias a los epicentros
        double distToBronx = Math.sqrt(Math.pow(lat - ZONE_BRONX_LAT, 2) + Math.pow(lng - ZONE_BRONX_LNG, 2));
        double distToRich = Math.sqrt(Math.pow(lat - ZONE_RICH_LAT, 2) + Math.pow(lng - ZONE_RICH_LNG, 2));
        double distToHipster = Math.sqrt(Math.pow(lat - ZONE_HIPSTER_LAT, 2) + Math.pow(lng - ZONE_HIPSTER_LNG, 2));

        AiPrediction prediction = new AiPrediction();
        prediction.setCustomer(c);
        prediction.setFechaAnalisis(LocalDateTime.now());

        // 🔴 EL BRONX -> INFRAESTRUCTURA FALLIDA -> RIESGO ALTO
        if (distToBronx < 0.05) {
            prediction.setProbabilidadFuga(0.85 + (random.nextDouble() * 0.14)); // 85% - 99%
            prediction.setMotivoPrincipal("Fallas Recurrentes de Red");
        }

        // 🟢 UPPER EAST SIDE -> ZONA VIP -> RIESGO BAJO
        else if (distToRich < 0.03) {
            prediction.setProbabilidadFuga(0.01 + (random.nextDouble() * 0.10)); // 1% - 11%
            prediction.setMotivoPrincipal("Cliente Satisfecho");
        }

        // 🟠 WILLIAMSBURG -> COMPETENCIA -> RIESGO MEDIO
        else if (distToHipster < 0.03) {
            prediction.setProbabilidadFuga(0.40 + (random.nextDouble() * 0.25)); // 40% - 65%
            prediction.setMotivoPrincipal("Oferta Competencia Agresiva");
        }

        // ⚪ RESTO DE LA CIUDAD -> RIESGO BAJO/NORMAL
        else {
            prediction.setProbabilidadFuga(random.nextDouble() * 0.30); // 0% - 30%
            prediction.setMotivoPrincipal("Sin Riesgo Aparente");
        }

        // Guardamos la predicción en la base de datos
        predictionRepository.save(prediction);
    }

    // --- Mapeo para el Frontend (ULTRA-OPTIMIZADO) ---
    public List<GeoCustomerDto> getCustomersForMap(int limit) {
        // 🚀 Query directa a DTO - NO carga relaciones innecesarias
        org.springframework.data.domain.PageRequest pageRequest =
            org.springframework.data.domain.PageRequest.of(0, limit);

        // Esta query ya devuelve GeoCustomerDto directamente (sin Customer completo)
        List<GeoCustomerDto> lightDtos = customerRepository.findGeoCustomersLight(pageRequest);

        // Ahora calculamos el risk real basado en predicciones (batch query)
        List<String> customerIds = lightDtos.stream()
                .map(GeoCustomerDto::id)
                .collect(Collectors.toList());

        List<AiPrediction> predictions = predictionRepository.findLatestByCustomerIds(customerIds);

        // Crear mapa de customerID -> risk calculado
        var riskMap = predictions.stream()
                .collect(Collectors.toMap(
                    p -> p.getCustomer().getId(),
                    p -> {
                        double prob = p.getProbabilidadFuga();
                        if (prob > 0.70) return "High";
                        if (prob > 0.35) return "Medium";
                        return "Low";
                    },
                    (r1, r2) -> r1 // Si hay duplicados, tomar el primero
                ));

        // Reemplazar "Low" default con el risk real
        return lightDtos.stream()
                .map(dto -> new GeoCustomerDto(
                    dto.id(),
                    dto.lat(),
                    dto.lng(),
                    riskMap.getOrDefault(dto.id(), "Low"), // Risk calculado o Low por default
                    dto.monthlyFee()
                ))
                .collect(Collectors.toList());
    }

    private GeoCustomerDto mapToGeoDTO(Customer c) {
        String risk = "Low";

        // Buscamos la predicción más reciente (si existe)
        if (c.getPredictions() != null && !c.getPredictions().isEmpty()) {
            // Ordenamos por ID descendente o fecha para tomar la última
            AiPrediction latest = c.getPredictions().stream()
                    .max(Comparator.comparing(AiPrediction::getId))
                    .orElse(null);

            if (latest != null) {
                if (latest.getProbabilidadFuga() > 0.70) {
                    risk = "High";
                } else if (latest.getProbabilidadFuga() > 0.35) {
                    risk = "Medium";
                }
            }
        }

        Double fee = (c.getSubscription() != null && c.getSubscription().getCuotaMensual() != null)
                ? c.getSubscription().getCuotaMensual().doubleValue() : 0.0;

        return new GeoCustomerDto(c.getId(), c.getLatitud(), c.getLongitud(), risk, fee);
    }
}