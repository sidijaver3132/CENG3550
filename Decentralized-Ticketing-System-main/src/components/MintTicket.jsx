import React, { useState } from "react";
import { ethers } from "ethers";
import { Button, Typography, Box, CircularProgress, Snackbar } from "@mui/material";
import TicketNFT from "../artifacts/contracts/TicketNFT.sol/TicketNFT.json";

function MintTicket({ provider, signer, ticketNFTAddress }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleMint = async () => {
    if (!provider || !signer || !ticketNFTAddress) {
      setError("Provider, signer, or contract address is missing.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const ticketContract = new ethers.Contract(ticketNFTAddress, TicketNFT.abi, signer);
      const contentId = 'Qmdbpbpy7fA99UkgusTiLhMWzyd3aETeCFrz7NpYaNi6zY';
        const tokenId = '0';
      const metadataURI = `${contentId}/${tokenId}.json`;
      const connection = ticketContract.connect(signer);
      const addr = connection.address;
      console.log("singer", signer);
      console.log("addr", addr);
      // Call mint function
      const tx = await ticketContract.mintTicket(addr,metadataURI);
      await tx.wait();

      setSuccess(true);
    } catch (err) {
      console.error("Error during minting:", err);

      if (err.code === "INSUFFICIENT_FUNDS") {
        setError("You do not have enough ETH to mint a ticket.");
      } else if (err.code === "NETWORK_ERROR") {
        setError("Network error occurred. Please check your connection.");
      } else {
        setError("Minting failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Mint Your Ticket
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={handleMint}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "Mint Ticket"}
      </Button>

      {success && (
        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={() => setSuccess(false)}
          message="Ticket minted successfully!"
        />
      )}

      {error && (
        <Snackbar
          open={Boolean(error)}
          autoHideDuration={6000}
          onClose={() => setError("")}
          message={error}
        />
      )}
    </Box>
  );
}

export default MintTicket;
