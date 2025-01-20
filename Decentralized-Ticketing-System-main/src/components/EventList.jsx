import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import Marketplace from "../artifacts/contracts/Marketplace.sol/Marketplace.json";
import { Typography, Card, CardContent, CardMedia, Chip, Button, Modal, Box } from '@mui/material';
import MyTheme from "./MyTheme";
import MintTicket from "./MintTicket";

// Define a custom theme for consistent styling
const theme = MyTheme;

function EventList({ provider, signer, marketplaceAddress }) {
  const [events, setEvents] = useState([]); // State to store the list of events fetched from the contract
  const [selectedEvent, setSelectedEvent] = useState(null); // State to track the currently selected event for minting
  const [modalOpen, setModalOpen] = useState(false); // State to control the visibility of the modal

  // Fetch events from the marketplace contract when the component mounts or dependencies change
  useEffect(() => {
    const fetchEvents = async () => {
      if (!provider || !signer) return; // Ensure provider and signer are available

      const marketplace = new ethers.Contract(marketplaceAddress, Marketplace.abi, signer);
      const eventCount = await marketplace.eventCounter(); // Get the total number of events
      const eventPromises = []; // Array to store promises for fetching event data

      // Iterate over each event index to fetch details
      for (let i = 0; i < eventCount; i++) {
        eventPromises.push(marketplace.events(i)); // Add each event fetch promise to the array
      }

      const eventData = await Promise.all(eventPromises); // Resolve all promises to get event data
      setEvents(eventData); // Update the state with fetched events
    };

    fetchEvents(); // Call the function to fetch events
  }, [provider, signer, marketplaceAddress]);

  // Handle click on "Mint Ticket" button
  const handleMintClick = (event) => {
    setSelectedEvent(event); // Set the selected event for minting
    setModalOpen(true); // Open the modal
  };

  // Handle closing the modal
  const handleClose = () => {
    setModalOpen(false); // Close the modal
    setSelectedEvent(null); // Clear the selected event
  };

  return (
    <div className="container-fluid mt-4 px-4">
      <Typography variant="h4" gutterBottom>Available Events</Typography>

      {/* Display events in a grid layout */}
      <div className="row g-3">
        {events.map((event, index) => (
          <div key={index} className="col-md-4 col-sm-6 col-lg-3">
            <Card 
              sx={{ 
                maxWidth: 345, 
                transition: 'transform 0.2s', 
                '&:hover': { transform: 'scale(1.05)' } // Add hover effect for better UX
              }}
            >
              <CardMedia
                component="img"
                height="140"
                image={`https://gateway.pinata.cloud/ipfs/${event.imageURI}`} // Display event image from IPFS
                alt={event.name}
                onError={(e) => { e.target.onerror = null; e.target.src = "src/default.png"; }} // Fallback for missing images
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {event.name} {/* Event name */}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.description} {/* Event description */}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  <strong>Price:</strong> {ethers.utils.formatEther(event.ticketPrice)} ETH {/* Ticket price */}
                </Typography>
                <Typography variant="body2">
                  <strong>Available:</strong> {event.maxTickets.toNumber()} tickets {/* Number of tickets available */}
                </Typography>
                <Chip label="Upcoming" color="secondary" sx={{ mt: 2 }} /> {/* Badge for event status */}
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  onClick={() => handleMintClick(event)} // Trigger minting when clicked
                >
                  Mint Ticket
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Modal for MintTicket component */}
      <Modal open={modalOpen} onClose={handleClose}>
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            width: 400, 
            bgcolor: 'background.paper', 
            boxShadow: 24, 
            p: 4 
          }}
        >
          {selectedEvent && (
            <MintTicket
              provider={provider}
              signer={signer}
              ticketNFTAddress={selectedEvent.ticketNFTAddress} // Pass the selected event's contract address
            />
          )}
        </Box>
      </Modal>
    </div>
  );
}

export default EventList;
