// Improved navigation bar implementation with React
import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

// NavigationBar component to render a top navigation bar
// Props:
// - onNavClick: Function to handle navigation button clicks
function NavigationBar({ onNavClick }) {
  return (
    <AppBar position="static" color="primary"> {/* Fixed-position navigation bar with primary theme color */}
      <Toolbar>
        {/* IconButton for menu icon on the left */}
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}> {/* Spacing added using sx */}
          <MenuIcon /> {/* Menu icon from Material-UI icons */}
        </IconButton>

        {/* Application title in the center */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}> {/* flexGrow pushes buttons to the right */}
          Event Ticket Marketplace
        </Typography>

        {/* Navigation buttons for different sections */}
        <Button color="inherit" onClick={() => onNavClick('home')}>Home</Button>
        <Button color="inherit" onClick={() => onNavClick('myTickets')}>My Tickets</Button>
        <Button color="inherit" onClick={() => onNavClick('createEvent')}>Create Event</Button>
        <Button color="inherit" onClick={() => onNavClick('walletBalance')}>Wallet Balance</Button>
      </Toolbar>
    </AppBar>
  );
}

export default NavigationBar;