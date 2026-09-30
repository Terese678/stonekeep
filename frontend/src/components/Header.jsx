// The persistent header, shown on every page (Dashboard, Browse, etc).
// Holds the Stonekeep logo/branding, navigation between pages, and the
// wallet connect/disconnect button - since wallet state matters no
// matter which page you're on, it lives here instead of inside any
// individual feature panel.

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { botChainMainnet } from '../config/wagmi'

// The exact values a user would need to manually add BOT Chain Mainnet
// to their wallet, matching botChainMainnet's definition in wagmi.js.
const NETWORK_DETAILS = [
  { label: 'Network Name', value: 'BOT Chain' },
  { label: 'RPC URL', value: 'https://rpc.botchain.ai' },
  { label: 'Chain ID', value: '677' },
  { label: 'Currency Symbol', value: 'BOT' },
  { label: 'Block Explorer URL', value: 'https://scan.botchain.ai' },
]

function Header() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, error, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  // Always attempt connect on click - no pre-guessing based on screen
  // width or window.ethereum. React to what actually happens instead.
  function handleConnect() {
    connect({ connector: connectors[0] })
  }

  // If connect failed AND there's genuinely no injected provider, that's
  // specifically "no wallet found" - different from other failures like
  // the user rejecting the connection request.
  const noProviderFound = error && !window.ethereum

  // Mainnet specifically, not testnet - real registrations and real
  // usage data need to happen on mainnet, so that's the only network
  // considered "correct" for auto-switch purposes.
  const isOnBotChain = chainId === botChainMainnet.id

  // Programmatic chain switching is unreliable on some wallets/mobile
  // browsers (a known, longstanding limitation, not something specific
  // to our setup - confirmed via wagmi's own GitHub discussions). So we
  // attempt it automatically where possible, but fall back to a full
  // manual-add card (network details + copy buttons + steps) if it
  // fails, rather than a raw technical error or a bare instruction with
  // nothing actionable in it.
  const [switchFailed, setSwitchFailed] = useState(false)
  const [copiedField, setCopiedField] = useState('')

  useEffect(() => {
    if (isConnected && !isOnBotChain) {
      switchChain(
        { chainId: botChainMainnet.id },
        {
          onError: () => setSwitchFailed(true),
        }
      )
    } else {
      setSwitchFailed(false)
    }
  }, [isConnected, isOnBotChain, switchChain])

  function copyValue(label, value) {
    navigator.clipboard.writeText(value)
    setCopiedField(label)
    setTimeout(() => setCopiedField(''), 1500)
  }

  // Purely for display purposes (suggesting MetaMask's in-app browser
  // below) - not used for any connection logic, since programmatic
  // network switching tends to be far more reliable when the site is
  // opened inside MetaMask's own browser rather than a regular mobile
  // browser tab.
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

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
          state. Once connected, attempts an automatic switch to BOT
          Chain Mainnet if on the wrong network, falling back to a full
          manual-add card if that fails. Mobile users also see a
          suggestion to use MetaMask's own browser, where switching
          tends to work more reliably. */}
      <div className="flex flex-col items-end gap-2 max-w-sm">
        {isConnected ? (
          <div className="flex items-center gap-3">
            {!isOnBotChain && (
              <span className="text-sm text-yellow-400 font-body">
                {isSwitching ? 'Switching to BOT Chain...' : 'Wrong network'}
              </span>
            )}
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
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={handleConnect}
              disabled={isPending}
              className="px-4 py-2 border border-gold text-gold rounded-lg font-display text-sm tracking-wide hover:bg-gold hover:text-obsidian transition-all disabled:opacity-50"
            >
              {isPending ? 'Connecting...' : 'Connect Wallet'}
            </button>

            {isMobile && (
              
                <a href={`https://metamask.app.link/dapp/${window.location.host}`}
                className="text-xs text-gray-400 font-body underline"
              >
                On mobile? Open in MetaMask's browser for the smoothest experience
              </a>
            )}
          </div>
        )}

        {switchFailed && !isOnBotChain && (
          <div className="w-full bg-obsidian border border-yellow-600/50 rounded-lg p-3 flex flex-col gap-2">
            <p className="text-xs text-yellow-400 font-body">
              Your wallet couldn't switch automatically. Add BOT Chain manually with these details:
            </p>

            {NETWORK_DETAILS.map((field) => (
              <div key={field.label} className="flex items-center justify-between gap-2 text-xs font-body">
                <div className="min-w-0">
                  <p className="text-gray-500">{field.label}</p>
                  <p className="text-gray-200 truncate">{field.value}</p>
                </div>
                <button
                  onClick={() => copyValue(field.label, field.value)}
                  className="shrink-0 px-2 py-1 border border-gold text-gold rounded text-xs hover:bg-gold hover:text-obsidian transition-all"
                >
                  {copiedField === field.label ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ))}

            <p className="text-xs text-gray-500 font-body pt-1 border-t border-border-warm">
              In MetaMask: tap the network name at the top → Add network → Add a network manually → paste each value above.
            </p>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-400 font-body text-right max-w-xs">
            {noProviderFound ? (
              <>
                No wallet found.{' '}
                
                  <a href={`https://metamask.app.link/dapp/${window.location.host}`}
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