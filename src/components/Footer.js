import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faDiscord } from "@fortawesome/free-brands-svg-icons";
import "./Footer.scss"
import { Link } from 'react-scroll';


const Footer = ({config}) => {

    return (
        <div className="footer section">
            <div id="footer-icons">
                {
                    /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification)) ?
                        <Link smooth={true} to="app"><img src="/leprechauns/orange_beard.png" id="footer-logo" alt="footer logo"/></Link> :
                    <a href="/#"><img src="/leprechauns/orange_beard.png" id="footer-logo" alt="footer logo"/></a>
                }
                <div id="footer-external-links">
                    <li><a href={config.TWITTER} rel="noreferrer" target="_blank"><FontAwesomeIcon icon={faTwitter} /></a></li>
                    <li><a href={config.DISCORD} rel="noreferrer" target="_blank"><FontAwesomeIcon icon={faDiscord} /></a></li>
                </div>

            </div>
        </div>
    );
}

export default Footer;