// Main app shell.
// Right now this is a dashboard layout: a header, and a grid of panels.
// The Wallet panel is fully live (connects via wagmi). Register and Verify
// are placeholders, dimmed and non-interactive - until their own feature
// branches build out the real functionality.
//
// The bg-pattern div is a fixed, full-screen layer sitting behind everything
// (z-0, set in index.css). It's purely decorative - the animated gold
// line/gradient pattern. Everything else lives inside a relative z-10
// wrapper so it renders on top of that pattern instead of being hidden
// behind it.

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

      {/* Animated background layer - fixed behind everything, z-0.
          Purely visual, defined in index.css (.bg-pattern + @keyframes drift) */}
      <div className="bg-pattern" />

      {/* Everything else sits above the background pattern via z-10 */}
      <div className="relative z-10">

        {/* Header: logo mark, app name, and a short tagline on the right */}
        <header className="border-b border-border-warm px-10 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Simple circular logo mark using the first letter, styled like a seal/emblem */}
            <div className="w-9 h-9 rounded-full border border-gold flex items-center justify-center text-gold-bright font-display font-bold">
              S
            </div>
            <h1 className="text-2xl font-display font-bold tracking-wide text-gold-bright">
              STONEKEEP
            </h1>
          </div>
          <p className="text-[11px] text-bronze uppercase tracking-[0.2em]">
            Proof of authorship · Built on BOT Chain
          </p>
        </header>

        {/* Dashboard grid: 3 panels on desktop, stacked on mobile */}
        <main className="p-10 grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Wallet panel - the only fully functional panel right now.
              Has a subtle gold glow (via box-shadow) to signal it's the active/live one. */}
          <div className="bg-panel border border-border-warm rounded-xl p-6 flex flex-col gap-4 shadow-[0_0_30px_-10px_rgba(201,162,75,0.15)]">
            <h2 className="font-display text-xs uppercase tracking-[0.2em] text-gold">
              Wallet
            </h2>

            {isConnected ? (
              // If a wallet is connected: show a shortened address + disconnect button
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-400 font-body">
                  Connected: <span className="text-gold-bright">{address.slice(0, 6)}...{address.slice(-4)}</span>
                </p>
                <button
                  onClick={() => disconnect()}
                  className="px-4 py-2.5 border border-gold text-gold rounded-lg font-display text-sm tracking-wide hover:bg-gold hover:text-obsidian transition-all"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              // If not connected: show one button per available connector
              // (usually just one - "Injected", which covers MetaMask etc.)
              connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => {
                    console.log('Button clicked, connector:', connector)
                    connect({ connector })
                  }}
                  className="px-4 py-2.5 border border-gold text-gold rounded-lg font-display text-sm tracking-wide hover:bg-gold hover:text-obsidian transition-all"
                >
                  Connect {connector.name}
                </button>
              ))
            )}
          </div>

          <RegisterWork />

          <VerifyWork />

          <div className="md:col-span-3">
            <TransferRights />
          </div>

        </main>

      </div>
    </div>
  )
}

export default App