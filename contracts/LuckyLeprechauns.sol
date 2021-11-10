// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

contract LuckyLepWinners is PaymentSplitter {
    uint256 public lotteryNumber;

    constructor(
        address[] memory _payees,
        uint256[] memory _shares,
        uint256 _lotteryNumber
    ) payable PaymentSplitter(_payees, _shares) {
        lotteryNumber = _lotteryNumber;
    }
}

interface ILuckyLep {
    function totalSupply() external returns (uint256);

    function timestampOfLastTransfer(uint256 tokenId)
        external
        returns (uint256);

    function mintAddresses(uint256 tokenId) external returns (address);

    function ownerOf(uint256 tokenId) external returns (address);
}

contract LuckyLepRaffle is Ownable, VRFConsumerBase, KeeperCompatibleInterface {
    //chainlink
    bytes32 public keyHash;
    uint256 public fee;
    
    uint256 public lastTimeStamp;
    uint256 public interval;
    ILuckyLep public luckyLeprechauns;
    bool public raffleOpen;
    uint256 public winAmount;
    address public recentWinner;
    uint256 public remainingLotteries = 3;
    uint256 public numberOfWinners;
    mapping(uint256 => address) private entryToAddress;
    uint256[] public distributionSchedule;
    uint256[] public winnersDist;

    event requestedRaffleWinner(bytes32 indexed requestId);

    constructor(
        address _vrfCoordinator,
        address _linkToken,
        bytes32 _keyHash,
        uint256 _fee,
        ILuckyLep _luckyLeprechauns,
        uint256 _winAmount
    ) VRFConsumerBase(_vrfCoordinator, _linkToken) {
        lastTimeStamp = block.timestamp;
        keyHash = _keyHash;
        fee = _fee;
        luckyLeprechauns = _luckyLeprechauns;
        interval = 4 weeks;
        raffleOpen = false;
        winAmount = _winAmount;
    }

    // RAFFLE
    function checkUpkeep(
        bytes memory /* checkData */
    )
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        bool hasLink = LINK.balanceOf(address(this)) >= fee;
        upkeepNeeded = (((lastTimeStamp + interval) <= block.timestamp) &&
            hasLink &&
            raffleOpen &&
            (address(this).balance >= winAmount) &&
            remainingLotteries > 0);
        performData = bytes("");
    }

    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");
        require(address(this).balance >= winAmount, "Not enough ETH");
        require(raffleOpen, "Raffle is not open");
        require(remainingLotteries > 0, "All lotteries have been run!");
        require(
            distributionSchedule.length > 0 && winnersDist.length > 0,
            "Must set distribution schedule"
        );
        require(numberOfWinners > 0, "Must set number of winners");
        (bool upkeepNeeded, ) = checkUpkeep("");
        require(upkeepNeeded, "Upkeep not needed");
        lastTimeStamp = block.timestamp;
        bytes32 requestId = requestRandomness(keyHash, fee);
        emit requestedRaffleWinner(requestId);
    }

    function fulfillRandomness(
        bytes32, /* requestId */
        uint256 randomness
    ) internal override {
        uint256 supply = luckyLeprechauns.totalSupply();
        uint256 totalEntries = 0;
        address[] memory _winners = new address[](numberOfWinners);
        uint256[] memory _amounts = new uint256[](numberOfWinners);

        // for loop that updates the number of entries and entryToAddress mapping
        for (uint256 i = 1; i <= supply; i++) {
            uint256 lengthHeld = block.timestamp -
                luckyLeprechauns.timestampOfLastTransfer(i);
            address mintAddress = luckyLeprechauns.mintAddresses(i);
            address holder = luckyLeprechauns.ownerOf(i);
            uint256 scalingFactor = 1;
            if (holder == mintAddress) {
                scalingFactor = 2;
            }
            uint256 entries = (lengthHeld / (1 minutes)) * scalingFactor;
            if (entries > 7) {
                entries == 7;
            }
            totalEntries += entries;

            for (uint256 j = 1; j <= entries; j++) {
                entryToAddress[totalEntries - entries + j] = holder;
            }
        }

        uint256 expectedGasFee;
        uint256 adjustmentFactor = address(this).balance /
            10_000 /
            remainingLotteries;
        uint256 totalWon;
        uint256 amountWon;
        // for loop that selects the winner and amount won
        for (uint256 i = 1; i <= numberOfWinners; i++) {
            uint256 randomNumber = uint256(
                keccak256(abi.encode(randomness, i))
            ) % supply;
            address randomWinner = entryToAddress[randomNumber];
            for (uint256 j = 0; j < distributionSchedule.length; j++) {
                if (i <= distributionSchedule[j]) {
                    amountWon = winnersDist[j];
                    break;
                }
            }
            //hardcoded distribution schedule
            /* if (i == 1) {
              amountWon = 1500; // percentage * 10^4
          } else if (i == 2) {
              amountWon = 1000;
          } else if (i == 3) {
              amountWon = 500;
          } else if (i > 3 && i <= 10) {
              amountWon = 200;
          } else if (i > 10 && i <= 50) {
              amountWon = 65;
          } else {
              amountWon = 15;
          } */
            totalWon += amountWon * adjustmentFactor;
            _winners[i - 1] = randomWinner;
            _amounts[i - 1] = amountWon * adjustmentFactor - expectedGasFee;
        }

        // for loop that distributes the winnings
        require(
            totalWon <= address(this).balance,
            "can't give more ETH than the balance!"
        );
        require(
            _winners.length == _amounts.length,
            "Function called incorrectly!"
        );
        for (uint256 i = 0; i < _winners.length; i++) {
            (bool success, ) = _winners[i].call{value: _amounts[i]}("");
            require(success, "Transfer failed");
            //payable(_winners[i]).transfer(_amounts[i]);
        }
        remainingLotteries - 1;
    }

    //// OWNER ADMIN ////
    function setWinAmount(uint256 _winAmount) public onlyOwner {
        winAmount = _winAmount;
    }

    function setDistributionSchedule(
        uint256[] memory _distributionSchedule,
        uint256[] memory _winnersDist
    ) public onlyOwner {
        require(_distributionSchedule.length == _winnersDist.length);
        uint256 sum = 0;
        uint256 _numberOfWinners = 0;
        for (uint256 i = 0; i < _winnersDist[_winnersDist.length - 1]; i++) {
            for (uint256 j = 0; j < _winnersDist.length; j++) {
                if (i >= _winnersDist[j]) {
                    continue;
                } else {
                    sum += _distributionSchedule[j];
                    break;
                }
            }
        }
        for (uint256 j = 0; j < _distributionSchedule.length; j++) {
            _numberOfWinners += _distributionSchedule[j];
        }
        require(sum == 10000, "distribution must sum to 100%");
        distributionSchedule = _distributionSchedule;
        winnersDist = _winnersDist;
        numberOfWinners = _numberOfWinners;
    }

    function setRaffleOpen(bool _raffleOpen) public onlyOwner {
        raffleOpen = _raffleOpen;
    }

    function setRemainingLotteries(uint256 _remainingLotteries)
        public
        onlyOwner
    {
        remainingLotteries = _remainingLotteries;
    }

    function setInterval(uint256 _interval) public onlyOwner {
        interval = _interval;
    }

    receive() external payable {}
}

contract LuckyLeprechauns is ERC721Enumerable, Ownable {
    using Strings for uint256;
    string public baseExtension = ".json";
    uint256 public cost = 1 ether;
    uint256 public maxSupply = 10000;
    uint256 public maxMintAmount = 20;
    bool public paused = false;
    string public baseURI;
    address public lotteryContract;

    mapping(address => uint256) public addressMintedBalance;
    mapping(uint256 => address) public mintAddresses;
    mapping(uint256 => uint256) public timestampOfLastTransfer;

    constructor() ERC721("Lucky Leprechauns", "LEP") {}

    // internal
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);
        timestampOfLastTransfer[tokenId] = block.timestamp;
    }

    // basic functions
    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory _newURI) public onlyOwner {
        baseURI = _newURI;
    }

    // public
    function mint(uint256 _mintAmount) public payable {
        require(!paused, "the contract is paused");
        uint256 supply = totalSupply();
        require(_mintAmount > 0, "need to mint at least 1 NFT");
        require(
            _mintAmount <= maxMintAmount,
            "max mint amount per session exceeded"
        );
        require(supply + _mintAmount <= maxSupply, "max NFT limit exceeded");

        if (msg.sender != owner()) {
            require(msg.value >= cost * _mintAmount, "insufficient funds");
        }

        for (uint256 i = 1; i <= _mintAmount; i++) {
            addressMintedBalance[msg.sender]++;
            _safeMint(msg.sender, supply + i);
            mintAddresses[supply + i] = msg.sender;
        }
    }

    function walletOfOwner(address _owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
        }
        return tokenIds;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        tokenId.toString(),
                        baseExtension
                    )
                )
                : "";
    }

    //only owner
    function setCost(uint256 _newCost) public onlyOwner {
        cost = _newCost;
    }

    function setmaxMintAmount(uint256 _newmaxMintAmount) public onlyOwner {
        maxMintAmount = _newmaxMintAmount;
    }

    function setBaseExtension(string memory _newBaseExtension)
        public
        onlyOwner
    {
        baseExtension = _newBaseExtension;
    }

    function setLotteryContract(address _lotteryContract) public onlyOwner {
        lotteryContract = _lotteryContract;
    }

    function pause(bool _state) public onlyOwner {
        paused = _state;
    }

    function withdraw() public payable onlyOwner {
        require(
            lotteryContract != address(0),
            "Must initialize lottery address!"
        );
        (bool success, ) = lotteryContract.call{
            value: address(this).balance / 50
        }("");
        require(success, "Transfer to lottery failed");
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os, "Transfer to owner failed");
    }

    receive() external payable {}
}
