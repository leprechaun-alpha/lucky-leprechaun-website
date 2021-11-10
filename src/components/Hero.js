import React from 'react';
import './Hero.scss';


const Hero = () => (
    <div id="hero" class="section">
        <div id="hero-text-section">
            <h1 class="header-text">The future of permissionless NFT <span class="orange">lotteries</span> has arrived.</h1>
        </div>
        <div id="hero-image-section">
            <img src="/leprechauns/hero-5.png" id="hero-mainimg-5" class="hero-mainimg" alt="5 leprechauns"/>
            <img src="/leprechauns/hero-3.png" id="hero-mainimg-3" class="hero-mainimg" alt="3 leprechauns"/>
        </div>
        <div id="mint-btn" class="border-link">Mint</div>

    </div>
)
export default Hero;