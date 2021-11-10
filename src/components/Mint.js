import React from 'react';
import { useEffect, useState } from "react";
import './Mint.scss';
import Web3 from 'web3';
import { numberToHex } from 'web3-utils'
import { connectWallet, getCurrentWalletConnected } from '../utils/interact';
//import detectEthereumProvider from '@metamask/detect-provider';

const Mint = ({ CONFIG, contract, web3 }) => {
    const [walletAddress, setWallet] = useState("");
    const [status, setStatus] = useState("");
    const [totalSupply, setTotalSupply] = useState("")
    const [mintAmount, setMintAmount] = useState(1);
    const [claimingNft, setClaimingNft] = useState(false);

    useEffect(() => {
        const updateOnMount = async () => {
            const { address, status } = await getCurrentWalletConnected();
            setWallet(address);
            setStatus(status);
            addWalletListener();
            getTotalSupply();
        };
        updateOnMount()
    }, []);

    const getTotalSupply = async () => {
        let alreadyMinted = 0;
        try {
            alreadyMinted = await contract.methods.totalSupply().call()
        } catch (e) {
            console.log(e)
        }

        setTotalSupply(alreadyMinted)
    }
    const addWalletListener = () => {
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts) => {
                if (accounts.length > 0) {
                    setWallet(accounts[0])
                    setStatus(`Connected to: ${accounts[0].substring(0, 5)}...`)
                } else {
                    setWallet("")
                    setStatus(`🦊 Connect to Metamask using the top right button.`)
                }
            });
        } else {
            setStatus(
                <p>
                    {" "}
                    🦊{" "}
                    <a target="_blank" href={`https://metamask.io/download.html`}>
                        You must install Metamask, a virtual Ethereum wallet, in your
                        browser.
                    </a>
                </p>
            );
        }
    }
    const connectWalletPressed = async () => {
        const walletResponse = await connectWallet();
        setStatus(walletResponse.status);
        setWallet(walletResponse.address);
    };
    const mintNFT = async () => {
        setStatus("Minting...")
        const walletResponse = await claimNFT();
        setStatus(walletResponse.status)
        getTotalSupply()
    }
    const claimNFT = async () => {
        let cost = CONFIG.WEI_COST;
        let gasLimit = CONFIG.GAS_LIMIT;
        let totalCostWei = numberToHex(cost * mintAmount);
        let totalGasLimit = numberToHex(gasLimit * mintAmount);
        console.log("mint amount: ", mintAmount)
        console.log("Cost: ", totalCostWei);
        console.log("Gas limit: ", totalGasLimit);
        setClaimingNft(true);

        const transactionParameters = {
            to: CONFIG.CONTRACT_ADDRESS, // Required except during contract publications.
            from: window.ethereum.selectedAddress, // must match user's active address.
            data: contract.methods
                .mint(mintAmount)
                .encodeABI(),
            value: totalCostWei,
            gasLimit: totalGasLimit,
        };

        try {
            const txHash = await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [transactionParameters],
            });
            console.log(txHash)
            return {
                success: true,
                status:
                    `✅ Successfully minted ${mintAmount} Lucky Leprechaun${mintAmount > 1 ? "s!" : "!"}`,
            };
        } catch (error) {
            console.log(error)
            return {
                success: false,
                status: "Unsuccessful: " + error.message,
            };
        }
    }
    const decrementMintAmount = () => {
        let newMintAmount = mintAmount - 1;
        if (newMintAmount < 1) {
            newMintAmount = 1;
        }
        setMintAmount(newMintAmount);
    };
    const incrementMintAmount = () => {
        let newMintAmount = mintAmount + 1;
        if (newMintAmount > 10) {
            newMintAmount = 10;
        }
        setMintAmount(newMintAmount);
    };

    return (
        <div className="mint-wrapper">
            <h1>Mint</h1>
            <div className="mint-section">
                <div class="mint-about">
                    <h3>Mint a Lucky Leprechaun</h3>
                    <p><i>Minting doubles your chance of winning!</i></p>
                    <p>Price = 0.07ETH + gas</p>
                    <p>How does it work? It's simple. Before every lottery is drawn
                        our verified smart contract checks to see if the holder of the Lucky Leprechaun (your address) is
                        the same as the address that initially minted the NFT. If yes, then your entries, determined by the number
                        of days you have held the NFT (maximum of 7), are doubled for the raffle!
                    </p>
                </div>
                <div class="mint-interface">
                    <p>{totalSupply} / {CONFIG.MAX_SUPPLY}</p>
                    <p>1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST} ETH.</p>
                    <p>Excluding gas fees.</p>
                    {walletAddress.length > 0 ? (
                        <div id="mint-display">
                            <div id="mint-adjust-display">
                                <button class="mint-adjustment-button mint-adjust" onClick={decrementMintAmount}>-</button>
                                <div class="mint-adjust">{mintAmount}</div>
                                <button class="mint-adjustment-button mint-adjust" onClick={incrementMintAmount}>+</button>
                            </div>
                            <button class="mint-connect-button" onClick={mintNFT}>
                                Mint
                            </button>
                            <p>{status}</p>
                        </div>
                    ) : (
                        <div id="connect-display">
                            <p>Connect to the Ethereum Mainnet</p>
                            <button onClick={connectWalletPressed}>
                                Connect
                            </button>
                            <p>{status}</p>
                        </div>
                    )}
                </div> 
            </div>
        </div>
    )
}
export default Mint;