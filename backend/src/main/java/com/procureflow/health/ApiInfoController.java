package com.procureflow.health;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class ApiInfoController {

    @GetMapping("/status")
    public Map<String, String> status() {
        return Map.of(
            "application", "ProcureFlow",
            "status", "development-foundation",
            "message", "Business APIs are not enabled until authentication and tenant authorization are implemented."
        );
    }
}
