import React from 'react';
import {Divider, Link, Stack, TextField, Typography} from "@mui/material";
import Payment from './assets/payment.png';
import Button from "@mui/material/Button";
import {Link as RouterLink} from "react-router-dom";
import SendIcon from '@mui/icons-material/Send';
import FacebookIcon from '@mui/icons-material/Facebook';
import XIcon from '@mui/icons-material/X';
import InstagramIcon from '@mui/icons-material/Instagram';

interface AcmeFooterProps {
    handleLogin: () => void;
}

export default function AcmeFooter({handleLogin}: AcmeFooterProps) {

    const address = {
        name: "ACME Fitness",
        address: "2705 Thunder Road",
        city: "Palo Alto",
        state: "California",
        country: "USA"
    }

    return (
        <Stack sx={{backgroundColor: '#f6f8f9'}}>
            <Stack direction='row' justifyContent='center' spacing={5} sx={{my: "2rem"}}>
                <Stack>
                    <Typography>Pages</Typography>
                    <Typography>About us</Typography>
                    <Typography>Terms and Conditions</Typography>
                    <Typography>FAQ</Typography>
                    <Typography>Contact us</Typography>
                    <Divider sx={{width: "100%"}}/>
                    <Typography>User section</Typography>
                    <Typography>
                        <Button onClick={handleLogin} color='secondary' underline="none">
                            Login
                        </Button>
                    </Typography>
                </Stack>
                <Stack>
                    <Typography>Where to find us</Typography>
                    <Typography>{address.name}</Typography>
                    <Typography>{address.address}</Typography>
                    <Typography>{address.city}</Typography>
                    <Typography>{address.state}</Typography>
                    <Typography>{address.country}</Typography>
                    <Button color='secondary' component={RouterLink} to='contact'>Go to contact page</Button>
                </Stack>
                <Stack>
                    <Typography>Get the news</Typography>
                    <Typography>What's new in the world of Fitness</Typography>
                    <TextField InputProps={{
                        endAdornment: <SendIcon/>
                    }}></TextField>
                    <Divider sx={{width: "100%", my: "1rem"}}/>
                    <Typography>Stay in touch</Typography>
                    <Stack direction="row" spacing={2}>
                        <FacebookIcon/>
                        <XIcon/>
                        <InstagramIcon/>
                    </Stack>
                </Stack>
            </Stack>
            <Stack sx={{background: "#333", py: "20px"}} alignItems='center' spacing={2}>
                <Stack direction='row' justifyContent='space-between' spacing={30}>
                    <Typography color="primary">© 2024 ACME Fitness</Typography>
                    <img src={Payment} alt="payment-options"/>
                </Stack>
                <Typography color="primary">This website is for demo purposes only. It is not an actual e-commerce
                    site.</Typography>
            </Stack>
        </Stack>
    );
}
