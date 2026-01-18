# Setup Guide

## Step 1: Start Anvil (Local Blockchain)

Open your bash terminal and run:

```bash
curl -L https://foundry.paradigm.xyz | bash
```


```bash
foundryup
```

```bash
anvil
```

This starts a local Ethereum blockchain at:

* **RPC URL:** [http://127.0.0.1:8545](http://127.0.0.1:8545)
* **Chain ID:** 31337

> ⚠️ **Important:** Keep this terminal running.
You will see **10 test accounts with private keys**.
Note the **first account’s address and private key** — this will be the **contract owner**.

---

## Step 2: Deploy the Smart Contract (Remix IDE)

1. Open **Remix IDE**:
   [https://remix.ethereum.org](https://remix.ethereum.org)

2. Create a new file inside the `contracts` folder:

   ```
   AI-SCM.sol
   ```

3. Paste the contents from:

   ```
   Contract/AI-SCM.sol
   ```

### Compile the Contract

* Open the **Solidity Compiler** tab (left sidebar)
* Select compiler version **0.8.x** (e.g., `0.8.19`)
* Click **Compile AI-SCM.sol**

### Connect Remix to Anvil

* Go to **Deploy & Run Transactions**
* In **Environment**, select:

  ```
  Injected Provider - MetaMask
  ```
* Ensure MetaMask is configured for Anvil (see Step 3)

### Deploy the Contract

* Select **AISupplyChain** from the contract dropdown
* Click **Deploy**
* Confirm the transaction in MetaMask
* Copy the **deployed contract address** shown under **Deployed Contracts**

---

## Step 3: Configure MetaMask for Anvil

1. Open **MetaMask → Settings → Networks**
2. Click **Add Network → Add Network Manually**
3. Enter the following details:

| Field           | Value                                          |
| --------------- | ---------------------------------------------- |
| Network Name    | Anvil                                          |
| RPC URL         | [http://127.0.0.1:8545](http://127.0.0.1:8545) |
| Chain ID        | 31337                                          |
| Currency Symbol | ETH                                            |

4. Click **Save**

### Import a Test Account

* In MetaMask, click **Account Icon → Import Account**
* Paste a **private key from the Anvil terminal**
* The **first account (index 0)** is the **contract owner**

💡 **Tip:** Import multiple accounts to test different roles:

* RMS
* Manufacturer
* Distributor
* Consumer

---

## Step 4: Update the Contract Address

After deployment, update the file:

```
src/constants/contract.js
```

Replace the address:

```javascript
export const CONTRACT_ADDRESS = "0xYOUR_DEPLOYED_CONTRACT_ADDRESS";
```

with the actual contract address from Remix.

---

## Step 5: Install Dependencies & Start the Frontend

Open a new terminal in the project directory and run:

```bash
npm install
npm run dev
```

The app will start at:

```
http://localhost:5173
```

(or a similar port)

---

## Step 6: Connect & Test the Application

1. Open the app in your browser
2. Connect your wallet using the **RainbowKit** button
3. Select the **Anvil** network in MetaMask
4. The **first connected wallet** becomes the **Owner (contract deployer)**

---

## 📋 Testing Workflow

| Step | Role             | Action                                           |
| ---: | ---------------- | ------------------------------------------------ |
|    1 | Owner            | Register actors (RMS, Manufacturer, Distributor) |
|    2 | Manufacturer     | List products (name, description, price)         |
|    3 | Consumer         | Browse marketplace and place orders              |
|    4 | Manufacturer     | Request materials from RMS                       |
|    5 | RMS              | Dispatch materials                               |
|    6 | Manufacturer     | Complete production (auto-assigns distributor)   |
|    7 | Distributor      | Confirm delivery                                 |
|    8 | Consumer / Owner | Track order with AI summary                      |

---

## ⚠️ Quick Checklist

* ✅ Anvil running in bash terminal
* ✅ Contract deployed via Remix
* ✅ Contract address updated in

  ```
  src/constants/contract.js
  ```
* ✅ MetaMask connected to Anvil network (Chain ID: 31337)
* ✅ Test account imported into MetaMask
* ✅ Frontend running with `npm run dev`

---



## Testing the Application

1. **Connect Wallet**: Use the ConnectButton in the header
2. **Register as Owner**: If you're the contract owner, you'll see the Owner Dashboard
3. **Register Actors**: Use the Owner Dashboard to register different roles
4. **Switch Wallets**: Connect different wallets to test different roles

## Important Notes

- All transactions require gas fees
- Make sure your wallet is connected to the correct network
- The contract must be deployed before using the application
- The AI narrative generation happens client-side based on blockchain data

