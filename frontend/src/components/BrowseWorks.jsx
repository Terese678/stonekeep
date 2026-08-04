// The Browse Works page, a public, read-only feed of every work
// registered on Stonekeep. No wallet needed, since this is just reading
// public on-chain data. Pulls past WorkRegistered events directly from
// the chain using viem. Defaults to Mainnet, since that's the real,
// live activity that matters most, testnet is still available via
// the toggle, mainly useful for testing new features safely.

import { useState, useEffect } from 'react'
import { createPublicClient, http, parseAbiItem } from 'viem'

// The block each contract was deployed in. Starting the event search
// here (instead of block 0) keeps the query fast and cheap.
const TESTNET_DEPLOY_BLOCK = 18484406n // block of the current testnet StonekeepRegistry deploy tx
const MAINNET_DEPLOY_BLOCK = 18346894n // block of the current mainnet StonekeepRegistry deploy tx

const NETWORKS = {
  testnet: {
    label: 'Testnet',
    address: '0xF93a927d9A7449aF5E3573646301EB0BF5Df5395',
    deployBlock: TESTNET_DEPLOY_BLOCK,
    client: createPublicClient({
      chain: {
        id: 968,
        name: 'BOT Chain Testnet',
        nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
        rpcUrls: { default: { http: ['https://rpc.bohr.life'] } },
      },
      transport: http(),
    }),
  },
  mainnet: {
    label: 'Mainnet',
    address: '0xeCA06aDAD4e9D7469DDfd24c18D32b1d0CA38378',
    deployBlock: MAINNET_DEPLOY_BLOCK,
    client: createPublicClient({
      chain: {
        id: 677,
        name: 'BOT Chain Mainnet',
        nativeCurrency: { name: 'BOT', symbol: 'BOT', decimals: 18 },
        rpcUrls: { default: { http: ['https://rpc.botchain.ai'] } },
      },
      transport: http(),
    }),
  },
}

// The exact shape of the WorkRegistered event, matching what we added
// to StonekeepRegistry.sol. viem needs this to know how to decode the
// raw log data into readable fields.
const workRegisteredEvent = parseAbiItem(
  'event WorkRegistered(bytes32 indexed workHash, address indexed author, string ipfsHash, string title, uint256 timestamp, bool attestsOwnership)'
)

function BrowseWorks() {
  const [network, setNetwork] = useState('mainnet')
  const [works, setWorks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchWorks() {
      try {
        setIsLoading(true)
        setError(null)
        setWorks([])

        const { client, address, deployBlock } = NETWORKS[network]

        const currentBlock = await client.getBlockNumber()

        const MAX_RANGE = 5000n
        let logs = []
        let fromBlock = deployBlock

        while (fromBlock <= currentBlock) {
          const toBlock = fromBlock + MAX_RANGE - 1n > currentBlock
            ? currentBlock
            : fromBlock + MAX_RANGE - 1n

          const chunkLogs = await client.getLogs({
            address,
            event: workRegisteredEvent,
            fromBlock,
            toBlock,
          })

          logs = logs.concat(chunkLogs)
          fromBlock = toBlock + 1n
        }

        if (cancelled) return

        const parsed = logs
          .map((log) => ({
            workHash: log.args.workHash,
            author: log.args.author,
            ipfsHash: log.args.ipfsHash,
            title: log.args.title,
            timestamp: log.args.timestamp,
            attestsOwnership: log.args.attestsOwnership,
          }))
          .reverse()

        setWorks(parsed)
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchWorks()

    return () => {
      cancelled = true
    }
  }, [network])

  const filteredWorks = works.filter((work) =>
    work.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main className="p-10">
      <div className="bg-panel border border-border-warm rounded-xl p-7 shadow-[0_0_30px_-8px_rgba(201,162,75,0.2)]">
        <h2 className="font-display text-sm uppercase tracking-[0.2em] text-gold mb-4">
          Browse Works
        </h2>

        {/* Network toggle */}
        <div className="flex gap-2 mb-4">
          {Object.entries(NETWORKS).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setNetwork(key)}
              className={`px-3 py-1.5 rounded-lg font-display text-xs uppercase tracking-wide border transition-all ${
                network === key
                  ? 'border-gold bg-gold text-obsidian'
                  : 'border-border-warm text-gray-400 hover:text-gold'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

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