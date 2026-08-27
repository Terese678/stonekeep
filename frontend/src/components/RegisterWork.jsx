// Register Work panel.
// Lets a connected wallet hash a file client-side (keccak256, matching the
// contract's bytes32 workHash param) and write that hash + a title on-chain
// via StonekeepRegistry.registerWork(). The file itself never leaves the
// browser, only its hash goes to the chain, which is the whole point of a
// proof-of-authorship system: prove you had it, without exposing it.
// The file is also uploaded to Pinata so we get a real IPFS CID to store
// as ipfsHash, instead of an empty placeholder.

// Registering also requires an explicit attestation checkbox. The contract
// itself requires attestsOwnership to be true, so this isn't just a UI
// nicety, it's a real on-chain claim the registrant is making.

// Before writing to chain, we also ask our own /api/check-similarity
// endpoint (backed by Backboard) whether this title resembles anything
// already registered. This is informational, not a hard block, since we
// can't (and shouldn't) prevent someone from registering their own work
// just because titles happen to look similar - but it's worth surfacing
// so the creator can make an informed call before paying gas.

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { keccak256 } from 'viem'
import { registryAbi } from '../config/abis'
import { useContractAddresses } from '../config/getAddresses'
import { uploadToPinata } from '../utils/pinata'

function RegisterWork() {
  const { isConnected } = useAccount()
  const addresses = useContractAddresses()

  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [workHash, setWorkHash] = useState(null)
  const [attestsOwnership, setAttestsOwnership] = useState(false)

  // Similarity check state - separate from the on-chain transaction state
  // below, since this happens first and is its own async step.
  const [checkingSimilarity, setCheckingSimilarity] = useState(false)
  const [similarityResult, setSimilarityResult] = useState(null) // { similar, matchTitle, reason } | null
  const [similarityError, setSimilarityError] = useState(null)

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
    setSimilarityResult(null) // a new file means any prior check is stale
    setSimilarityError(null)

    const buffer = await selected.arrayBuffer()
    const hash = keccak256(new Uint8Array(buffer))
    setWorkHash(hash)
  }

  // Calls our own backend, which asks Backboard whether this title
  // resembles anything previously registered. Never blocks registration
  // on its own - just informs the "Register on-chain" button's label
  // and shows a warning banner if something similar turns up.
  async function checkSimilarity() {
    setCheckingSimilarity(true)
    setSimilarityError(null)

    try {
      const res = await fetch('/api/check-similarity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, workHash }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Similarity check failed')
      }

      const data = await res.json()
      setSimilarityResult(data)
    } catch (err) {
      // If the check itself fails (network issue, Backboard down, etc.),
      // we don't want that to block registration entirely - just note it
      // and let the creator proceed without a similarity opinion.
      setSimilarityError(err.message)
    } finally {
      setCheckingSimilarity(false)
    }
  }

  // Uploads the file to Pinata first to get a real CID, then writes the
  // hash + CID + title + attestation on-chain. async because both steps
  // take real time.
  async function registerOnChain() {
    const ipfsHash = await uploadToPinata(file) // upload first, get real CID

    writeContract({
      address: addresses.REGISTRY_ADDRESS,
      abi: registryAbi,
      functionName: 'registerWork',
      args: [workHash, ipfsHash, title, attestsOwnership],
    })
  }

  // The main submit button. First run, this triggers the similarity
  // check. If nothing similar was found (or the creator already saw the
  // warning and clicks again), it proceeds to the actual on-chain write.
  async function handleSubmit(e) {
    e.preventDefault()
    if (!workHash || !title || !attestsOwnership) return

    if (!similarityResult) {
      await checkSimilarity()
      return // wait for the result to render before actually registering
    }

    await registerOnChain()
  }

  // If wallet isn't connected, don't even show the form, just a prompt.
  if (!isConnected) {
    return (
      <div className="bg-panel border border-border-warm rounded-xl p-7 shadow-[0_0_30px_-8px_rgba(201,162,75,0.2)]">
        <h2 className="font-display text-sm uppercase tracking-[0.2em] text-gold mb-2">
          Register work
        </h2>
        <p className="text-base text-gray-400 font-body">Connect your wallet first</p>
      </div>
    )
  }

  // If the wallet is connected but on some other network entirely (not our
  // testnet or mainnet), we don't know which addresses to use, so don't
  // show the form.
  if (!addresses) {
    return (
      <div className="bg-panel border border-border-warm rounded-xl p-7 shadow-[0_0_30px_-8px_rgba(201,162,75,0.2)]">
        <h2 className="font-display text-sm uppercase tracking-[0.2em] text-gold mb-2">
          Register work
        </h2>
        <p className="text-base text-gray-400 font-body">
          Please switch your wallet to BOT Chain (testnet or mainnet)
        </p>
      </div>
    )
  }

  return (
    <div className="bg-panel border border-border-warm rounded-xl p-7 flex flex-col gap-4 shadow-[0_0_30px_-8px_rgba(201,162,75,0.2)]">
      <h2 className="font-display text-sm uppercase tracking-[0.2em] text-gold">
        Register work
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            setSimilarityResult(null) // a changed title means re-check
          }}
          className="bg-obsidian border border-border-warm rounded-lg px-3 py-2.5 text-base font-body text-white placeholder:text-gray-500"
        />

        <input
          type="file"
          onChange={handleFileChange}
          className="text-base text-gray-300 font-body file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border file:border-gold file:bg-transparent file:text-gold file:text-sm file:uppercase file:tracking-wide"
        />

        {/* Show the computed hash once a file is selected, useful for debugging/trust */}
        {workHash && (
          <p className="text-sm text-bronze font-body break-all">
            Hash: {workHash}
          </p>
        )}

        {/* Required attestation. The contract itself rejects registration
            if this isn't true, so this checkbox is a real claim, not
            just a UI formality. */}
        <label className="flex items-start gap-2.5 text-sm text-gray-300 font-body cursor-pointer">
          <input
            type="checkbox"
            checked={attestsOwnership}
            onChange={(e) => setAttestsOwnership(e.target.checked)}
            className="mt-0.5 cursor-pointer"
          />
          <span>I confirm I am the creator of this work and have the right to register it.</span>
        </label>

        {/* Similarity warning banner - only shown if the check found a
            likely match. Doesn't block registration, just informs. */}
        {similarityResult?.similar && (
          <div className="border border-yellow-600/50 bg-yellow-950/20 rounded-lg p-3">
            <p className="text-sm text-yellow-400 font-body">
              This may resemble an existing work: "{similarityResult.matchTitle}"
            </p>
            {similarityResult.reason && (
              <p className="text-sm text-yellow-500/70 font-body mt-1">
                {similarityResult.reason}
              </p>
            )}
          </div>
        )}

        {similarityResult && similarityResult.similar === false && (
          <p className="text-sm text-gold-bright/70 font-body">
            No similar work found.
          </p>
        )}

        {similarityError && (
          <p className="text-sm text-gray-500 font-body">
            Similarity check unavailable, proceeding without it.
          </p>
        )}

        <button
          type="submit"
          disabled={!file || !title || !attestsOwnership || checkingSimilarity || isPending || isConfirming}
          className="px-4 py-3 border border-gold text-gold rounded-lg font-display text-base tracking-wide hover:bg-gold hover:text-obsidian transition-all disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gold"
        >
          {checkingSimilarity
            ? 'Checking for similar work...'
            : isPending
            ? 'Confirm in wallet...'
            : isConfirming
            ? 'Registering...'
            : isConfirmed
            ? 'Registered ✓'
            : similarityResult?.similar
            ? 'Register anyway'
            : similarityResult
            ? 'Register on-chain'
            : 'Check & register'}
        </button>

        {writeError && (
          <p className="text-sm text-red-400 font-body">
            {writeError.shortMessage || writeError.message}
          </p>
        )}

        {isConfirmed && (
          <p className="text-sm text-gold-bright font-body">
            Success — this work is now timestamped on BOT Chain.
          </p>
        )}
      </form>
    </div>
  )
}

export default RegisterWork