import React, {useState, useEffect} from 'react';
import {
    Container, Grid, Box, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Button, Breadcrumbs, Link
} from '@mui/material';
import {useLocation, useNavigate} from 'react-router-dom';
import OrderSummary from "./OrderSummary.tsx";
import {useGetUserInfo} from './hooks/userHooks';

export default function PaymentMethod() {
    const {data: userInfo, isLoading: isUserInfoLoading} = useGetUserInfo();
    const navigate = useNavigate();
    const {state} = useLocation();
    const {cartItems = [], total = 0, addressData = {}, deliveryMethod = {}} = state || {};


    const [paymentData, setPaymentData] = useState({
        cardType: 'visa',
        cardNumber: '',
        ccv: '',
        expMonth: '12',
        expYear: '2024',
    });


    const handleChange = (event: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
        const {name, value} = event.target as HTMLInputElement;
        setPaymentData((prevData) => ({...prevData, [name]: value}));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        navigate('/review', {state: {cartItems, total, addressData, deliveryMethod, paymentData}});
    };

    return (
        <Container sx={{mt: 8}}>
            <Breadcrumbs separator="›" aria-label="breadcrumb">
                <Link underline="hover" color="inherit" href="/">
                    Home
                </Link>
                <Link underline="hover" color="inherit" href="/cart">
                    Cart
                </Link>
                <Link underline="hover" color="inherit" href="/checkout">
                    Address
                </Link>
                <Link underline="hover" color="inherit" href="/delivery">
                    Delivery
                </Link>
                <Typography color="text.primary">Payment</Typography>
            </Breadcrumbs>
            <Grid container spacing={3}>
                <Grid item xs={12} md={9}>
                    <Box mt={5}>
                        <Typography variant='h3' align="center">
                            Checkout - Payment Method
                        </Typography>
                    </Box>
                    <Box mt={3}>
                        <form id="cardInfo" onSubmit={handleSubmit}>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel id="cardtype-label">Card Type</InputLabel>
                                        <Select
                                            labelId="cardtype-label"
                                            id="cardtype"
                                            name="cardType"
                                            value={paymentData.cardType}
                                            onChange={handleChange}
                                        >
                                            <MenuItem value="amex">American Express</MenuItem>
                                            <MenuItem value="mc">Mastercard</MenuItem>
                                            <MenuItem value="visa">Visa</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        id="cardnum"
                                        name="cardNumber"
                                        label="Credit Card Number"
                                        fullWidth
                                        value={paymentData.cardNumber}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={3}>
                                <Grid mt={5} item xs={12} sm={6}>
                                    <TextField
                                        id="ccv"
                                        name="ccv"
                                        label="CCV"
                                        fullWidth
                                        value={paymentData.ccv}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid mt={5} item xs={12} sm={3}>
                                    <FormControl fullWidth>
                                        <InputLabel id="expmonth-label">Expiration Month</InputLabel>
                                        <Select
                                            labelId="expmonth-label"
                                            id="expmonth"
                                            name="expMonth"
                                            value={paymentData.expMonth}
                                            onChange={handleChange}
                                        >
                                            {Array.from({length: 12}, (_, i) => (
                                                <MenuItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                                    {String(i + 1).padStart(2, '0')}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item mt={5} xs={12} sm={3}>
                                    <FormControl fullWidth>
                                        <InputLabel id="expyear-label">Expiration Year</InputLabel>
                                        <Select
                                            labelId="expyear-label"
                                            id="expyear"
                                            name="expYear"
                                            value={paymentData.expYear}
                                            onChange={handleChange}
                                        >
                                            {Array.from({length: 10}, (_, i) => {
                                                const year = new Date().getFullYear() + i;
                                                return (
                                                    <MenuItem key={year} value={String(year)}>
                                                        {year}
                                                    </MenuItem>
                                                );
                                            })}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Box mt={3} display="flex" justifyContent="space-between">
                                <Button variant='outlined' color='inherit' onClick={() => navigate('/delivery')}>
                                    Back to Delivery Method
                                </Button>
                                <Button data-cy="review-button"
                                        variant='outlined' color='inherit' onClick={handleSubmit}>
                                    Continue to Order Review
                                </Button>
                            </Box>
                        </form>
                    </Box>
                </Grid>
                <OrderSummary userInfo={userInfo}/>
            </Grid>
        </Container>
    );
}
