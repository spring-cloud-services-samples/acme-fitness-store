import Slider from 'react-slick';
import Container from "@mui/material/Container";
import { useGetProducts } from './hooks/catalogHooks'; 
import { Link } from "react-router-dom";

export default function CatalogCarousel() {
    const { data, isLoading, error } = useGetProducts();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: Failed to load products</div>;
    }

    const products = data.data

    if (!products || products.length < 1) {
        return <div>No products available</div>;
    }

    const first15Products = products.slice(0, 15);

    return (
        <Container sx={{ paddingY: 2}}>
            <Slider
                dots={true}
                infinite={false}
                speed={500}
                slidesToShow={3}
                slidesToScroll={1}
            >
                {first15Products.map((product) => (
                    <div key={product.id}>
                        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                            <img src={product.imageUrl1} alt={product.name} style={{ width: "100%" }} />
                            <p style={{ textAlign: "center", marginTop: "10px", color: 'inherit' }}>{product.name}</p>
                        </Link>
                    </div>
                ))}
            </Slider>
    </Container>
    );
}
