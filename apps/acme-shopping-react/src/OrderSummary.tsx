import React from 'react';
import {useGetCart} from './hooks/cartHooks.ts';
import {Box, Grid, Table, TableBody, TableCell, TableContainer, TableRow, Typography} from "@mui/material";
import {UserInfo} from "./api/userClient.ts";

interface OrderSummaryProps {
    userInfo?: UserInfo;
}

export default function OrderSummary({ userInfo }: OrderSummaryProps) {
    if (!userInfo) {
        return <div>Loading...</div>;
    }

    const { data: cartData, isLoading, error } = useGetCart(userInfo.userId, userInfo);

    if (isLoading) {
        return <div>Loading cart...</div>;
    }

    if (error) {
        return <div>Error loading cart items.</div>;
    }

    const cartItems = cartData?.cart ?? [];
    const cartTotal = cartItems.reduce((acc, curr) => acc + (curr.quantity * parseFloat(curr.price)), 0);

    return (
        <Grid mt={5} item xs={12} lg={3}>
            <Box className="box">
                <div className="box-header">
                    <Typography variant="h6">Order summary</Typography>
                </div>
                <Typography className="text-muted">Shipping and additional costs may vary</Typography>
                <TableContainer>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>Order subtotal</TableCell>
                                <TableCell>{cartTotal.toFixed(2)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Shipping and handling</TableCell>
                                <TableCell>Free</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Tax</TableCell>
                                <TableCell>0.00</TableCell>
                            </TableRow>
                            <TableRow className="total">
                                <TableCell>Total</TableCell>
                                <TableCell>{cartTotal.toFixed(2)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Grid>
    );
}
