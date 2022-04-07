package com.vmware.acmepayment.service;

import java.util.UUID;

import com.vmware.acmepayment.request.PaymentRequest;
import com.vmware.acmepayment.response.PaymentResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class AcmePaymentService {

	private static final Logger log = LoggerFactory.getLogger(AcmePaymentService.class);

	public PaymentResponse processPayment(PaymentRequest paymentRequest) {
		if (null == paymentRequest.getCard()) {
			log.info("payment failed due to missing card info");
			return new PaymentResponse(false, "missing card info", "0", "-1", HttpStatus.BAD_REQUEST.value());
		}

		if (paymentRequest.containsMissingData()) {
			log.info("payment failed due to incomplete info");
			return new PaymentResponse(false, "payment data is incomplete", "0", "-1", HttpStatus.BAD_REQUEST.value());
		}

		if (paymentRequest.getCard().getNumber().length() % 4 != 0) {
			log.info("payment failed due to bad card number");
			return new PaymentResponse(false, "not a valid card number", "0", "-2", HttpStatus.BAD_REQUEST.value());
		}

		if (paymentRequest.getCard().isExpired()) {
			log.info("payment failed due to expired card");
			return new PaymentResponse(false, "card is expired", "0", "-3", HttpStatus.BAD_REQUEST.value());

		}

		log.info("payment processed successfully");
		return new PaymentResponse(true, "transaction successful", paymentRequest.getTotal(), UUID.randomUUID().toString(), HttpStatus.OK.value());
	}
}
