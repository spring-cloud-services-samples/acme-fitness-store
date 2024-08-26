import {useParams} from "react-router-dom";
import {useGetProduct} from "./hooks/catalogHooks";
import {useAddToCart} from "./hooks/cartHooks.ts";
import {Card, CardActionArea, Divider, Stack, Typography} from "@mui/material";
import Button from "@mui/material/Button";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/FavoriteBorder';
import Markdown from "marked-react";
import {useGetUserInfo} from "./hooks/userHooks";
import {CartItemData} from "./types/Cart.ts";

export default function ProductDetails() {
    const {productId} = useParams() as {
        productId: string
    };

    const {data: userInfo, isLoading: isUserInfoLoading} = useGetUserInfo();
    const {data, error, isLoading} = useGetProduct(productId);

    const addToCartMutation = useAddToCart(userInfo?.userId || '');

    if (isUserInfoLoading || !userInfo) {
        return <div>Loading user information...</div>;
    }

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error fetching data</div>;

    const product = data.data;

    const handleAddToCart = () => {
        const cartItem: CartItemData = {
            itemid: product.id,
            name: product.name,
            price: product.price.toString(),
            quantity: 1,
            shortDescription: product.shortDescription,
        };
        addToCartMutation.mutate(cartItem);
    };

    return (
        <Stack alignItems='center'>
            <Stack alignItems='center' spacing={5} sx={{my: '5rem'}}>
                <h2 id="product-title">{product.name}</h2>
                <Typography align='center'>{product.shortDescription}</Typography>
                <Divider sx={{width: "50%"}}/>
                <Stack direction='row' spacing={4} alignItems='center'>
                    <img src={product.imageUrl1} width="350px" alt={`image-${product.name}`}/>
                    <Stack alignItems='center' spacing={2}>
                        <Typography>Available Now</Typography>
                        <Typography>{`USD ${product.price}`}</Typography>
                        <Stack direction='row' spacing={1}>
                            <Button
                                data-cy="add-button"
                                variant='outlined'
                                color='inherit'
                                startIcon={<ShoppingCartIcon/>}
                                onClick={handleAddToCart}
                            >
                                Add to Cart
                            </Button>
                            <Button variant='outlined' color='inherit'>
                                <FavoriteIcon/>
                            </Button>
                        </Stack>
                        <Divider sx={{width: "100%"}}/>
                        <Stack direction='row' spacing={2}>
                            <Card elevation={0}>
                                <CardActionArea component="a" href={product.imageUrl1}>
                                    <img src={product.imageUrl1} width="100px" alt={`image1-${product.name}`}/>
                                </CardActionArea>
                            </Card>
                            <Card elevation={0}>
                                <CardActionArea component="a" href={product.imageUrl2}>
                                    <img src={product.imageUrl2} width="100px" alt={`image2-${product.name}`}/>
                                </CardActionArea>
                            </Card>
                            <Card elevation={0}>
                                <CardActionArea component="a" href={product.imageUrl3}>
                                    <img src={product.imageUrl3} width="100px" alt={`image3-${product.name}`}/>
                                </CardActionArea>
                            </Card>
                        </Stack>
                    </Stack>
                </Stack>
                <Divider sx={{width: "50%"}}/>
            </Stack>
            <Stack alignItems='left' sx={{mx: '25rem'}}>
                <Typography variant='h3'>Product details</Typography>
                <Markdown>{product.description}</Markdown>
            </Stack>
        </Stack>
    );
}