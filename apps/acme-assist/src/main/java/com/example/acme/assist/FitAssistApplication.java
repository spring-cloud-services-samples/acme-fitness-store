package com.example.acme.assist;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.ComponentScan.Filter;
import org.springframework.context.annotation.FilterType;

import com.example.acme.assist.config.SpringApplicationContextInitializer;

@SpringBootApplication
@ComponentScan(excludeFilters = @Filter(type = FilterType.REGEX, pattern = "com.example.acme.assist.tools.*"))
public class FitAssistApplication {

    public static void main(String[] args) {
                new SpringApplicationBuilder(FitAssistApplication.class)
                .initializers(new SpringApplicationContextInitializer())
                .application()
                .run(args);
    }
}
