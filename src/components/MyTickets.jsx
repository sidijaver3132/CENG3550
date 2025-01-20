import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import TicketNFT from "../artifacts/contracts/TicketNFT.sol/TicketNFT.json";
import Marketplace from "../artifacts/contracts/Marketplace.sol/Marketplace.json";
import { Card, CardContent, CardMedia, Typography, Grid, Box } from "@mui/material";

function MyTickets({ provider, signer, marketplaceAddress, account }) {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchOwnedTickets = async () => {
      if (!provider || !signer || !account) return;

      const marketplace = new ethers.Contract(marketplaceAddress, Marketplace.abi, signer);
      const eventCount = await marketplace.eventCounter();

      const ticketPromises = [];
      for (let i = 0; i < eventCount; i++) {
        const event = await marketplace.events(i);
        const ticketContract = new ethers.Contract(event.ticketNFTAddress, TicketNFT.abi, signer);

        const totalTickets = await ticketContract.totalMintedTickets();
        console.log("Total tickets for event", i, ":", totalTickets);
        console.log("account" ,account); 
        const ownerx = await ticketContract.ownerOf(0);
        console.log("Owner of ticket", "is", ownerx);
        for (let j = 0; j < totalTickets; j++) {
          const owner = await ticketContract.ownerOf(j);
          if (owner === account) {
            console.log("Owner of ticket", j, "is", owner);
            console.log("Event name:", event.name);
            console.log("account" ,account); 
            const tokenURI = await ticketContract.tokenURI(j);
            const metadata = await fetch(tokenURI).then((res) => res.json());

            ticketPromises.push({
              id: j,
              ...metadata,
              eventName: event.name,
              eventDate: event.date,
            });
          }
        }
      }

      const ticketsData = await Promise.all(ticketPromises);
      setTickets(ticketsData);
    };

    fetchOwnedTickets();
  }, [provider, signer, marketplaceAddress, account]);

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Tickets
      </Typography>

      {tickets.length === 0 ? (
        <Typography variant="body1">You don't own any tickets yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {tickets.map((ticket, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card sx={{ maxWidth: 345 }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={ticket.image || "src/default.png"}
                  alt={ticket.eventName}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {ticket.eventName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ticket.eventDate}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    {ticket.description}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Ticket ID:</strong> {ticket.id}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default MyTickets;
