import React from "react";
import {Divider, Stack, Typography} from "@mui/material";
import FavoriteIcon from '@mui/icons-material/FavoriteBorder';
import SellIcon from '@mui/icons-material/Sell';
import SendIcon from '@mui/icons-material/Send';
import LoopIcon from '@mui/icons-material/Loop';
import Button from "@mui/material/Button";
import {Link as RouterLink} from "react-router-dom";
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import CatalogCarousel from "./CatalogCarousel.tsx";

// Import css files
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function Home() {

    const info = [
        {text1: "Satisfied", text2: "Customers", image: <FavoriteIcon fontSize='large'/>},
        {text1: "Best", text2: "Prices", image: <SellIcon fontSize='large'/>},
        {text1: "Next Day", text2: "Delivery", image: <SendIcon fontSize='large'/>},
        {text1: "Free Returns", text2: "for 3 Months", image: <LoopIcon fontSize='large'/>},
    ]

    return (
        <Stack justifyContent='center' alignItems='center' spacing={5}>
            <CatalogCarousel/>
            <Divider sx={{width: "50%"}}></Divider>
            <Typography>About Acme Fitness</Typography>
            <Stack direction='row' spacing={5}>
                {info.map((item, index) => (
                    <Stack direction='row' alignItems='center' key={`info-${index}`} spacing={3}>
                        {item.image}
                        <Stack>
                            <Typography>{item.text1}</Typography>
                            <Typography>{item.text2}</Typography>
                        </Stack>
                    </Stack>
                ))}
            </Stack>
            <Divider sx={{width: "50%"}}></Divider>
            <Divider sx={{width: "50%"}}></Divider>
            <Button color='inherit' key='catalog'
                    component={RouterLink} to='catalog'>New Arrivals</Button>
            <span>
                    <Typography display="inline">Free shipping </Typography>
                    <Typography display="inline" sx={{color: 'secondary.contrastText'}}>on all</Typography>
                </span>
            <Stack alignItems='center' sx={{backgroundColor: 'transparent'}} spacing={2}>
                <TravelExploreIcon fontSize='large'/>
                <Typography>Do you want to explore more?</Typography>
                <Typography>We keep updating our inventory with exciting new products !!</Typography>
                <Button variant='outlined' color='inherit' component={RouterLink} to='catalog'>Find More in Catalog</Button>
            </Stack>
        </Stack>
    );
}
