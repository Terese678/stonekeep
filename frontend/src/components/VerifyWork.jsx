// Verify a Work panel.
// Lets anyone upload a file to re-derive its hash and look it up via
// StonekeepRegistry.getWork(). Read-only, no wallet signature or gas
// needed, since this is just querying public chain data.

import { useState } from 'react'
import { useReadContract } from 'wagmi'
import { keccak256 } from 'viem'
import { registryAbi } from '../config/abis'
import { REGISTRY_ADDRESS } from '../config/addresses'

function VerifyWork() {
  const [workHash, setWorkHash] = useState(null)

  // Re-derives the hash from the file's raw bytes, same logic as
  // Register Work, so it matches whatever was hashed at registration time.
  async function handleFileChange(e) {
    const selected = e.target.files[0]
    if (!selected) return

    const buffer = await selected.arrayBuffer()
    setWorkHash(keccak256(new Uint8Array(buffer)))
  }

  // Read-only call to the contract. Only fires once workHash is set.
  const { data, isLoading, error } = useReadContract({
    address: REGISTRY_ADDRESS,
    abi: registryAbi,
    functionName: 'getWork',
    args: [workHash],
    query: { enabled: !!workHash },
  })

  // getWork returns [author, ipfsHash, title, timestamp].
  // A zero-address author means nothing was ever registered under this hash.
  const isRegistered = data && data[0] !== '0x0000000000000000000000000000000000000000'

  // Small helper so the IPFS link is built once, cleanly, instead of
  // an inline template string sitting inside the JSX attribute below.
  const ipfsUrl = data && data[1] ? 'https://gateway.pinata.cloud/ipfs/' + data[1] : null

  return (
    <div className="bg-panel border border-border-warm rounded-xl p-6 flex flex-col gap-4">
      <h2 className="font-display text-xs uppercase tracking-[0.2em] text-gold">
        Verify a work
      </h2>

      <input
        type="file"
        onChange={handleFileChange}
        className="text-sm text-gray-400 font-body file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border file:border-gold file:bg-transparent file:text-gold file:text-xs file:uppercase file:tracking-wide"
      />

      {workHash && (
        <p className="text-xs text-bronze font-body break-all">Hash: {workHash}</p>
      )}

      {isLoading && (
        <p className="text-sm text-gray-500 font-body">Checking chain...</p>
      )}

      {data && isRegistered && (
        <div className="text-sm font-body text-gray-300 flex flex-col gap-1">
          <p className="text-gold-bright">Verified on-chain</p>
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
        <p className="text-sm text-red-400 font-body">No match. This file isn't registered.</p>
      )}

      {error && (
        <p className="text-xs text-red-400 font-body">{error.shortMessage || error.message}</p>
      )}
    </div>
  )
}

export default VerifyWork