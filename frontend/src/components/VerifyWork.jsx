// This is the "Verify a Work" panel.
// Anyone (no wallet needed) can drop in a file here and check if it's
// already been registered. We hash the file the same way Register Work
// does, then just read from the contract, no transaction, no gas, just
// a lookup. If it matches, we show who registered it, when, and a link
// to the actual file on IPFS.

import { useState } from 'react'
import { useReadContract } from 'wagmi'
import { keccak256 } from 'viem'
import { registryAbi } from '../config/abis'
import { useContractAddresses } from '../config/getAddresses'

function VerifyWork() {
  const addresses = useContractAddresses()
  const [workHash, setWorkHash] = useState(null)

  // Re-derives the hash from the file's raw bytes, same logic as
  // Register Work, so it matches whatever was hashed at registration time.
  async function handleFileChange(e) {
    const selected = e.target.files[0]
    if (!selected) return

    const buffer = await selected.arrayBuffer()
    setWorkHash(keccak256(new Uint8Array(buffer)))
  }

  // Read-only call to the contract. Only fires once workHash is set
  // AND we know which network's addresses to use (enabled: !!workHash && !!addresses).
  const { data, isLoading, error } = useReadContract({
    address: addresses?.REGISTRY_ADDRESS,
    abi: registryAbi,
    functionName: 'getWork',
    args: [workHash],
    query: { enabled: !!workHash && !!addresses },
  })

  // getWork returns [author, ipfsHash, title, timestamp].
  // A zero-address author means nothing was ever registered under this hash.
  const isRegistered = data && data[0] !== '0x0000000000000000000000000000000000000000'

  // Small helper so the IPFS link is built once, cleanly, instead of
  // an inline template string sitting inside the JSX attribute below.
  const ipfsUrl = data && data[1] ? 'https://gateway.pinata.cloud/ipfs/' + data[1] : null

  return (
    <div className="bg-panel border border-border-warm rounded-xl p-7 flex flex-col gap-4 shadow-[0_0_30px_-8px_rgba(201,162,75,0.2)]">
      <h2 className="font-display text-sm uppercase tracking-[0.2em] text-gold">
        Verify a work
      </h2>

      {!addresses && (
        <p className="text-base text-gray-400 font-body">
          Please switch your wallet to BOT Chain (testnet or mainnet)
        </p>
      )}

      <input
        type="file"
        onChange={handleFileChange}
        className="text-base text-gray-300 font-body file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border file:border-gold file:bg-transparent file:text-gold file:text-sm file:uppercase file:tracking-wide"
      />

      {workHash && (
        <p className="text-sm text-bronze font-body break-all">Hash: {workHash}</p>
      )}

      {isLoading && (
        <p className="text-base text-gray-400 font-body">Checking chain...</p>
      )}

      {data && isRegistered && (
        <div className="text-base font-body text-gray-200 flex flex-col gap-1.5">
          <p className="text-gold-bright text-lg font-display">Verified on-chain</p>
          <p>Title: {data[2]}</p>
          <p>Author: {data[0].slice(0, 6)}...{data[0].slice(-4)}</p>
          <p>Registered: {new Date(Number(data[3]) * 1000).toLocaleString()}</p>
          {ipfsUrl && (
            <a href={ipfsUrl} target="_blank" rel="noreferrer" className="text-gold underline">
              View file on IPFS
            </a>
          )}
        </div>
      )}

      {data && !isRegistered && (
        <p className="text-base text-red-400 font-body">No match. This file isn't registered.</p>
      )}

      {error && (
        <p className="text-sm text-red-400 font-body">{error.shortMessage || error.message}</p>
      )}
    </div>
  )
}

export default VerifyWork