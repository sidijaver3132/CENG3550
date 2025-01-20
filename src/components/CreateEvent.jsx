import React, { useState } from "react";
import { ethers } from "ethers";
import Marketplace from "../artifacts/contracts/Marketplace.sol/Marketplace.json";
import { create } from "ipfs-http-client";
import { TextField, Button, Typography, Box, CircularProgress, Snackbar } from "@mui/material";

const client = create("https://ipfs.infura.io:5001/api/v0"); // Pinata provides an IPFS API endpoint too

const uploadToIPFS = async (file) => {
  try {
    const added = await client.add(file);
    console.log("File uploaded to IPFS with CID:", added.path);
    return added.path; // CID (Content Identifier)
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
  }
};

function CreateEvent({ provider, signer, marketplaceAddress }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ticketPrice: "",
    maxTickets: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const marketplace = new ethers.Contract(marketplaceAddress, Marketplace.abi, signer);
      const ticketPriceInWei = ethers.utils.parseEther(formData.ticketPrice);
      const imageURI = formData.image ? `https://gateway.pinata.cloud/ipfs/${formData.imageCID}` : "";

      // Create the event
      const tx = await marketplace.createEvent(
        formData.name,
        formData.description,
        ticketPriceInWei,
        formData.maxTickets,
        imageURI,
        "Event details here"
      );
      await tx.wait();

      setSuccess(true);
      setFormData({ name: "", description: "", ticketPrice: "", maxTickets: "", image: null });
    } catch (err) {
      console.error("Error creating event:", err);
      setError("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadToIPFS(file).then((cid) => {
        setFormData({ ...formData, image: file, imageCID: cid });
      });
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "0 auto", padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Create Event
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Event Name"
          variant="outlined"
          margin="normal"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <TextField
          fullWidth
          label="Description"
          variant="outlined"
          margin="normal"
          multiline
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />

        <TextField
          fullWidth
          label="Ticket Price (ETH)"
          variant="outlined"
          margin="normal"
          type="number"
          value={formData.ticketPrice}
          onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
          required
        />

        <TextField
          fullWidth
          label="Max Tickets"
          variant="outlined"
          margin="normal"
          type="number"
          value={formData.maxTickets}
          onChange={(e) => setFormData({ ...formData, maxTickets: e.target.value })}
          required
        />

        <Button
          variant="outlined"
          component="label"
          sx={{ mt: 2, mb: 2 }}
        >
          Upload Event Image
          <input
            type="file"
            hidden
            onChange={handleFileChange}
          />
        </Button>

        {formData.image && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Selected File: {formData.image.name}
          </Typography>
        )}

        <Box sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Create Event"}
          </Button>
        </Box>
      </form>

      {success && (
        <Snackbar
          open={success}
          autoHideDuration={6000}
          onClose={() => setSuccess(false)}
          message="Event created successfully!"
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

export default CreateEvent;
