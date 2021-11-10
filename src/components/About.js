import React from 'react';
import './About.scss';


const About = ({config}) => { 
    const format = (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");        
    }
    return(
    <div id="about" class="section">
        <div id="about-text">
            <p class="paragraph-medium">
                Lucky Leprechauns is a collection of <span class="white">{format(config.MAX_SUPPLY)} NFTs</span> on the Ethereum blockchain, with each LEP being
                a combination of hundreds of attributes ensuring uniqueness among the collection.
            </p>
            <p class="paragraph-medium">
                Holding a LEP will give the owner exclusive access to a <span class="orange strong">weekly lottery</span>, in which over the course of {config.NUMBER_OF_LOTTERIES} weeks, 50% of the minting revenue will be distributed to holders.
                This lottery mechanism is enforced <span class="white">via code</span> so that each lottery is distributed fairly and as promised.
            </p>
        </div>
        <div id="about-img">
            <img src="/leprechauns/about-lep.png" alt="leprechaun"/>
        </div>
    </div>
)}
export default About;