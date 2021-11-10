import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
//import Mint from './components/Mint';
import Lottery from './components/Lottery';
//import Rarity from './components/Rarity';
import Gallery from './components/Gallery';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
//import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import './App.scss';

const App = () => {
  const CONFIG = require("./config.json")
  //const abi = require("./abi.json")
  const web3 = new Web3("wss://rinkeby.infura.io/ws/v3/aa8bb8a2bfe748368971347da99232b0")
  //const contract = new web3.eth.Contract(abi, CONFIG.CONTRACT_ADDRESS)


  return (
    <div id="app">
      <Header config={CONFIG}/>
      <Hero />
      <About config={CONFIG}/>
      <Lottery CONFIG={CONFIG} web3={web3}/>
      <Gallery />
      <FAQ config={CONFIG}/>
      <Footer config={CONFIG}/>
      {/* <Mint contract={contract} CONFIG={CONFIG} web3={web3}/>
      <Rarity />
       */}
    </div>
  );
}

export default App;