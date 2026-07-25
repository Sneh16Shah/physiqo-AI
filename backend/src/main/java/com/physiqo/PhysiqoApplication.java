package com.physiqo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * PhysiqO-AI application entry point.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
@EnableJpaAuditing
@EnableJpaRepositories(basePackages = "com.physiqo")
@EntityScan(basePackages = "com.physiqo")
public class PhysiqoApplication {

    public static void main(String[] args) {
        SpringApplication.run(PhysiqoApplication.class, args);
    }
}
