package com.retainai.service;

import com.retainai.dto.GeoCustomerDto;
import com.retainai.model.AiPrediction;
import com.retainai.model.Customer;
import com.retainai.repository.CustomerRepository;
import com.retainai.repository.PredictionRepository;
import com.retainai.util.NyRealData;
import org.springframework.cache.annotation.Cacheable;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Slf4j
@Service
public class GeoLocationService {

    private final CustomerRepository customerRepository;
    private final PredictionRepository predictionRepository;
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

    private static class LocationData {
        String borough;
        String name;
        double lat;
        double lng;

        public LocationData(String borough, String name, double lat, double lng) {
            this.borough = borough;
            this.name = name;
            this.lat = lat;
            this.lng = lng;
        }
    }

    /**
     * Carga ubicaciones desde CSV y las asigna a los clientes
     */
    @Transactional
    public int populateAllCoordinates() {
        List<Customer> allCustomers = customerRepository.findAll();
        int updatedCount = 0;

        // 1. Cargar datos del CSV
        Map<String, List<LocationData>> boroughLocations = loadLocationsFromCSV();

        // Barajar las listas para asignación aleatoria
        for (List<LocationData> list : boroughLocations.values()) {
            Collections.shuffle(list);
        }

        // Indices para rastrear uso
        Map<String, Integer> usageIndex = new HashMap<>();

        for (Customer customer : allCustomers) {
            String targetBorough = "MANHATTAN"; // Default

            // Detectar borough preferido
            if (customer.getBorough() != null && !customer.getBorough().isEmpty()) {
                targetBorough = normalizeBorough(customer.getBorough());
            } else if (customer.getCiudad() != null && customer.getCiudad().toLowerCase().contains("new york")) {
                targetBorough = "MANHATTAN";
            } else {
                continue; // Skip si no es NY
            }

            // Obtener lista de ubicaciones disponibles
            List<LocationData> available = boroughLocations.getOrDefault(targetBorough,
                    boroughLocations.get("MANHATTAN"));

            if (available == null || available.isEmpty())
                continue;

            // Obtener siguiente ubicación única
            int idx = usageIndex.getOrDefault(targetBorough, 0);
            LocationData loc = available.get(idx % available.size()); // Loop si se acaban (pero tenemos 17k para 9k
                                                                      // clientes)
            usageIndex.put(targetBorough, idx + 1);

            // Asignar datos
            customer.setLatitud(loc.lat);
            customer.setLongitud(loc.lng);
            customer.setBorough(loc.borough); // Normalizar nombre de borough
            customer.setNombre(loc.name); // ✅ Nombre Real del Negocio

            // Generar Predicción basada en nueva ubicación
            generateAiPrediction(customer, loc.lat, loc.lng);

            updatedCount++;
        }

        customerRepository.saveAll(allCustomers);
        System.out.println("✅ REAL DATA POBLADA: " + updatedCount + " clientes con Nombres y Ubicaciones Reales.");
        return updatedCount;
    }

    private Map<String, List<LocationData>> loadLocationsFromCSV() {
        Map<String, List<LocationData>> map = new HashMap<>();
        try {
            ClassPathResource resource = new ClassPathResource("nyc_business_locations.csv");
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8));

            String line;
            boolean header = true;
            while ((line = reader.readLine()) != null) {
                if (header) {
                    header = false;
                    continue;
                }

                // CSV columns: Address Borough, Business Name, License Type, Latitude,
                // Longitude
                // Usamos split simple por coma (asumiendo que los nombres no tienen comas o
                // están entre comillas,
                // pero nuestro script python usó to_csv standard. Para mayor robustez en java
                // simple:)
                String[] parts = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)", -1);

                if (parts.length >= 5) {
                    try {
                        String borough = parts[0].replace("\"", "").trim();
                        String name = parts[1].replace("\"", "").trim() + " (" + parts[2].replace("\"", "").trim()
                                + ")"; // Nombre + Tipo
                        double lat = Double.parseDouble(parts[3]);
                        double lng = Double.parseDouble(parts[4]);

                        String normalizedBorough = normalizeBorough(borough);

                        map.putIfAbsent(normalizedBorough, new ArrayList<>());
                        map.get(normalizedBorough).add(new LocationData(normalizedBorough, name, lat, lng));
                    } catch (Exception e) {
                        // Skip bad lines
                    }
                }
            }
            System.out.println(
                    "📂 CSV Cargado. Ubicaciones disponibles: " + map.values().stream().mapToInt(List::size).sum());
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("❌ Error cargando CSV de ubicaciones: " + e.getMessage());
        }
        return map;
    }

    private String normalizeBorough(String input) {
        String upper = input.toUpperCase();
        if (upper.contains("MANHATTAN"))
            return "MANHATTAN";
        if (upper.contains("BROOKLYN"))
            return "BROOKLYN";
        if (upper.contains("QUEENS"))
            return "QUEENS";
        if (upper.contains("BRONX"))
            return "BRONX";
        if (upper.contains("STATEN"))
            return "STATEN ISLAND";
        return "MANHATTAN";
    }

    /**
     * 🏙️ Populate MANHATTAN Only (Phase 1) - Mantenido param compatibilidad pero
     * usa lógica vieja por ahora
     * O mejor: redirige a la lógica nueva filtrada?
     * Para no romper nada, lo mantendré usando la lógica antigua de NyRealData si
     * se llama específicamente,
     * o podemos deprecarlo. Lo dejaré minimalista.
     */
    @Transactional
    public int populateManhattanCoordinates() {
        return populateAllCoordinates(); // Ahora todo usa la lógica unificada de alta calidad
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
    @Cacheable(value = "geoCustomers", key = "#limit", unless = "#result == null")
    public List<GeoCustomerDto> getCustomersForMap(int limit) {
        log.info("📍 Obteniendo {} clientes para el mapa (Nativo)...", limit);
        long startTime = System.currentTimeMillis();
        
        List<Object[]> results = customerRepository.findHeatmapDataNative();
        
        List<GeoCustomerDto> dtos = results.stream()
                .limit(limit)
                .map(row -> new GeoCustomerDto(
                        (String) row[0], // id
                        (Double) row[2], // lat
                        (Double) row[3], // lng
                        normalizeRiskLevelLocal((String) row[5]), // risk
                        row[8] != null ? ((Number) row[8]).doubleValue() : 0.0 // monthlyFee
                ))
                .collect(Collectors.toList());

        log.info("✅ Generados {} DTOs para el mapa en {}ms", dtos.size(), (System.currentTimeMillis() - startTime));
        return dtos;
    }

    private String normalizeRiskLevelLocal(String riskLevel) {
        if (riskLevel == null) return "Low";
        return switch (riskLevel.toLowerCase()) {
            case "alto", "high" -> "High";
            case "medio", "medium" -> "Medium";
            default -> "Low";
        };
    }

    private GeoCustomerDto mapToGeoDTO(Customer c) {
        String risk = "Low";

        // Buscamos la predicción más reciente (si existe)
        if (c.getPredictions() != null && !c.getPredictions().isEmpty()) {
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
                ? c.getSubscription().getCuotaMensual().doubleValue()
                : 0.0;

        return new GeoCustomerDto(c.getId(), c.getLatitud(), c.getLongitud(), risk, fee);
    }
}