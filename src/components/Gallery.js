import React, {useState, useEffect} from 'react';
import './Gallery.scss';
import { Splide, SplideSlide } from '@splidejs/react-splide';



const Gallery = () => {
    const [windowSize, setWindowSize] = useState(window.innerWidth);

    useEffect(() => {
        window.addEventListener("resize", () => {
          setWindowSize(window.innerWidth);
        });
      }, []);

    const generateSlides = (length = 6, sig = 0) => {
        return Array.from({ length }).map((value, index) => {
            return {
                src: `/leprechauns/gallery/${index + 1}.png`,
                alt: `Leprechaun ${index + 1}`,
            };
        });
    }

    return (
        <div id="gallery" class="section">
            <Splide
                options={{
                    perPage: windowSize > 750 ? 2 : 1,
                    height: '10rem',
                    rewind: true,
                    gap: '3rem',
                    lazyLoad: 'nearby',
                }}
                
            >
                {generateSlides().map(slide => (
                    <SplideSlide key={slide.src}>
                        <img src={slide.src} alt={slide.alt} />
                    </SplideSlide>
                ))}
            </Splide>
        </div>);
}

export default Gallery;