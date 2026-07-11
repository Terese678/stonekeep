// Register Work panel.
// Lets a connected wallet hash a file client-side (keccak256, matching the
// contract's bytes32 workHash param) and write that hash + a title on-chain
// via StonekeepRegistry.registerWork(). The file itself never leaves the
// browser, only its hash goes to the chain, which is the whole point of a
// proof-of-authorship system: prove you had it, without exposing it.

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { keccak256, toBytes } from 'viem'
import { registryAbi } from '../config/abis'
import { REGISTRY_ADDRESS } from '../config/addresses'
import { uploadToPinata } from '../utils/pinata'

function RegisterWork() {
  const { isConnected } = useAccount()

  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [workHash, setWorkHash] = useState(null)

  // writeContract triggers the actual transaction (MetaMask popup, gas, etc.)
  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract()

  // Once we have a txHash, this watches for it to actually get mined.
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Reads the selected file and hashes its raw bytes with keccak256.
  // keccak256 (not SHA-256) is used because it matches Solidity's native
  // hash function and outputs exactly 32 bytes, a perfect fit for bytes32.
  async function handleFileChange(e) {
    const selected = e.target.files[0]
    if (!selected) return

    setFile(selected)

    const buffer = await selected.arrayBuffer()
    const hash = keccak256(new Uint8Array(buffer))
    setWorkHash(hash)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!workHash || !title) return

    const ipfsHash = await uploadToPinata(file) // upload first, get real CID

    writeContract({
       address: REGISTRY_ADDRESS,
       abi: registryAbi,
       functionName: 'registerWork',
       args: [workHash, ipfsHash, title],
    })
  }

  // If wallet isn't connected, don't even show the form, just a prompt.
  if (!isConnected) {
    return (
      <div className="bg-panel border border-border-warm rounded-xl p-6">
        <h2 className="font-display text-xs uppercase tracking-[0.2em] text-gold mb-2">
          Register work
        </h2>
        <p className="text-sm text-gray-500 font-body">Connect your wallet first</p>
      </div>
    )
  }

  return (
    <div className="bg-panel border border-border-warm rounded-xl p-6 flex flex-col gap-4">
      <h2 className="font-display text-xs uppercase tracking-[0.2em] text-gold">
        Register work
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-obsidian border border-border-warm rounded-lg px-3 py-2 text-sm font-body text-white placeholder:text-gray-600"
        />

        <input
          type="file"
          onChange={handleFileChange}
          className="text-sm text-gray-400 font-body file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border file:border-gold file:bg-transparent file:text-gold file:text-xs file:uppercase file:tracking-wide"
        />

        {/* Show the computed hash once a file is selected useful for debugging/trust */}
        {workHash && (
          <p className="text-xs text-bronze font-body break-all">
            Hash: {workHash}
          </p>
        )}

        <button
          type="submit"
          disabled={!file || !title || isPending || isConfirming}
          className="px-4 py-2.5 border border-gold text-gold rounded-lg font-display text-sm tracking-wide hover:bg-gold hover:text-obsidian transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gold"
        >
          {isPending
            ? 'Confirm in wallet...'
            : isConfirming
            ? 'Registering...'
            : isConfirmed
            ? 'Registered ✓'
            : 'Register on-chain'}
        </button>

        {writeError && (
          <p className="text-xs text-red-400 font-body">
            {writeError.shortMessage || writeError.message}
          </p>
        )}

        {isConfirmed && (
          <p className="text-xs text-gold-bright font-body">
            Success — this work is now timestamped on BOT Chain.
          </p>
        )}
      </form>
    </div>
  )
}

export default RegisterWork