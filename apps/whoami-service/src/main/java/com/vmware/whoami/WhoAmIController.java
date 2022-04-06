package com.vmware.whoami;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import static java.util.Collections.emptyMap;

@RestController
public class WhoAmIController {
	private final Logger log = LoggerFactory.getLogger(WhoAmIController.class);

	@GetMapping("/whoami")
	public Map<String, String> getUserInfo(Authentication authentication) {
		log.debug("/whoami endpoint is triggered.");
		if (authentication instanceof OAuth2AuthenticationToken) {

			OAuth2User principal = ((OAuth2AuthenticationToken) authentication).getPrincipal();
			return Map.of(
					"userId", principal.getName(),
					"userName", (String) principal.getAttributes().get("name"));
		}
		log.warn("Authentication is not an OAuth2 token: {}, can't extract user info.", authentication);
		return emptyMap();
	}
}
