# AI-Driven Supply Chain Management System

A full-stack React application for managing an AI-driven supply chain using blockchain technology. The system implements a "Request-Response" flow: Consumer → Manufacturer → RMS → Manufacturer → Distributor (Randomly Assigned) → Consumer.

## Tech Stack

- **Frontend**: React.js (Vite), Tailwind CSS, Shadcn/UI
- **Web3**: RainbowKit, Wagmi, Viem
- **AI Layer**: Off-chain logic to parse blockchain history into human-readable narratives

## Features

### Role-Based Dashboards

1. **Owner Dashboard**
   - Register actors (RMS, Manufacturer, Distributor)
   - View distributor pool
   - View system statistics (product counter, order counter)

2. **Consumer Dashboard**
   - Browse marketplace (active products)
   - Place orders
   - View order history
   - Track orders with AI summary

3. **Manufacturer Dashboard**
   - List products (name, description, price)
   - Manage orders assigned to them
   - Request materials from RMS
   - Complete production (triggers random distributor selection)

4. **RMS Dashboard**
   - View material requests from manufacturers
   - Dispatch materials to manufacturers

5. **Distributor Dashboard**
   - View delivery tasks (only orders assigned to them)
   - Confirm delivery to consumers

### AI Status Tracker

- Fetches order history from blockchain
- Calculates time differences between tracking points
- Generates human-readable narratives
- Displays timeline with Shadcn/UI components

## Setup Instructions

> ./SETUP.md

## Project Structure

```
src/
├── components/
│   ├── ui/              # Shadcn/UI components
│   ├── dashboards/      # Role-based dashboard components
│   ├── layout/          # Header, Sidebar
│   └── providers.jsx    # Web3 providers
├── constants/
│   └── contract.js      # Contract ABI and address
├── hooks/
│   └── useRole.js       # Hook to determine user role
├── lib/
│   ├── utils.js         # Utility functions
│   └── wagmi.js         # Wagmi/RainbowKit configuration
├── App.jsx              # Main app component
└── main.jsx             # Entry point
```

## Usage

1. Connect your wallet using RainbowKit
2. The system automatically determines your role based on the connected address
3. Access your role-specific dashboard
4. Interact with the smart contract through the UI

## Smart Contract Integration

The application integrates with a Solidity smart contract that manages:
- Actor registration
- Product listing
- Order workflow
- Material requests and dispatch
- Random distributor assignment
- Order tracking and history

## Notes

- Ensure your contract is deployed and the address is correctly configured
- Make sure your wallet is connected to the correct network
- All transactions require gas fees
- The AI narrative generation happens client-side based on blockchain data

