import React from 'react';
import './Header.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faDiscord } from "@fortawesome/free-brands-svg-icons";
import { Link } from 'react-scroll';

const Header = ({ config }) => {

    const burgerClick = () => {
        document.getElementById("burger-menu").classList.toggle("open")
        document.getElementById("burger-links").classList.toggle("show")
    }

    return (
        <div id="header-container">
            <div id="header">
                <div id="left-header">
                    <a href="#/"><img id="logo" src="/leprechauns/orange_beard.png" alt="leprechaun" /></a>
                </div>
                <div id="right-header-container">
                    <div id="right-header">
                        <ul id="header-page-links">
                            <li id="mint-button"><Link to="" smooth={true}>Mint</Link></li>
                            <li class="border-link hover-pointer">{
                                /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification)) ?
                                    <Link to="lottery-info" smooth={true} duration={1000}>Lottery</Link> :
                                    <a href="#lottery-info">Lottery</a>
                            }
                            </li>
                            <li class="hover-pointer">{
                                /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification)) ?
                                    <Link to="faq" smooth={true} duration={1000}>FAQ</Link> :
                                    <a href="#faq">FAQ</a>
                            }</li>
                        </ul>
                        <ul id="header-external-links" class="hover-pointer">
                            <li><a href={config.TWITTER} rel="noreferrer" target="_blank"><FontAwesomeIcon icon={faTwitter} /></a></li>
                            <li><a href={config.DISCORD} rel="noreferrer" target="_blank"><FontAwesomeIcon icon={faDiscord} /></a></li>
                        </ul>
                    </div>
                    <div id="burger-menu" onClick={burgerClick}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
            <div id="burger-links">
                <ul id="header-page-links">
                    <li id="mint-button"><a href="#/">Mint</a></li>
                    <li class="border-link hover-pointer">{
                        /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification)) ?
                            <Link to="lottery-info" smooth={true} duration={1000}>Lottery</Link> :
                            <a href="#lottery-info">Lottery</a>
                    }
                    </li>
                    <li class="hover-pointer">{
                        /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && window['safari'].pushNotification)) ?
                            <Link to="faq" smooth={true} duration={1000}>FAQ</Link> :
                            <a href="#faq">FAQ</a>
                    }</li>
                    <li class="burger-external-links hover-pointer"><a href={config.TWITTER} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faTwitter} /></a></li>
                    <li class="burger-external-links hover-pointer"><a href={config.DISCORD} target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faDiscord} /></a></li>
                </ul>
            </div>


        </div>
    )
}
export default Header;