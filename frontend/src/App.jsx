// App.jsx; the main dashboard
// Stonekeep lets creators prove they made something, by hashing a file
// and storing that hash on-chain. This file lays out the page: a header,
// then a grid with one panel per feature, wallet, Register Work,
// Verify a Work, and Transfer Rights. Each panel is its own component,
// imported below, so this file mainly just handles layout and wallet state.
//
// The bg-pattern div is just a decorative animated background sitting
// behind everything. Everything else sits above it so it's actually visible.

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import RegisterWork from './components/RegisterWork'
import VerifyWork from './components/VerifyWork'
import TransferRights from './components/TransferRights'

function App() {
  // useAccount tells us if a wallet is connected, and gives us the address.
  const { address, isConnected } = useAccount()

  // useConnect gives us the list of available wallet connectors (MetaMask etc.)
  // and a function to trigger connecting to one of them.
  const { connect, connectors } = useConnect()

  // useDisconnect gives us a function to disconnect the current wallet.
  const { disconnect } = useDisconnect()

  return (
    <div className="min-h-screen text-white relative">

      {/* Animated background layer, fixed behind everything, z-0.
          Purely visual, defined in index.css (.bg-pattern + @keyframes drift) */}
      <div className="bg-pattern" />

      {/* Everything else sits above the background pattern via z-10 */}
      <div className="relative z-10">

        {/* Header: logo mark, app name, and a short tagline on the right */}
        <header className="border-b border-border-warm px-10 py-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Stone-shaped logo mark (faceted gem outline) instead of a plain letter */}
            <div className="w-10 h-10 rounded-full border border-gold flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L20 8L17 20H7L4 8L12 2Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  className="text-gold-bright"
                />
                <path
                  d="M12 2L12 8M4 8L12 8M20 8L12 8M7 20L12 8M17 20L12 8"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinejoin="round"
                  className="text-gold-bright opacity-60"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-display font-bold tracking-wide text-gold-bright">
              STONEKEEP
            </h1>
          </div>
          {/* Tagline wrapped in a frosted "glass" pill so it stands out
              against the moving background instead of blending in */}
          <p className="text-xs text-bronze uppercase tracking-[0.2em] px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-border-warm">
            Proof of authorship · Built on BOT Chain
          </p>
        </header>

        {/* Dashboard grid: 3 panels on desktop, stacked on mobile */}
        <main className="p-10 grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Wallet panel: the only fully functional panel at first, now
              sharing the same gold glow as every other panel since all
              four features are live and equally important. */}
          <div className="bg-panel border border-border-warm rounded-xl p-7 flex flex-col gap-4 shadow-[0_0_30px_-8px_rgba(201,162,75,0.2)]">
            <h2 className="font-display text-sm uppercase tracking-[0.2em] text-gold">
              Wallet
            </h2>

            {isConnected ? (
              // If a wallet is connected: show a shortened address + disconnect button
              <div className="flex flex-col gap-3">
                <p className="text-base text-gray-300 font-body">
                  Connected: <span className="text-gold-bright">{address.slice(0, 6)}...{address.slice(-4)}</span>
                </p>
                <button
                  onClick={() => disconnect()}
                  className="px-4 py-3 border border-gold text-gold rounded-lg font-display text-base tracking-wide hover:bg-gold hover:text-obsidian transition-all"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              // If not connected: show one button per available connector
              // (usually just one, "Injected", which covers MetaMask etc.)
              connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  className="px-4 py-3 border border-gold text-gold rounded-lg font-display text-base tracking-wide hover:bg-gold hover:text-obsidian transition-all"
                >
                  Connect {connector.name}
                </button>
              ))
            )}
          </div>

          {/* Register Work, hashes a file client-side, uploads to Pinata,
              writes hash + IPFS CID + title on-chain */}
          <RegisterWork />

          {/* Verify a Work, re-hashes a file and looks it up on-chain */}
          <VerifyWork />

          {/* Transfer Rights, its own full-width row below the main three,
              since it has more content (holder lookup + conditional form) */}
          <div className="md:col-span-3">
            <TransferRights />
          </div>

        </main>

      </div>
    </div>
  )
}

export default App