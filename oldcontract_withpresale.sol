// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

interface ILuckyLep {
  function totalSupply() external returns (uint256);
  function timestampOfLastTransfer(uint256 tokenId) external returns (uint256);
  function mintAddresses(uint256 tokenId) external returns (address);
  function ownerOf(uint256 tokenId) external returns (address);
}

contract LuckyLepRaffle is Ownable, VRFConsumerBase, KeeperCompatibleInterface {
  bytes32 public keyHash;
  uint256 public fee;
  uint256 public lastTimeStamp;
  uint256 public interval;
  ILuckyLep public luckyLeprechauns;
  bool public raffleOpen;
  uint256 public winAmount;
  address public recentWinner;
  uint256 public remainingLotteries = 5;
  uint256 public numberOfWinners = 10;
  mapping(uint256 => address) private entryToAddress;

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
  function checkUpkeep(bytes memory /* checkData */) public view override returns (bool upkeepNeeded, bytes memory performData){
      bool hasLink = LINK.balanceOf(address(this)) >= fee;
      upkeepNeeded = (((lastTimeStamp + interval) <= block.timestamp ) && hasLink && raffleOpen && (address(this).balance >= winAmount) && remainingLotteries > 0);
      performData = bytes("");
  }
  
  function performUpkeep(bytes calldata /* performData */) external override {
      require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");
      require(address(this).balance >= winAmount, "Not enough ETH");
      require(raffleOpen, "Raffle is not open");
      require(remainingLotteries > 0, "All lotteries have been run!");
      (bool upkeepNeeded, ) = checkUpkeep("");
      require(upkeepNeeded, "Upkeep not needed");
      lastTimeStamp = block.timestamp;
      bytes32 requestId = requestRandomness(keyHash, fee);
      emit requestedRaffleWinner(requestId);
  }

  function fulfillRandomness(bytes32 /* requestId */, uint256 randomness) internal override {
      uint256 supply = luckyLeprechauns.totalSupply();
      uint256 totalEntries = 0;
      address[] memory _winners = new address[](numberOfWinners);
      uint256[] memory _amounts = new uint256[](numberOfWinners);

      // for loop that updates the number of entries and entryToAddress mapping
      for (uint256 i = 1; i <= supply; i++) {
          uint256 lengthHeld = block.timestamp - luckyLeprechauns.timestampOfLastTransfer(i);
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
      uint256 adjustmentFactor = address(this).balance / 10_000 / remainingLotteries;
      uint256 totalWon;
      uint256 amountWon;
      // for loop that selects the winner and amount won
      for (uint256 i = 1; i <= numberOfWinners; i++) {
          uint256 randomNumber = uint256(
              keccak256(abi.encode(randomness, i))
          ) % supply;
          address randomWinner = entryToAddress[randomNumber];
          //hardcoded distribution schedule
          if (i == 1) {
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
          }
          totalWon += amountWon * adjustmentFactor;
          _winners[i - 1] = randomWinner;
          _amounts[i - 1] = amountWon * adjustmentFactor - expectedGasFee;
      }

      // for loop that distributes the winnings
      require(totalWon <= address(this).balance, "can't give more ETH than the balance!");
      require(_winners.length == _amounts.length, "Function called incorrectly!");
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

  function setRaffleOpen(bool _raffleOpen) public onlyOwner {
      raffleOpen = _raffleOpen;
  }

  function setRemainingLotteries(uint256 _remainingLotteries) public onlyOwner {
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
    uint256 public nftPerAddressLimit = 3;
    bool public paused = false;
    bool public revealed = false;
    bool public onlyWhitelisted = true;
    address[] public whitelistedAddresses;
    string public baseURI;
    
    mapping(address => uint256) public addressMintedBalance;
    mapping(uint256 => address) public mintAddresses;
    mapping(uint256 => uint256) public timestampOfLastTransfer;

    constructor() ERC721("Lucky Leprechauns", "LEP"){}

    // internal
    function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override {
        super._beforeTokenTransfer(from, to, tokenId);
        timestampOfLastTransfer[tokenId] = block.timestamp;
    }
    // basic functions 
    function _baseURI() internal view virtual override returns (string memory){
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
            if (onlyWhitelisted == true) {
                require(isWhitelisted(msg.sender), "user is not whitelisted");
                uint256 ownerMintedCount = addressMintedBalance[msg.sender];
                require(
                    ownerMintedCount + _mintAmount <= nftPerAddressLimit,
                    "max NFT per address exceeded"
                );
            }
            require(msg.value >= cost * _mintAmount, "insufficient funds");
        }

        for (uint256 i = 1; i <= _mintAmount; i++) {
            addressMintedBalance[msg.sender]++;
            _safeMint(msg.sender, supply + i);
            mintAddresses[supply + i] = msg.sender;
        }
    }

    function isWhitelisted(address _user) public view returns (bool) {
      for (uint256 i = 0; i < whitelistedAddresses.length; i++) {
          if (whitelistedAddresses[i] == _user) {
              return true;
          }
      }
      return false;
    }

    function walletOfOwner(address _owner) public view returns (uint256[] memory) {
      uint256 ownerTokenCount = balanceOf(_owner);
      uint256[] memory tokenIds = new uint256[](ownerTokenCount);
      for (uint256 i; i < ownerTokenCount; i++) {
          tokenIds[i] = tokenOfOwnerByIndex(_owner, i);
      }
      return tokenIds;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
      require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
      string memory currentBaseURI = _baseURI();
      return bytes(currentBaseURI).length > 0 
        ? string(abi.encodePacked(currentBaseURI, tokenId.toString(), baseExtension)) : "";
    }

    //only owner
    function setNftPerAddressLimit(uint256 _limit) public onlyOwner {
        nftPerAddressLimit = _limit;
    }

    function setCost(uint256 _newCost) public onlyOwner {
        cost = _newCost;
    }

    function setmaxMintAmount(uint256 _newmaxMintAmount) public onlyOwner {
        maxMintAmount = _newmaxMintAmount;
    }

    function setBaseExtension(string memory _newBaseExtension) public onlyOwner {
      baseExtension = _newBaseExtension;
    }

    function pause(bool _state) public onlyOwner {
        paused = _state;
    }

    function setOnlyWhitelisted(bool _state) public onlyOwner {
        onlyWhitelisted = _state;
    }

    function whitelistUsers(address[] calldata _users) public onlyOwner {
        delete whitelistedAddresses;
        whitelistedAddresses = _users;
    }

    function withdraw() public payable onlyOwner {
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
    }

    receive() external payable {}
}
