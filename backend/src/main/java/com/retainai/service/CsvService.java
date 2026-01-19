package com.retainai.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class CsvService {

    /**
     * Parsea un archivo CSV y extrae los IDs de clientes
     * Formato esperado: primera columna = customer_id
     */
    public List<String> parseCustomerIds(MultipartFile file) throws IOException {
        List<String> customerIds = new ArrayList<>();

        log.info("📄 Parseando archivo CSV: {}", file.getOriginalFilename());

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream()))) {

            String line;
            boolean isHeader = true;
            int lineNumber = 0;

            while ((line = reader.readLine()) != null) {
                lineNumber++;

                // Skip header
                if (isHeader) {
                    isHeader = false;
                    log.info("   Header: {}", line);
                    continue;
                }

                // Parse line
                String[] columns = line.split(",");
                if (columns.length > 0 && !columns[0].trim().isEmpty()) {
                    String customerId = columns[0].trim();
                    customerIds.add(customerId);
                    log.debug("   Línea {}: {}", lineNumber, customerId);
                }
            }
        }

        log.info("✅ Parseados {} customer IDs", customerIds.size());
        return customerIds;
    }
}
