pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// TicketNFT Contract
contract TicketNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter; // Counter to track ticket IDs

    uint256 public maxTickets; // Maximum number of tickets that can be minted
    address public eventHost; // Address of the event host

    // Constructor to initialize the TicketNFT contract
    constructor(string memory name, string memory symbol, uint256 _maxTickets, address _eventHost) ERC721(name, symbol) {
        maxTickets = _maxTickets;
        eventHost = _eventHost;
    }

    // Modifier to restrict access to only the event host
    modifier onlyEventHost() {
        require(msg.sender == eventHost, "Only event host can call this function");
        _;
    }

    // Function to mint a new ticket
    function mintTicket(address to, string memory uri) public onlyEventHost {
        require(_tokenIdCounter.current() < maxTickets, "All tickets have been minted"); // Ensure ticket limit is not exceeded

        uint256 tokenId = _tokenIdCounter.current(); // Get the next token ID
        _tokenIdCounter.increment(); // Increment the counter
        _mint(to, tokenId); // Mint the ticket
        _setTokenURI(tokenId, uri); // Set the metadata URI
    }

    // Function to get the total number of minted tickets
    function totalMintedTickets() public view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // Function to check if a ticket exists
    function exists(uint256 tokenId) public view returns (bool) {
    return _exists(tokenId);
    }
}