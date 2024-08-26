import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Logo from './assets/logo.png';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {Stack} from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssistIcon from '@mui/icons-material/TipsAndUpdates';
import UserIcon from '@mui/icons-material/AccountCircle';
import {useGetCart} from './hooks/cartHooks.ts';
import {useGetUserInfo} from './hooks/userHooks';
import {useState} from "react";
import ChatModal from "./ChatModal.tsx";

const pages = [
    {name: 'Home', navigateTo: '/'},
    {name: 'Catalog', navigateTo: 'catalog'},
    {name: 'Contact', navigateTo: 'contact'}
];

interface AcmeAppBarProps {
    handleLogin: () => void;
    handleLogout: () => void;
}

export default function AcmeAppBar({handleLogin, handleLogout}: AcmeAppBarProps) {
    const navigate = useNavigate();
    const [chatOpen, setIsChatOpen] = useState(false);
    const {productId} = useParams<{
        productId?: string
    }>();

    const {data: userInfo, isLoading: isUserInfoLoading} = useGetUserInfo();

    const {data: cartData, isLoading: isCartLoading} = useGetCart(userInfo?.userId || '', userInfo);


    const itemsInCart = cartData?.cart?.reduce((total, item) => total + item.quantity, 0) || 0;

    const handleClick = () => {
        navigate('/cart');
    }

    const handleChatOpen = () => {
        setIsChatOpen(true);
    }

    const handleChatClose = () => {
        setIsChatOpen(false);
    }

    return (
        <>
            <AppBar position="static" color="inherit">
                <Container maxWidth="xl">
                    <Stack direction='row' alignItems='center' justifyContent='space-between' spacing={10}>
                        <Stack direction='row'>
                            <IconButton component={Link} to={'/'}>
                                <img src={Logo} alt="acme-logo"/>
                            </IconButton>
                            {pages.map((page) => (
                                <Button
                                    sx={{color: 'secondary.contrastText'}}
                                    key={page.name}
                                    component={Link}
                                    to={page.navigateTo}>
                                    {page.name}
                                </Button>
                            ))}
                        </Stack>
                        <Stack direction='row' alignContent='right' spacing={4}>
                            <IconButton data-cy="login-button" onClick={handleLogin} color='inherit'>
                                <UserIcon/>
                            </IconButton>
                            <Button
                                data-cy="cart-button"
                                variant='outlined'
                                color='inherit'
                                onClick={handleClick}
                                startIcon={<ShoppingCartIcon/>}
                            >
                                {itemsInCart} items in Cart
                            </Button>
                            <Button variant='outlined' color='inherit' onClick={handleChatOpen}
                                    startIcon={<AssistIcon/>}>Ask FitAssist</Button>
                        </Stack>
                    </Stack>
                </Container>
            </AppBar>
            <ChatModal open={chatOpen} onClose={handleChatClose} cartData={cartData}/>
        </>
    );
}