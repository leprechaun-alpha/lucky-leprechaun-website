import React, { useEffect, useState } from 'react';
import './Lottery.scss';
import * as CoinGecko from "coingecko-api"

const Lottery = ({ CONFIG, web3 }) => {
    const [ethPrice, setEthPrice] = useState(4500)
    const winnerTiers = [1, 1, 1, 7, 40, 200]
    const distributionSchedule = [0.15, 0.10, 0.05, 0.02, 0.0065, 0.0015]
    let formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });

    const getEthPrice = async () => {
        try {
            const CoinGeckoClient = new CoinGecko();
            let data = await CoinGeckoClient.simple.price({
                ids: ['ethereum'],
                vs_currencies: ['usd'],
            })
            setEthPrice(data.data.ethereum.usd)
            return ethPrice
        } catch (e) {
            console.log(e);
            return ethPrice
        }
    }
    const updateTableData = (totalWinnings) => {
        for (let i = 1; i <= winnerTiers.length; i++) {
            let el = document.getElementById(`row-winnings-${i}`)
            let percentWon = distributionSchedule[i - 1];
            el.innerHTML = formatter.format(percentWon * totalWinnings)
        }
    }

    useEffect(() => {
        const updatePrices = async () => {
            let ethPrice = await getEthPrice()
            return ethPrice * CONFIG.MAX_SUPPLY * CONFIG.DISPLAY_COST * CONFIG.PAYOUT_RATIO
        }

        updatePrices().then(x => {
            document.getElementById("distribution-weekly").innerHTML = formatter.format(x / CONFIG.NUMBER_OF_LOTTERIES)
            document.getElementById("distribution-total").innerHTML = formatter.format(x)
            updateTableData(x / CONFIG.NUMBER_OF_LOTTERIES)
        })
    })

    return (
        <div className="section" id="lottery">
            <div id="lottery-section-top" class="lottery-section">
                <div class="lottery-stats">
                    <div id="distribution-total-section" class="lottery-stats-subsection">
                        <h2 class="white strong lottery-stats-text">Expected Distribution to LEP Holders:</h2>
                        <div id="distribution-total" class="strong lottery-stats-number"></div>
                    </div>
                    <div id="distribution-weekly-section" class="lottery-stats-subsection">
                        <h2 class="white strong lottery-stats-text">Weekly Distribution:</h2>
                        <div id="distribution-weekly" class="strong lottery-stats-number"></div>

                    </div>
                </div>
                <p>Estimated assuming a mint sellout and an ETH price of {formatter.format(ethPrice)}</p>
            </div>

            <div id="lottery-info" class="lottery-section">
                <div id="lottery-about">
                    <h1 class="white strong">The Lottery Mechanism <span class="orange strong"></span></h1>
                    <ol>
                        <li><span>50% of minting revenue is locked in a smart contract</span></li>
                        <li><span>The smart contract executes a lottery function at a set time, every week for {CONFIG.NUMBER_OF_LOTTERIES} weeks using <span class="white">Chainlink Keepers</span></span></li>
                        <li><span>Winners are chosen at random using <span class="white">Chainlink's VRF</span> - see the table below for the number of winners and the distribution schedule</span></li>
                        <li><span>Only Lucky Leprechaun holders can participate in the lottery</span></li>
                        <li><span>The number of entries each holder receives is dependent on the <span class="white lottery-info-subsection">number of days they have held</span>, and whether or not they <span class="white lottery-info-subsection">minted their LEP</span></span></li>
                        {/*                         <li class="bullet"><span>This lottery mechanism is verifiable on Etherscan and uses Chainlink VRF and Chainlink Keepers to execute at a certian time and ensure validity of randomness</span></li>
 */}                    </ol>
                </div>
                <div id="lottery-entry">
                    <div>
                        <h3>How many entries do I get?</h3>
                        <p class="left-text">For every day you hold, you recieve 1 more entry to the lottery. A maximum of 7 can be attained by each LEP.</p>
                    </div>
                    <div>
                        <h3 class="orange">Minting doubles your chance of winning</h3>
                        <p class="left-text">If the current holder of the LEP is the same address as the one who minted it then that LEP receives double the entries</p>
                    </div>
                    <div id="div-entry-table">
                        <table id="entry-table">
                            <thead>
                                <tr>
                                    <td style={{fontSize: "small"}}>Entries</td>
                                    <th colSpan="8">Days held</th>
                                </tr>
                                <tr>
                                    <th></th>
                                    <th>&lt;1</th>
                                    <th>1</th>
                                    <th>2</th>
                                    <th>3</th>
                                    <th>4</th>
                                    <th>5</th>
                                    <th>6</th>
                                    <th><span class="orange">7+</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th>Did not mint</th>
                                    <td>0</td>
                                    <td>1</td>
                                    <td>2</td>
                                    <td>3</td>
                                    <td>4</td>
                                    <td>5</td>
                                    <td>6</td>
                                    <td>7</td>
                                </tr>
                                <tr>
                                    <th><span class="orange">Minted</span></th>
                                    <td>0</td>
                                    <td>2</td>
                                    <td>4</td>
                                    <td>6</td>
                                    <td>8</td>
                                    <td>10</td>
                                    <td>12</td>
                                    <td><span class="orange strong">14</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
            <div id="lottery-section-bottom" class="lottery-section">
                <div id="lottery-prize-pool-section">
                    <table>
                        <thead>
                            <tr>
                                <th>Place</th>
                                <th>% of Prize Pool Won</th>
                                <th>Estimated Winnings</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <th>1</th>
                                <td>15%</td>
                                <td id="row-winnings-1"></td>
                            </tr>
                            <tr>
                                <th>2</th>
                                <td>10%</td>
                                <td id="row-winnings-2"></td>
                            </tr>
                            <tr>
                                <th>3</th>
                                <td>5%</td>
                                <td id="row-winnings-3"></td>
                            </tr>
                            <tr>
                                <th>4-10</th>
                                <td>2%</td>
                                <td id="row-winnings-4"></td>
                            </tr>
                            <tr>
                                <th>11-50</th>
                                <td>0.65%</td>
                                <td id="row-winnings-5"></td>
                            </tr>
                            <tr>
                                <th>51-250</th>
                                <td>0.15%</td>
                                <td id="row-winnings-6"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
export default Lottery;