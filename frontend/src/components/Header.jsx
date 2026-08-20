// The persistent header, shown on every page (Dashboard, Browse, etc).
// Holds the Stonekeep logo/branding, navigation between pages, and the
// wallet connect/disconnect button - since wallet state matters no
// matter which page you're on, it lives here instead of inside any
// individual feature panel.

import { Link } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

function Header() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, error, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  // Always attempt connect on click - no pre-guessing based on screen
  // width or window.ethereum. React to what actually happens instead.
  function handleConnect() {
    connect({ connector: connectors[0] })
  }

  // If connect failed AND there's genuinely no injected provider, that's
  // specifically "no wallet found" - different from other failures like
  // the user rejecting the connection request.
  const noProviderFound = error && !window.ethereum

  return (
    <header className="border-b border-border-warm px-4 md:px-10 py-4 md:py-7 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-4 md:gap-8">
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
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-wide text-gold-bright">
            STONEKEEP
          </h1>
        </Link>

        {/* Page navigation */}
        <nav className="flex items-center gap-4 md:gap-6">
          <Link
            to="/"
            className="text-xs md:text-sm font-display uppercase tracking-[0.15em] text-gray-300 hover:text-gold-bright transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/browse"
            className="text-xs md:text-sm font-display uppercase tracking-[0.15em] text-gray-300 hover:text-gold-bright transition-colors"
          >
            Browse
          </Link>
        </nav>
      </div>

      {/* Wallet connect - always tries to connect on click, then reacts
          to what actually happened instead of pre-guessing device/wallet
          state. No provider found -> tell the user and link them to get
          MetaMask. Any other failure -> show the real error. */}
      <div className="flex flex-col items-end gap-2">
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
          <button
            onClick={handleConnect}
            disabled={isPending}
            className="px-4 py-2 border border-gold text-gold rounded-lg font-display text-sm tracking-wide hover:bg-gold hover:text-obsidian transition-all disabled:opacity-50"
          >
            {isPending ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}

        {error && (
          <p className="text-xs text-red-400 font-body text-right max-w-xs">
            {noProviderFound ? (
              <>
                No wallet found.{' '}
                
                  <a
                  href={`https://metamask.app.link/dapp/${window.location.host}`}
                  className="underline text-gold"
                >
                  Get MetaMask
                </a>
              </>
            ) : (
              error.shortMessage || error.message
            )}
          </p>
        )}
      </div>
    </header>
  )
}

export default Header