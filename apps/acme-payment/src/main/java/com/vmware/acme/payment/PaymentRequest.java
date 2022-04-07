package com.vmware.acme.payment;

import org.springframework.util.StringUtils;

public class PaymentRequest {
    private Card card;
    private String total;

    public Card getCard() {
        return card;
    }

    public void setCard(Card card) {
        this.card = card;
    }

    public String getTotal() {
        return total;
    }

    public void setTotal(String total) {
        this.total = total;
    }

    public boolean containsMissingData(){
        return !StringUtils.hasText(total) || card.containsMissingInfo();
    }

}
