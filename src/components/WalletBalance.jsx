import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Button, Typography, Box, Card } from '@mui/material';

function WalletBalance() {
  const [balance, setBalance] = useState();

  const getBalance = async () => {
    const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(account);
    setBalance(ethers.utils.formatEther(balance));
  };

  return (
    <Card sx={{ padding: 2, margin: 2, boxShadow: 3 }}>
      <Typography variant="h6">Your Balance: {balance} ETH</Typography>
      <Button variant="contained" color="primary" onClick={getBalance}>
        Show My Balance
      </Button>
    </Card>
  );
}

export default WalletBalance;
