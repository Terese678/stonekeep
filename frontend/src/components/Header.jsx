// The persistent header, shown on every page (Dashboard, Browse, etc).
// Thid holds the Stonekeep logo/branding, navigation between pages, and the
// wallet connect/disconnect button; since wallet state matters no
// matter which page you're on, it lives here instead of inside any
// individual feature panel.

import { Link } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

function Header() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  return (
    <header className="border-b border-border-warm px-10 py-7 flex items-center justify-between">
      <div className="flex items-center gap-8">
        {/* Logo + name */}
        <Link to="/" className="flex items-center gap-3">
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
        </Link>

        {/* Page navigation */}
        <nav className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-display uppercase tracking-[0.15em] text-gray-300 hover:text-gold-bright transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/browse"
            className="text-sm font-display uppercase tracking-[0.15em] text-gray-300 hover:text-gold-bright transition-colors"
          >
            Browse
          </Link>
        </nav>
      </div>

      {/* Wallet connect - same logic as before, just moved up here */}
      <div>
        {isConnected ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300 font-body">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
            <button
              onClick={() => disconnect()}
              className="px-4 py-2 border border-gold text-gold rounded-lg font-display text-sm tracking-wide hover:bg-gold hover:text-obsidian transition-all"
            >
              Disconnect
            </button>
          </div>
        ) : (
          connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => connect({ connector })}
              className="px-4 py-2 border border-gold text-gold rounded-lg font-display text-sm tracking-wide hover:bg-gold hover:text-obsidian transition-all"
            >
              Connect {connector.name}
            </button>
          ))
        )}
      </div>
    </header>
  )
}

export default Header