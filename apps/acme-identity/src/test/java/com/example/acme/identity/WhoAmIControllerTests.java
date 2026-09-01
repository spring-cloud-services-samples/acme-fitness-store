package com.example.acme.identity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContext;
import org.springframework.test.web.reactive.server.WebTestClient;

import static org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.mockOidcLogin;
import static org.springframework.security.test.web.reactive.server.SecurityMockServerConfigurers.springSecurity;

@SpringBootTest(properties = {
		"eureka.client.enabled=false",
		"spring.cloud.config.enabled=false",
		"spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://dummy/token_keys"})
class WhoAmIControllerTests {

	@Autowired
	ApplicationContext context;

	WebTestClient webTestClient;

	@BeforeEach
	void setup() {
		this.webTestClient = WebTestClient.bindToApplicationContext(this.context)
				.apply(springSecurity())
				.build();
	}

	@Test
	void shouldIncludeUserAttributesForToken() {

		webTestClient
				.mutateWith(mockOidcLogin().idToken(token -> token.claim("name", "Mock User")
						.claim("sub", "test-user")))
				.get()
				.uri("/whoami")
				.exchange()
				.expectBody()
				.jsonPath("$.userId").isEqualTo("test-user")
				.jsonPath("$.userName").isEqualTo("test-user");
	}

	@Test
	void shouldReturnEmptyBodyWhenNoToken() {
		webTestClient
				.get()
				.uri("/whoami")
				.exchange()
				.expectStatus().isOk()
				.expectBody()
				.json("{}");
	}

}
