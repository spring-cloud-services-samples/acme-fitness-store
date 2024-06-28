package com.example.acme.identity;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfiguration {

	@Bean
	public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity httpSecurity) {

		httpSecurity.oauth2ResourceServer(oauth2 ->
				oauth2
						.jwt(jwtSpec ->
								jwtSpec.jwtAuthenticationConverter
										(new ReactiveJwtAuthenticationConverterAdapter
												(new UserNameJwtAuthenticationConverter()))));

		return httpSecurity.build();
	}
}
