import React, {useEffect, useState} from 'react';
import {
    Container,
    Grid,
    Box,
    Typography,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    Breadcrumbs
} from '@mui/material';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useGetUserInfo} from "./hooks/userHooks";
import {useClearCart, useGetCart} from "./hooks/cartHooks.ts";
import OrderSummary from "./OrderSummary.tsx";
import constructOrder from "./utils/helpers.ts";
import {useCreateOrder} from "./hooks/orderHook.ts";
import {clearCart} from "./api/cartClient.ts";

interface CartItem {
    itemid: string;
    name: string;
    quantity: number;
    price: number;
}

export default function OrderReview() {
    const {state} = useLocation();
    const { cartItems = [], total = 0, addressData = {}, deliveryMethod = {}, paymentData = {} } = state || {};
    const navigate = useNavigate();


    const {data: userInfo, isLoading: isUserInfoLoading} = useGetUserInfo();
    const {data: cartData, isLoading: isCartLoading, error} = useGetCart(userInfo?.userId, userInfo);
    const { mutate: createOrder, isLoading: isCreatingOrder } = useCreateOrder(userInfo?.userId);
    const { mutate: clearCart } = useClearCart(userInfo?.userId);  // Use the new hook



    if (isUserInfoLoading || isCartLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error loading cart data.</div>;
    }

    const handleSubmit = () =>{
        const order = constructOrder(cartItems, total, addressData, deliveryMethod, paymentData, userInfo.userId)
        createOrder(order, {
            onSuccess: () => {
                clearCart();
                navigate("/confirmation", {state: {userInfo}})
            },
            onError: (error: Error) => {
                console.error('Error creating order:', error.message);
            }
        });
    }

    return (
        <Container sx={{ mt: 8 }}>
            <Breadcrumbs separator="›" aria-label="breadcrumb">
                <Link underline="none" color="inherit" href="/" style={{ color: 'black' }}>
                    Home
                </Link>
                <Link underline="none" color="inherit" href="/cart" style={{ color: 'black' }}>
                    Cart
                </Link>
                <Link underline="none" color="inherit" href="/checkout" style={{ color: 'black' }}>
                    Address
                </Link>
                <Link underline="none" color="inherit" href="/delivery" style={{ color: 'black' }}>
                    Delivery
                </Link>
                <Link underline="none" color="inherit" href="/payment" style={{ color: 'black' }}>
                    Payment
                </Link>
                <Typography color="text.primary">Review</Typography>
            </Breadcrumbs>
            <Grid container spacing={3}>
                <Grid item xs={12} md={9}>
                    <Box mt={5}>
                        <Typography variant='h3' align="center">
                            Checkout - Order Review
                        </Typography>
                    </Box>
                    <Box mt={3}>
                        <form id="review" onSubmit={(e) => {
                            e.preventDefault();
                        }}>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell colSpan={2}>Product</TableCell>
                                            <TableCell>Quantity</TableCell>
                                            <TableCell>Unit price</TableCell>
                                            <TableCell>Discount</TableCell>
                                            <TableCell>Total</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {cartItems.map((item) => (
                                            <TableRow key={item.itemid}>
                                                <TableCell colSpan={2}>{item.name}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>{item.price}</TableCell>
                                                <TableCell>0.00</TableCell>
                                                <TableCell>{(item.price * item.quantity).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <tfoot>
                                    <TableRow>
                                        <TableCell colSpan={5}>Total</TableCell>
                                        <TableCell>{total.toFixed(2)}</TableCell>
                                    </TableRow>
                                    </tfoot>
                                </Table>
                            </TableContainer>
                            <Box mt={3} display="flex" justifyContent="space-between">
                                <Button
                                    variant='outlined'
                                    color='inherit'
                                    component={Link}
                                    to="/payment"
                                > Back to Payment Method</Button>
                                <Button
                                    variant='outlined'
                                    color='inherit'
                                    onClick={handleSubmit}
                                    data-cy="order-button"
                                > Place an order</Button>
                            </Box>
                        </form>
                    </Box>
                </Grid>
                <OrderSummary userInfo={userInfo}/>
            </Grid>
        </Container>
    );
}
