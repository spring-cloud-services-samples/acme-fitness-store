import React, {useState} from 'react';
import {DataGrid, GridColDef, GridPaginationModel} from '@mui/x-data-grid';
import {CartItemData} from "./types/Cart.ts"
import {Box, Link, Stack, Typography, Grid, Container, Breadcrumbs} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from "@mui/material/IconButton";
import {NavLink, useNavigate} from "react-router-dom";
import {useDeleteCartItem, useGetCart} from './hooks/cartHooks.ts';
import {useGetUserInfo} from './hooks/userHooks';
import Button from "@mui/material/Button";
import OrderSummary from "./OrderSummary.tsx";
import {useGetProducts} from "./hooks/catalogHooks.ts";
import {ProductData} from "./types/Catalog.ts";

export default function Cart() {
    const {data: userInfo, isLoading: isUserInfoLoading} = useGetUserInfo();
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        pageSize: 5,
        page: 0,
    });
    const navigate = useNavigate();

    const {data: cartData, isLoading, error} = useGetCart(userInfo.userId, userInfo);
    const deleteCartItemMutation = useDeleteCartItem(userInfo.userId);
    const {data: productsData, isLoading: isProductsLoading} = useGetProducts();

    const cartItems = cartData?.cart ?? [];
    const total = cartItems.reduce((acc, curr) => acc + (curr.quantity * parseFloat(curr.price)), 0);

    console.log(cartItems)

    const getProductImg = (itemId: string) => {
        console.log(productsData)
        const product = productsData?.data?.find((product: ProductData) => product.id === itemId);
        return product?.imageUrl1 || '/static/images/new_bikes_3.jpg'
    }

    const columns: GridColDef[] = [
        {
            field: 'productImage',
            headerName: 'Product',
            resizable: false,
            sortable: false,
            width: 150,
            renderCell: (params) => {
                const row = params.row as CartItemData;
                const imgUrl = getProductImg(row.itemid);
                return (
                    <NavLink to={`/product/${row.itemid}`}>
                        <img
                            src={imgUrl}
                            alt="Product"
                            style={{width: '50px', height: '50px', objectFit: 'cover'}}
                        />
                    </NavLink>
                );
            },
        },
        {
            field: 'name',
            headerName: 'Product Name',
            resizable: false,
            width: 250,
            renderCell: (params) => {
                const row = params.row as CartItemData;
                return <Link href={`/product/${row.itemid}`} color='inherit'>{row.name}</Link>
            }
        },
        {field: 'quantity', headerName: 'Quantity', resizable: false, width: 120},
        {field: 'price', headerName: 'Unit Price', resizable: false, width: 120},
        {
            field: 'total',
            headerName: 'Total',
            resizable: false,
            width: 100,
            sortable: false,
            renderCell: (params) => {
                const row = params.row as CartItemData;
                const total = parseFloat(row.price) * row.quantity;
                return `$${total.toFixed(2)}`;
            }
        },
        {
            field: 'delete',
            headerName: 'Remove',
            resizable: false,
            width: 100,
            sortable: false,
            align: 'center',
            renderCell: (params) => {
                return <IconButton color='inherit' onClick={() => removeItemFromCart(params.row as CartItemData)}>
                    <DeleteIcon/>
                </IconButton>
            }
        },
    ];

    function getRowId(row: {
        itemid: string;
    }) {
        return row.itemid;
    }

    function removeItemFromCart(item: CartItemData) {
        deleteCartItemMutation.mutate({
            itemid: item.itemid, quantity: 0,
            name: item.name,
            price: item.price,
            shortDescription: ''
        });
    }

    function CustomTotalFooter() {
        return (
            <Stack direction='row' sx={{p: 1}} justifyContent='space-between'>
                <Typography>Total</Typography>
                <Typography sx={{pr: '8rem'}}>${total.toFixed(2)}</Typography>
            </Stack>
        );
    }

    function handleCheckoutClick() {
        navigate("/checkout", {state: {cartItems, total}})
    }

    function handleShoppingClick() {
        navigate("/catalog");
    }

    return (
        <Container sx={{mt: 8}}>
            <Breadcrumbs separator="›" aria-label="breadcrumb">
                <Link underline="hover" color="inherit" href="/">
                    Home
                </Link>
                <Typography color="text.primary">Cart</Typography>
            </Breadcrumbs>
            <Grid mt={5} container spacing={3} alignItems="flex-start">
                <Grid item xs={12} md={9}>
                    <Typography align="center" variant='h3'>Your Shopping cart awaits!</Typography>
                    {cartItems.length > 0 ? (
                        <>
                            <Typography>You currently have {cartItems.length} item(s) in your cart</Typography>
                            <DataGrid
                                sx={{'& .MuiDataGrid-columnSeparator': {display: 'none'}}}
                                rows={cartItems}
                                columns={columns}
                                paginationModel={paginationModel}
                                onPaginationModelChange={setPaginationModel}
                                getRowId={getRowId}
                                rowSelection={false}
                                disableColumnMenu
                                disableColumnFilter
                                disableColumnSelector
                                slots={{
                                    footer: CustomTotalFooter
                                }}
                            />
                            <Box sx={{width: '100%', display: 'flex', justifyContent: 'space-between', mt: 2}}>
                                <Button variant='outlined' color='inherit' onClick={handleShoppingClick}>
                                    Continue Shopping
                                </Button>
                                <Button
                                    data-cy="checkout-button"
                                    variant='outlined'
                                    color='inherit'
                                    onClick={handleCheckoutClick}>
                                    Checkout
                                </Button>
                            </Box>
                        </>
                    ) : (
                        <Typography>Your cart is empty.</Typography>
                    )}
                </Grid>
                <OrderSummary userInfo={userInfo}/>
            </Grid>
        </Container>
    );
}
