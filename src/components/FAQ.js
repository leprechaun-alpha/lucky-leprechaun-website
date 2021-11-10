import React from 'react';
import Question from './helpers/Question';
import './FAQ.scss';


const FAQ = ({ config }) => {
    return (
        <div id="faq" class="section">
            <h1>FAQ</h1>
            <div id="questions-answers">
                <Question question={"What is Lucky Leprechauns?"}
                    answer={`Lucky Leprechaun is a collection of ${config.MAX_SUPPLY} ERC721 tokens on the Ethereum blockchain. Each NFT provides unprecedented opportunity to their holders.`} />
                <Question question={"When and where can I purchase a Lucky Leprechaun?"}
                    answer={"Details regarding the release date will be announced on this website and on our Discord and Twitter."} />
                <Question question={"What are the benefits of minting a Lucky Leprechaun?"}
                    answer={"Minting a LEP doubles a holder's chance of winning in our lottery. Please see the lottery section for more info."} />
                <Question question={"What makes this project different from all the other projects out there?"}
                    answer={`Lucky Leprechauns is an ambitious take on the classic 10,000 PFP NFT collection. However, instead of the creators collecting 100% of the minting revenue,
                    Lucky Leprechauns will lock 50% of all minting funds into a Lottery contract where it will be distributed to holders on a weekly basis for ${config.NUMBER_OF_LOTTERIES} weeks.
                    This is the first of its kind idea, and will no doubt bring unparalleled opportunity to its community members.`} />
                <Question question={"Is your code verified? If so, where can I see it?"}
                    answer={"The Lottery contract's code is still in development. Approximately 2 weeks before our mint date we will deploy the contract and\
                    verify it on Etherscan. This will ensure there is enough time for our community to be confident with our project and promises before the minting phase begins."} />
                <Question question={`Why only ${config.NUMBER_OF_LOTTERIES} lotteries?`}
                    answer={"This relatively small amount of lotteries was chosen in order to maximise the potential winnings our holders can attain.\
                    We believe that the initial hype brought from these lotteries, and the fact that Lucky Leprechauns is an early mover in the NFT Lottery space,\
                    will be substantial in ensuring the long-term success of this project."} />
                <Question  question={"What if it doesn't sell out?"} 
                    answer={"All NFTs that do not sell within 5 days of the minting date will be burnt forever. The lotteries will still go ahead as planned as is defined in the code."}/>
                <Question question={"What happens after the lotteries are all finished?"} 
                    answer={"Once the lotteries are finished, and the initial hype of our project has subdued we will initiate Phase 2\
                    of the project. This will include additional future lotteries where LEP holders will be rewarded with extra entries."}/>
            </div>
        </div>);
}

export default FAQ;