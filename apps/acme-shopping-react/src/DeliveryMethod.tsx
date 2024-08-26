import React, {useState, useEffect} from 'react';
import {
    Container,
    Grid,
    Box,
    Typography,
    Radio,
    RadioGroup,
    FormControlLabel,
    Button,
    Breadcrumbs, Link
} from '@mui/material';
import {useLocation, useNavigate} from 'react-router-dom';
import OrderSummary from "./OrderSummary.tsx";
import {useGetUserInfo} from './hooks/userHooks';

export default function DeliveryMethod() {
    const {data: userInfo, isLoading: isUserInfoLoading} = useGetUserInfo();

    const [deliveryMethod, setDeliveryMethod] = useState<string>('standard');
    const navigate = useNavigate();
    const {state} = useLocation();
    const {cartItems = [], total = 0, addressData = {}} = state || {};

    const handleDeliveryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = event.target;
        setDeliveryMethod(value);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        navigate('/payment', {state: {cartItems, total, addressData, deliveryMethod}});
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
                <Typography color="text.primary">Delivery</Typography>
            </Breadcrumbs>
            <Grid container spacing={3}>
                <Grid item xs={12} md={9}>
                    <Box mt={5}>
                        <Typography variant='h3' align="center">
                            Checkout - Delivery Method
                        </Typography>
                    </Box>
                    <Box mt={3}>
                        <form id="deliveryInfo" onSubmit={handleSubmit}>
                            <RadioGroup name="delivery" value={deliveryMethod} onChange={handleDeliveryChange}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={6}>
                                        <Box border={1} borderRadius={5} p={2} borderColor="grey.300">
                                            <Typography variant="h6">Standard Shipping</Typography>
                                            <Typography variant="body2">
                                                Expect your shipment in 5-7 business days
                                            </Typography>
                                            <Box textAlign="center">
                                                <FormControlLabel
                                                    value="Standard"
                                                    control={<Radio/>}
                                                    label=""
                                                />
                                            </Box>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Box border={1} borderRadius={5} p={2} borderColor="grey.300">
                                            <Typography variant="h6">Express Shipping</Typography>
                                            <Typography variant="body2">
                                                Expect your shipment in 1-3 business days
                                            </Typography>
                                            <Box textAlign="center"
                                                 data-cy="express-button"
                                            >
                                                <FormControlLabel
                                                    value="Express"
                                                    control={<Radio/>}
                                                    label=""
                                                />
                                            </Box>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </RadioGroup>
                            <Box mt={3} display="flex" justifyContent="space-between">
                                <Button
                                    variant='outlined'
                                    color='inherit'
                                    onClick={() => navigate('/checkout')}
                                > Back to Checkout</Button>
                                <Button
                                    data-cy="payment-button"
                                    variant='outlined'
                                    color='inherit'
                                    onClick={handleSubmit}
                                >Continue to Payment Method</Button>
                            </Box>
                        </form>
                    </Box>
                </Grid>
                <OrderSummary userInfo={userInfo}/>
            </Grid>
        </Container>
    );
}
