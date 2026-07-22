// The Browse Works page - a public, read-only feed of every work
// registered on Stonekeep. No wallet needed, since this is just reading
// public on-chain data. Pulls past WorkRegistered events directly from
// the chain using viem, starting from the block our testnet contract
// was deployed in (no point scanning earlier than that).

import { useState, useEffect } from 'react'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { useContractAddresses } from '../config/getAddresses'

// The block our testnet StonekeepRegistry was deployed in. Starting the
// event search here (instead of block 0) keeps the query fast and cheap.
const TESTNET_DEPLOY_BLOCK = 16898309n

// A minimal client just for reading testnet chain data. Separate from
// wagmi's connected-wallet client, since Browse Works doesn't need a
// wallet at all, it just needs to read public event logs.
const testnetClient = createPublicClient({
  chain: {
    id: 968,
    name: 'BOT Chain Testnet',
    nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
    rpcUrls: { default: { http: ['https://rpc.bohr.life'] } },
  },
  transport: http(),
})

// The exact shape of the WorkRegistered event, matching what we added
// to StonekeepRegistry.sol. viem needs this to know how to decode the
// raw log data into readable fields.
const workRegisteredEvent = parseAbiItem(
  'event WorkRegistered(bytes32 indexed workHash, address indexed author, string ipfsHash, string title, uint256 timestamp)'
)

function BrowseWorks() {
  const addresses = useContractAddresses()

  const [works, setWorks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function fetchWorks() {
      try {
        setIsLoading(true)

        const logs = await testnetClient.getLogs({
          // TEMPORARY: hardcoded to testnet only, since mainnet's official RPC
          // (rpc.botchain.ai) currently blocks eth_getLogs. Once we have a working
          // mainnet RPC alternative (or confirmation from BOTChain's team), this
          // should become a network toggle instead of a hardcoded address.
          address: '0xFc3eEC7D47E390A88D41860A7f331fFAab932044',
          event: workRegisteredEvent,
          fromBlock: TESTNET_DEPLOY_BLOCK,
          toBlock: 'latest',
        })

        // Newest first, and pull the readable fields out of each log's args
        const parsed = logs
          .map((log) => ({
            workHash: log.args.workHash,
            author: log.args.author,
            ipfsHash: log.args.ipfsHash,
            title: log.args.title,
            timestamp: log.args.timestamp,
          }))
          .reverse()

        setWorks(parsed)
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorks()
  }, [])

  // Simple client-side filter by title, since we're not dealing with
  // huge volumes yet, no need for anything fancier than this right now.
  const filteredWorks = works.filter((work) =>
    work.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main className="p-10">
      <div className="bg-panel border border-border-warm rounded-xl p-7 shadow-[0_0_30px_-8px_rgba(201,162,75,0.2)]">
        <h2 className="font-display text-sm uppercase tracking-[0.2em] text-gold mb-4">
          Browse Works
        </h2>

        <p className="text-sm text-bronze font-body mb-4">
          Showing works registered on BOT Chain Testnet.
        </p>

        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-obsidian border border-border-warm rounded-lg px-3 py-2.5 text-base font-body text-white placeholder:text-gray-500 mb-6"
        />

        {isLoading && (
          <p className="text-base text-gray-400 font-body">Loading registered works...</p>
        )}

        {error && (
          <p className="text-sm text-red-400 font-body">
            Couldn't load works: {error.shortMessage || error.message}
          </p>
        )}

        {!isLoading && !error && filteredWorks.length === 0 && (
          <p className="text-base text-gray-400 font-body">No works found.</p>
        )}

        <div className="flex flex-col gap-4">
          {filteredWorks.map((work) => (
            <div
              key={work.workHash}
              className="border border-border-warm rounded-lg p-4 flex flex-col gap-1"
            >
              <p className="text-gold-bright font-display text-base">{work.title}</p>
              <p className="text-sm text-gray-300 font-body">
                Author: {work.author.slice(0, 6)}...{work.author.slice(-4)}
              </p>
              <p className="text-sm text-gray-400 font-body">
                Registered: {new Date(Number(work.timestamp) * 1000).toLocaleString()}
              </p>
              {work.ipfsHash && (
                
                  <a
                  href={`https://gateway.pinata.cloud/ipfs/${work.ipfsHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gold underline text-sm w-fit"
                >
                  View file on IPFS
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default BrowseWorks