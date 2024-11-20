import {useQuery} from '@tanstack/react-query';
import {getProduct, getProducts} from "../api/catalogClient.ts";
import {ProductData} from "../types/Catalog.ts";

const defaultCatalog = {
    data: [{
        id: "e94efe81-22f0-40a7-8eaa-a77fb04ba39b",
        imageUrl1: "/bike1.png",
        imageUrl2: "/bike1.png",
        imageUrl3: "/bike1.png",
        name: "VelociFlex 3000",
        shortDescription: "Introducing the VelociFlex 3000, a cutting-edge bicycle that combines style and performance. Its lightweight alloy frame ensures speed and comfort, while the patented ComfortRide suspension provides a smooth ride on any terrain. With an intelligent gear-shifting system and SolarCharge technology powering LED lights and Bluetooth connectivity, this bike is perfect for both city commuting and adventurous trails. Customize your ride with various color options and enjoy ergonomic handlebars for maximum comfort. Experience the future of cycling with the VelociFlex 3000!",
        description: "# Introducing the **VelociFlex 3000**\n" +
            "\n" +
            "The ultimate fusion of style and performance in a bike that’s unlike any other. Featuring a sleek, aerodynamic frame made from a revolutionary lightweight alloy, the VelociFlex 3000 is designed for speed without sacrificing comfort. \n" +
            "\n" +
            "## Key Features\n" +
            "\n" +
            "- **Patented ComfortRide Suspension System**: Adapts to any terrain, ensuring a smooth journey whether you're cruising city streets or tackling rugged trails.\n" +
            "- **Intelligent Gear-Shifting Mechanism**: Effortlessly switch between eight precision-engineered gears at the flick of a wrist.\n" +
            "- **Innovative SolarCharge Battery System**: Powers built-in LED lights and Bluetooth connectivity for tracking your rides on your smartphone.\n" +
            "- **Customizable Color Options**: Personalize your bike to match your style.\n" +
            "- **Ergonomic Handlebars**: Designed for maximum comfort during long rides.\n" +
            "\n" +
            "Experience the future of cycling with the VelociFlex 3000 and elevate your ride to a whole new level!\n" +
            "\n" +
            "\n",
        price: 1299.95,
        tags: ["bicycle"],
    },
        {
            id: "e81ed929-f1fb-4e27-8ab3-364570b9b4ad",
            imageUrl1: "/bike2.png",
            imageUrl2: "/bike2.png",
            imageUrl3: "/bike2.png",
            name: "EcoCruiser X1",
            shortDescription: "Introducing the EcoCruiser X1, the perfect blend of sustainability and innovation. Made from 100% recycled aluminum, this lightweight bike features HydroGuard tires for excellent grip in wet conditions and an adaptive comfort seat for long rides. The integrated smart dashboard tracks your speed and distance, while the solar-powered assist offers extra energy for your adventures. Ride eco-friendly and enjoy every moment with the EcoCruiser X1!",
            description: "# Presenting the **EcoCruiser X1**\n" +
                "\n" +
                "Revolutionize your ride with the EcoCruiser X1, the perfect blend of sustainability and cutting-edge technology. Crafted from recycled materials, this bike not only minimizes your carbon footprint but also delivers an exhilarating riding experience.\n" +
                "\n" +
                "## Key Features\n" +
                "\n" +
                "- **EcoSmart Frame**: Constructed from 100% recycled aluminum, ensuring durability and lightweight performance.\n" +
                "- **HydroGuard Tires**: Designed with advanced water-repellent technology for optimal grip in wet conditions, making every ride safe and stable.\n" +
                "- **Adaptive Comfort Seat**: Features memory foam cushioning that molds to your body shape, providing unparalleled comfort for long-distance rides.\n" +
                "- **Integrated Smart Dashboard**: Stay connected with a built-in display that tracks speed, distance, and heart rate, plus GPS navigation to guide your journey.\n" +
                "- **Solar-Powered Assist**: Utilize solar energy for additional power, perfect for those longer adventures.\n" +
                "\n" +
                "Whether you’re commuting through the city or exploring scenic routes, the EcoCruiser X1 ensures an eco-friendly and enjoyable ride. Join the cycling revolution today!",
            price: 1099.99,
            tags: ["bicycle"],
        },
        {
            id: "f4e3b730-bc12-4262-9394-f914a419e6f7",
            imageUrl1: "/bike3.png",
            imageUrl2: "/bike3.png",
            imageUrl3: "/bike3.png",
            name: "ThunderBolt 500",
            shortDescription: "Meet the ThunderBolt 500, the ultimate bike for speed enthusiasts. Featuring a lightweight carbon fiber frame and dynamic dual-action suspension, it delivers a smooth ride on any terrain. The QuickShift gearing system allows for effortless transitions, while integrated high-visibility LED strips ensure safety during night rides. With adjustable handlebars for a perfect fit, the ThunderBolt 500 is your ticket to thrilling cycling adventures!",
            description: "# ThunderBolt 500\n" +
                "\n" +
                "Unleash your inner speedster with the ThunderBolt 500, engineered for thrill-seekers and urban explorers alike. Its ultra-light carbon fiber frame and aerodynamic design ensure lightning-fast performance, while the dual-action suspension absorbs shocks for a smooth ride on any surface.\n" +
                "\n" +
                "## Key Features\n" +
                "\n" +
                "- **Carbon Fiber Frame**: Lightweight and strong, built for speed.\n" +
                "- **Dynamic Shock Absorption**: Dual-action suspension for maximum comfort on rough terrains.\n" +
                "- **QuickShift Gearing System**: Seamless transitions through ten gears for ultimate versatility.\n" +
                "- **High-Visibility LED Strips**: Integrated into the frame for enhanced safety during night rides.\n" +
                "- **Custom Fit Handlebars**: Adjustable to suit your riding style and comfort.\n" +
                "\n" +
                "Experience the rush of the ThunderBolt 500 and redefine your cycling adventures!",
            price: 1499.99,
            tags: ["bicycle"],
        },
        {
            id: "64c64054-09b6-42ed-b94a-bf2400557fc6",
            imageUrl1: "/bike4.png",
            imageUrl2: "/bike4.png",
            imageUrl3: "/bike4.png",
            name: "Urban Glide ZR",
            shortDescription: "Introducing the Urban Glide ZR, your ideal bike for navigating city life. With its lightweight aluminum frame and puncture-resistant tires, it offers both style and practicality. The reliable disc brakes ensure safety, while the integrated storage rack adds convenience for everyday errands. Plus, reflective accents keep you visible during night rides. Ride the Urban Glide ZR and enjoy urban cycling like never before!",
            description: "# Urban Glide ZR\n" +
                "\n" +
                "Discover the Urban Glide ZR, the perfect companion for city dwellers and weekend wanderers. This stylish bike features a sleek aluminum frame that combines modern aesthetics with practical functionality. Its puncture-resistant tires and reliable braking system make navigating urban landscapes a breeze.\n" +
                "\n" +
                "## Key Features\n" +
                "\n" +
                "- **Stylish Aluminum Frame**: Lightweight yet durable, designed for city commuting.\n" +
                "- **Puncture-Resistant Tires**: Built to handle the challenges of urban riding.\n" +
                "- **Reliable Disc Brakes**: Ensure quick and safe stops in any weather.\n" +
                "- **Integrated Storage Rack**: Perfect for carrying groceries or gear on the go.\n" +
                "- **Reflective Accents**: Enhance visibility for safe nighttime riding.\n" +
                "\n" +
                "Elevate your daily commute with the Urban Glide ZR and ride with confidence and style!",
            price: 1299.99,
            tags: ["bicycle"],
        },
        {
            id: "bf32f316-3902-4913-b926-1ee0dfa31df9",
            imageUrl1: "/bike5.png",
            imageUrl2: "/bike5.png",
            imageUrl3: "/bike5.png",
            name: "TrailBlazer XT",
            shortDescription: "Meet the TrailBlazer XT, your go-to bike for off-road adventures. With a reinforced steel frame and all-terrain tires, it’s built to tackle rugged trails with ease. The progressive seven-speed gear system and built-in suspension fork ensure a smooth ride, while the water-resistant design keeps everything protected. Get ready to explore the outdoors like never before!",
            description: "# TrailBlazer XT\n" +
                "\n" +
                "Conquer the great outdoors with the TrailBlazer XT, designed for adventure enthusiasts who crave rugged terrains and exhilarating rides. Its reinforced steel frame provides unmatched durability, while the advanced all-terrain tires ensure grip and stability on any surface.\n" +
                "\n" +
                "## Key Features\n" +
                "\n" +
                "- **Reinforced Steel Frame**: Built to withstand the toughest trails.\n" +
                "- **All-Terrain Tires**: Designed for optimal traction on dirt, gravel, and mud.\n" +
                "- **Progressive Gear System**: Offers seven gears for versatile riding in varied conditions.\n" +
                "- **Built-In Suspension Fork**: Absorbs shocks from rough paths for a smoother ride.\n" +
                "- **Water-Resistant Design**: Keeps components safe from the elements.\n" +
                "\n" +
                "Get ready to explore uncharted paths with the TrailBlazer XT and take your cycling adventures to the next level!\n",
            price: 1399.99,
            tags: ["bicycle"],
        },
        {
            id: "1066a896-42e8-4e36-bc64-e8b11f00ed06",
            imageUrl1: "/accessory1.png",
            imageUrl2: "/accessory1.png",
            imageUrl3: "/accessory1.png",
            name: "ComfortRide Pro",
            shortDescription: "Experience unmatched comfort on your rides with the ComfortRide Pro bicycle seat. Designed with high-density memory foam, this seat contours to your body for superior support. Its breathable, moisture-wicking cover ensures you stay cool, while the shock-absorbing technology minimizes bumps from rough terrains. Lightweight and easy to install, the ComfortRide Pro is perfect for cyclists of all levels. Upgrade your ride today!",
            description: "# ComfortRide Pro\n" +
                "\n" +
                "Transform your cycling experience with the ComfortRide Pro bicycle seat. Engineered for maximum comfort, this seat features high-density memory foam that molds to your body for exceptional support on long rides.\n" +
                "\n" +
                "## Key Features\n" +
                "\n" +
                "- **High-Density Memory Foam**: Provides superior comfort and support.\n" +
                "- **Breathable Cover**: Moisture-wicking material keeps you cool and dry.\n" +
                "- **Shock-Absorbing Technology**: Minimizes impact from rough terrains for a smoother ride.\n" +
                "- **Lightweight Design**: Easy to install and perfect for any bike.\n" +
                "- **Universal Fit**: Compatible with most standard bike frames.\n" +
                "\n" +
                "Upgrade your cycling experience with the ComfortRide Pro and ride in comfort, no matter the distance!",
            price: 199.99,
            tags: ["accessory"],
        },
        {
            id: "cdd24b84-921b-495b-9547-d2a5e528cb62",
            imageUrl1: "/accessory2.png",
            imageUrl2: "/accessory2.png",
            imageUrl3: "/accessory2.png",
            name: "RingMaster Deluxe",
            shortDescription: "Stay safe and stylish on your rides with the RingMaster Deluxe bicycle bell. Featuring a classic design with a powerful, clear tone, this bell ensures you’re heard in busy environments. Crafted from durable, weather-resistant materials, it withstands the elements while adding a touch of elegance to your bike. Easy to install and compatible with most handlebars, the RingMaster Deluxe is the perfect accessory for every cyclist. Make your presence known!",
            description: "# RingMaster Deluxe\n" +
                "\n" +
                "Enhance your cycling experience with the RingMaster Deluxe bicycle bell. Combining classic design with modern functionality, this bell delivers a powerful, clear tone to alert pedestrians and fellow cyclists.\n" +
                "\n" +
                "## Key Features\n" +
                "\n" +
                "- **Classic Design**: Timeless look that complements any bike style.\n" +
                "- **Powerful Sound**: Clear and loud tone ensures you're heard in busy environments.\n" +
                "- **Durable Materials**: Crafted from weather-resistant materials for long-lasting use.\n" +
                "- **Easy Installation**: Simple to attach to most handlebars without hassle.\n" +
                "- **Lightweight and Compact**: Perfect for everyday commuting or leisurely rides.\n" +
                "\n" +
                "Make your rides safer and more enjoyable with the RingMaster Deluxe—ring in style and confidence!",
            price: 199.99,
            tags: ["accessory"],
        }
    ]
}

export const useGetProducts = () => {
    const {data, error, isLoading} = useQuery<{ data: ProductData[] }, Error>({
        queryKey: ['getProducts'],
        queryFn: getProducts,
        onError: (err) => {
            console.error('Error fetching product data:', err);
        },
        retry: false,
    });
    const products = (error || isLoading) ? defaultCatalog : data;

    return {data: products, isLoading, error};
};

export const useGetProduct = (productId: string) => {
    const {data, isLoading, error} = useQuery<{ data: ProductData }, Error>({
        queryKey: ['getProduct', productId],
        queryFn: () => getProduct(productId),
        onError: (err) => {
            console.error('Error fetching product data:', err);
        },
        retry: false,
    });

    const product = (error || isLoading) ? {data: defaultCatalog.data.find((product) => product.id == productId)} : data;

    return {data: product, isLoading, error}
};
