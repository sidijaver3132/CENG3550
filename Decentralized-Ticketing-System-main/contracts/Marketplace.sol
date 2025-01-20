// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;
import './TicketNFT.sol';

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// Marketplace Contract
contract Marketplace is Ownable {
    // Struct to represent an event
    struct Event {
        string name; // Name of the event
        string description; // Description of the event
        uint256 ticketPrice; // Price of a single ticket
        uint256 maxTickets; // Maximum number of tickets available
        address ticketNFTAddress; // Address of the associated TicketNFT contract
        string imageURI; // URI for the event's image
        string eventDetails; // Additional details about the event
        bool isActive; // Whether the event is active
    }

    // Struct to represent a ticket listing
    struct TicketListing {
        uint256 ticketId; // ID of the ticket being listed
        address seller; // Address of the seller
        uint256 price; // Price of the ticket
        bool isSold; // Whether the ticket has been sold
    }

    mapping(uint256 => Event) public events; // Mapping of event ID to Event struct
    uint256 public eventCounter; // Counter to track the number of events

    mapping(uint256 => TicketListing) public listings; // Mapping of listing ID to TicketListing struct
    uint256 public listingCounter; // Counter to track the number of listings

    // Events to log actions
    event EventCreated(uint256 indexed eventId, address ticketNFTAddress);
    event TicketListed(uint256 indexed listingId, uint256 ticketId, uint256 price);
    event TicketSold(uint256 indexed listingId, address buyer);

    // Function to create a new event
    function createEvent(
        string memory name,
        string memory description,
        uint256 ticketPrice,
        uint256 maxTickets,
        string memory imageURI,
        string memory eventDetails
    ) public {
        // Deploy a new TicketNFT contract for the event
        TicketNFT ticketNFT = new TicketNFT(name, "TKT", maxTickets, msg.sender);

        // Store the event details in the mapping
        events[eventCounter] = Event({
            name: name,
            description: description,
            ticketPrice: ticketPrice,
            maxTickets: maxTickets,
            ticketNFTAddress: address(ticketNFT),
            imageURI: imageURI,
            eventDetails: eventDetails,
            isActive: true
        });

        emit EventCreated(eventCounter, address(ticketNFT)); // Emit event creation log
        eventCounter++; // Increment the event counter
    }

    // Function to list a ticket for resale
    function listTicket(uint256 ticketId, uint256 price, address ticketNFTAddress) public {
        TicketNFT ticketNFT = TicketNFT(ticketNFTAddress); // Reference the TicketNFT contract
        require(ticketNFT.ownerOf(ticketId) == msg.sender, "You do not own this ticket"); // Ensure caller owns the ticket

        // Create a new listing
        listings[listingCounter] = TicketListing({
            ticketId: ticketId,
            seller: msg.sender,
            price: price,
            isSold: false
        });

        ticketNFT.transferFrom(msg.sender, address(this), ticketId); // Transfer ticket to marketplace
        emit TicketListed(listingCounter, ticketId, price); // Emit listing log
        listingCounter++; // Increment listing counter
    }

    // Function to buy a ticket from a listing
    function buyTicket(uint256 listingId) public payable {
        TicketListing storage listing = listings[listingId]; // Get the listing details
        require(!listing.isSold, "Ticket already sold"); // Ensure the ticket is not already sold
        require(msg.value >= listing.price, "Insufficient payment"); // Ensure sufficient payment

        listing.isSold = true; // Mark the ticket as sold
        payable(listing.seller).transfer(msg.value); // Transfer payment to the seller

        TicketNFT ticketNFT = TicketNFT(events[listing.ticketId].ticketNFTAddress); // Reference the TicketNFT contract
        ticketNFT.transferFrom(address(this), msg.sender, listing.ticketId); // Transfer ticket to the buyer

        emit TicketSold(listingId, msg.sender); // Emit ticket sold log
    }

    // Function to validate the authenticity of a ticket
    function validateTicket(uint256 ticketId, address ticketNFTAddress) public view returns (bool) {
        TicketNFT ticketNFT = TicketNFT(ticketNFTAddress); // Reference the TicketNFT contract
        // Check if the ticket exists and is owned by someone
        if (!ticketNFT.exists(ticketId)) {
        return false; // Return false if the ticket doesn't exist
        }
        address owner = ticketNFT.ownerOf(ticketId); // Get the owner of the ticket
        return owner != address(0); // Return true if the ticket exists
    }
}
