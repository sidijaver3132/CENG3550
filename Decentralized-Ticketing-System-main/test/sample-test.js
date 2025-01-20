const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Marketplace and TicketNFT", function () {
  let Marketplace, marketplace, TicketNFT, ticketNFT, eventHost, buyer, validator;
  const ticketPrice = ethers.utils.parseEther("0.1");
  const resalePrice = ethers.utils.parseEther("0.2");
  const metadataURI = "cid/test.json";
  const eventDetails = {
    name: "Concert XYZ",
    description: "An amazing concert event",
    ticketPrice: ticketPrice,
    maxTickets: 100,
    imageURI: "imageURI",
    eventDetails: "This is a concert event",
  };

  beforeEach(async function () {
    // Get contract factories
    Marketplace = await ethers.getContractFactory("Marketplace");

    // Get signers
    [owner, eventHost, buyer, validator] = await ethers.getSigners();

    // Deploy the Marketplace contract
    marketplace = await Marketplace.deploy();
    await marketplace.deployed();

    // Create an event and retrieve the associated TicketNFT address
    const createEventTx = await marketplace
      .connect(eventHost)
      .createEvent(
        eventDetails.name,
        eventDetails.description,
        eventDetails.ticketPrice,
        eventDetails.maxTickets,
        eventDetails.imageURI,
        eventDetails.eventDetails
      );
    await createEventTx.wait();

    const eventData = await marketplace.events(0);
    const ticketNFTAddress = eventData.ticketNFTAddress;

    // Get the TicketNFT instance
    TicketNFT = await ethers.getContractFactory("TicketNFT");
    ticketNFT = TicketNFT.attach(ticketNFTAddress);

    // Mint a ticket for the buyer
    const mintTx = await ticketNFT.connect(eventHost).mintTicket(buyer.address, metadataURI);
    await mintTx.wait();
  });

  it("Should allow an event host to create an event", async function () {
    const eventData = await marketplace.events(0);
    expect(eventData.name).to.equal(eventDetails.name);
    expect(eventData.description).to.equal(eventDetails.description);
    expect(eventData.ticketPrice).to.equal(eventDetails.ticketPrice);
    expect(eventData.maxTickets).to.equal(eventDetails.maxTickets);
    expect(eventData.imageURI).to.equal(eventDetails.imageURI);
    expect(eventData.eventDetails).to.equal(eventDetails.eventDetails);
  });

  it("Should allow users to mint tickets", async function () {
    // Verify ticket ownership and metadata
    const balance = await ticketNFT.balanceOf(buyer.address);
    expect(balance).to.equal(1);

    const tokenURI = await ticketNFT.tokenURI(0);
    expect(tokenURI).to.equal(metadataURI);
  });

  it("Should allow tickets to be transferred between users", async function () {
    // Transfer ticket from buyer to validator
    await ticketNFT.connect(buyer).transferFrom(buyer.address, validator.address, 0);

    // Verify ownership
    const balanceBuyer = await ticketNFT.balanceOf(buyer.address);
    const balanceValidator = await ticketNFT.balanceOf(validator.address);
    expect(balanceBuyer).to.equal(0);
    expect(balanceValidator).to.equal(1);
  });

  it("Should allow tickets to be resold on the marketplace", async function () {
    // Buyer approves the marketplace to handle the ticket
    await ticketNFT.connect(buyer).approve(marketplace.address, 0);

    // Buyer lists the ticket for resale
    const listTx = await marketplace.connect(buyer).listTicket(0, resalePrice, ticketNFT.address);
    await listTx.wait();

    // Validator buys the ticket from the marketplace
    const buyTx = await marketplace.connect(validator).buyTicket(0, { value: resalePrice });
    await buyTx.wait();

    // Verify ownership and marketplace updates
    const newOwner = await ticketNFT.ownerOf(0);
    expect(newOwner).to.equal(validator.address);

    const listing = await marketplace.listings(0);
    expect(listing.isSold).to.be.true;
  });

  it("Should allow validators to validate ticket authenticity", async function () {
    // Validator checks valid ticket ID
    const isAuthentic = await marketplace.validateTicket(0, ticketNFT.address);
    expect(isAuthentic).to.be.true;

    // Validator checks invalid ticket ID
    const isInvalid = await marketplace.validateTicket(999, ticketNFT.address);
    expect(isInvalid).to.be.false;
  });
});
