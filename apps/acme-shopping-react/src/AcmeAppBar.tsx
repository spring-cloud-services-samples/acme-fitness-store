import React, {useState} from "react";
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Logo from './assets/logo.png';
import LogoSmall from './assets/logo-small.png';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {Badge, Box, Menu, MenuItem, Modal, Stack, Typography} from "@mui/material";
import AssistIcon from '@mui/icons-material/TipsAndUpdates';
import MenuIcon from '@mui/icons-material/Menu';
import UserIcon from '@mui/icons-material/AccountCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import {useGetCart} from './hooks/cartHooks.ts';
import {useGetUserInfo} from './hooks/userHooks';
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
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [overflowMenuAnchorEl, setOverflowMenuAnchorEl] = React.useState<null | HTMLElement>(null);
    const openOverflowMenu = Boolean(overflowMenuAnchorEl);

    const handleOverflowMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setOverflowMenuAnchorEl(event.currentTarget);
    };
    const handleOverflowMenuClose = () => {
        setOverflowMenuAnchorEl(null);
    };

    const {data: userInfo} = useGetUserInfo();

    const {data: cartData} = useGetCart(userInfo?.userId || '', userInfo);

    const itemsInCart = cartData?.cart?.reduce((total, item) => total + item.quantity, 0) || 0;

    const handleShoppingCartOpen = () => {
        navigate('/cart');
    }

    const handleChatOpen = () => {
        setIsChatOpen(true);
    }

    const handleChatClose = () => {
        setIsChatOpen(false);
    }
    const handleUserModalClose = () => {
        setUserModalOpen(false);
    }
    const handleLoginClick = () => {
        console.log(userInfo);
        if (userInfo && userInfo.userId) {
            setUserModalOpen(true);
        } else {
            handleLogin();
        }
    }

    return (
        <>
            <AppBar position="static" color="inherit">
                <Container maxWidth="xl" sx={{paddingX: {xs: 0, sm: 0}}}>
                    <Stack direction='row' alignItems='center' justifyContent='space-between'>
                        <Stack direction='row' sx={{display: {xs: 'flex', sm: 'none'}}}>
                            <IconButton component={Link} to={'/'}>
                                <img src={LogoSmall} alt="acme-logo"/>
                            </IconButton>
                        </Stack>
                        <Stack direction='row' sx={{display: {xs: 'none', sm: 'flex'}}}>
                            <IconButton component={Link} to={'/'}>
                                <img src={Logo} alt="acme-logo"/>
                            </IconButton>
                            {pages.map((page) => (
                                <Button
                                    sx={{color: 'secondary.contrastText', display: {xs: 'none', md: 'flex'} }}
                                    key={page.name}
                                    component={Link}
                                    to={page.navigateTo}>
                                    {page.name}
                                </Button>
                            ))}
                        </Stack>
                        <Stack direction='row' alignContent='right' spacing={{xs: 1, md: 4}} marginRight={{xs: 1, md: 2}}>
                            <IconButton
                                onClick={handleLoginClick}
                                color='inherit'
                            >
                                <UserIcon/>
                            </IconButton>

                            <IconButton
                                data-cy="cart-button"
                                onClick={handleShoppingCartOpen}
                                color='inherit'
                                sx={{display: {xs: 'flex', sm: 'none'}}}
                            >
                                <Badge badgeContent={itemsInCart}>
                                    <ShoppingCartIcon/>
                                </Badge>
                            </IconButton>
                            <Button
                                data-cy="cart-button"
                                variant='outlined'
                                color='inherit'
                                onClick={handleShoppingCartOpen}
                                startIcon={<ShoppingCartIcon/>}
                                sx={{display: {xs: 'none', sm: 'flex'}}}
                            >
                                {itemsInCart} items in Cart
                            </Button>

                            <IconButton
                                data-cy="assist-button"
                                onClick={handleChatOpen}
                                color='inherit'
                                sx={{display: {xs: 'flex', sm: 'none'}}}
                            >
                                <AssistIcon/>
                            </IconButton>
                            <Button
                                data-cy="assist-button"
                                variant='outlined'
                                color='inherit'
                                onClick={handleChatOpen}
                                startIcon={<AssistIcon/>}
                                sx={{display: {xs: 'none', sm: 'flex'}}}
                            >
                                Ask FitAssist
                            </Button>

                            <IconButton
                                data-cy="menu-button"
                                onClick={handleOverflowMenuClick}
                                color='inherit'
                                sx={{display: {xs: 'flex', sm: 'none'}}}
                            >
                                <MenuIcon/>
                            </IconButton>
                            <Button
                                data-cy="menu-button"
                                variant='outlined'
                                color='inherit'
                                onClick={handleOverflowMenuClick}
                                sx={{display: {xs: 'none', sm: 'flex', md: 'none'}}}
                            >
                                <MenuIcon/>
                            </Button>
                            <Menu
                                MenuListProps={{
                                    'aria-labelledby': 'fade-button',
                                }}
                                anchorEl={overflowMenuAnchorEl}
                                open={openOverflowMenu}
                                onClose={handleOverflowMenuClose}
                                sx={{display: {xs: 'flex', md: 'none'}}}
                            >
                                {pages.map((page) => (
                                    <MenuItem
                                        component={Link}
                                        key={page.name}
                                        to={page.navigateTo}
                                        onClick={handleOverflowMenuClose}
                                    >
                                        {page.name}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Stack>
                    </Stack>
                </Container>
            </AppBar>
            <Modal
                open={userModalOpen}
                onClose={handleUserModalClose}
                aria-labelledby="user-info-modal"
                aria-describedby="user-info-and-logout"
            >
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                    <Typography id="user-info-modal" variant="h6" component="h2">
                        User Information
                    </Typography>
                    <Typography id="user-info-username" sx={{ mt: 2 }}>
                        {`Hello, ${userInfo?.userName}`}
                    </Typography>
                    <Button id="user-info-logout" onClick={handleLogout} variant="contained" color="primary" sx={{ mt: 2 }}>
                        Logout
                    </Button>
                </Box>
            </Modal>
            <ChatModal open={chatOpen} onClose={handleChatClose} cartData={cartData} productId={null}/>
        </>
    );
}
