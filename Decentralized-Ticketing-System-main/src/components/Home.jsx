import React, { useEffect, useState } from "react";
import WalletBalance from "./WalletBalance";
import { ethers } from "ethers";
import EventList from "./EventList";
import MyTickets from "./MyTickets";
import CreateEvent from "./CreateEvent";
import NavigationBar from './NavigationBar';
import {ThemeProvider } from '@mui/material/styles';
import MyTheme from "./MyTheme";

// Define a custom theme for consistent styling
const theme = MyTheme;


// Address of the deployed marketplace contract
const marketplaceAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with deployed address

function Home() {
  const [activeSection, setActiveSection] = useState('home'); // State to track the currently active section
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  // Initialize the provider and signer on mount
  useEffect(() => {
    const initialize = async () => {
      const providerInstance = new ethers.providers.Web3Provider(window.ethereum);
      const signerInstance = providerInstance.getSigner();
      const account = await signerInstance.getAddress();

      setProvider(providerInstance);
      setSigner(signerInstance);
      setAccount(account);
    };

    initialize();
  }, []);

  // Function to render the appropriate section based on the activeSection state
  const renderSection = () => {
    switch (activeSection) {
      case 'myTickets':
        return <MyTickets provider={provider} signer={signer} marketplaceAddress={marketplaceAddress} account={account} />; // Render MyTickets component
      case 'createEvent':
        return <CreateEvent provider={provider} signer={signer} marketplaceAddress={marketplaceAddress} />; // Render CreateEvent component
      case 'walletBalance':
        return <WalletBalance />; // Render WalletBalance component
      default:
        return <EventList provider={provider} signer={signer} marketplaceAddress={marketplaceAddress} />; // Default to EventList component
    }
  };

  return (
    <ThemeProvider theme={theme}> {/* Apply the custom theme to the entire app */}
    <div>
      {/* Navigation bar at the top, with onNavClick handler to change active section */}
      <NavigationBar onNavClick={setActiveSection} />

      {/* Main container for the dynamic content */}
      <div className="container">
        {renderSection()} {/* Render the selected section */}
      </div>
    </div>
  </ThemeProvider>
  );
}

export default Home;
