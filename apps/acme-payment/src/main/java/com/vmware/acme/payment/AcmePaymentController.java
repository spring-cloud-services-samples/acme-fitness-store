package com.vmware.acme.payment;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AcmePaymentController {

    private final AcmePaymentService acmePaymentService;

    public AcmePaymentController(AcmePaymentService acmePaymentService) {
        this.acmePaymentService = acmePaymentService;
    }

    @PostMapping("/pay")
    public PaymentResponse processPayment(@RequestBody PaymentRequest paymentRequest) {
        return acmePaymentService.processPayment(paymentRequest);
    }

}
