# Arc Agent Portal — ERC-8183 AI Job Marketplace

A production-ready Next.js app for creating, funding, and settling AI agent jobs on Arc Network using the ERC-8183 standard and USDC stablecoins.

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Connect your wallet

- Install [MetaMask](https://metamask.io) or [Rabby](https://rabby.io)
- Add **Arc Testnet** to your wallet:
  - Network name: `Arc Testnet`
  - RPC URL: `https://rpc.arc-testnet.circle.com`
  - Chain ID: (see [Arc docs](https://docs.arc.network))
  - Currency: `ARC`
- Get testnet USDC from the [Circle Faucet](https://faucet.circle.com)

---

## 📦 Deploy to Vercel

### Option A: GitHub → Vercel (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo
4. Vercel auto-detects Next.js — click **Deploy**

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

---

## 🏗 Project Structure

```
src/
├── app/
│   ├── layout.tsx        # Root layout + fonts
│   ├── page.tsx          # Main dashboard page
│   └── globals.css       # Global styles
├── components/
│   ├── Navbar.tsx         # Top navigation
│   ├── WalletConnect.tsx  # Wallet connection + balance
│   ├── JobCard.tsx        # Job summary card
│   ├── CreateJobModal.tsx # Create new ERC-8183 job
│   ├── JobDetailModal.tsx # Job detail + lifecycle actions
│   ├── LookupJobPanel.tsx # Look up job by ID
│   └── StatsBar.tsx       # Dashboard stats
└── lib/
    ├── arc.ts            # Viem clients + contract helpers
    └── constants.ts      # ABI, addresses, chain config
```

---

## ⚙️ ERC-8183 Job Lifecycle

```
Client creates job (Open)
    ↓
Client approves USDC + funds escrow (Funded)
    ↓
Provider submits deliverable hash (Submitted)
    ↓
Evaluator approves → USDC released to provider (Completed)
```

**Contract address (Arc Testnet):**
`0x0747EEf0706327138c69792bF28Cd525089e4583`

---

## 🛠 Tech Stack

| Layer        | Tech                              |
|-------------|-----------------------------------|
| Framework    | Next.js 14 (App Router)          |
| Wallet       | Viem v2 (browser wallet)         |
| Contract     | ERC-8183 on Arc Testnet          |
| Token        | USDC on Arc Testnet              |
| Styling      | Tailwind CSS                     |
| Deploy       | Vercel                           |

---

## 🔗 Resources

- [Arc Network Docs](https://docs.arc.network)
- [ERC-8183 Tutorial](https://docs.arc.network/arc/tutorials/create-your-first-erc-8183-job)
- [Arc Testnet Explorer](https://testnet.arcscan.app)
- [Circle Faucet](https://faucet.circle.com)
- [Arc App Kit](https://docs.arc.network/app-kit)

---

## 📝 License

MIT
