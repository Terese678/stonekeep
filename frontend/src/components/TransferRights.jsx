// This is the "Transfer Rights" panel.
// Ownership of a registered work isn't always permanent, a writer might
// sell a script, for example. This panel lets whoever currently owns a
// work hand it off to someone else's wallet. Upload the file to find out
// who owns it right now, and if that's you, you get a form to transfer
// it to a new address.

import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { keccak256 } from 'viem'
import { rightsAbi } from '../config/rightsAbi'
import { RIGHTS_ADDRESS } from '../config/addresses'

function TransferRights() {
  // address = our own connected wallet address (used to check if we're
  // the current rights holder). isConnected = whether a wallet is hooked up at all.
  const { address, isConnected } = useAccount()

  // workHash = the keccak256 hash of whatever file gets uploaded below.
  // newHolder = the wallet address typed into the "transfer to" input.
  const [workHash, setWorkHash] = useState(null)
  const [newHolder, setNewHolder] = useState('')

  // Same file-hashing logic as Register/Verify Work: read the file's
  // raw bytes and hash them, so we're checking the exact same work
  // that was originally registered.
  async function handleFileChange(e) {
    const selected = e.target.files[0]
    if (!selected) return

    const buffer = await selected.arrayBuffer()
    setWorkHash(keccak256(new Uint8Array(buffer)))
  }

  // Read-only call: asks the RightsAssignment contract "who currently
  // holds the rights to this work?" Only runs once a file has been
  // uploaded (enabled: !!workHash).
  const { data: holder } = useReadContract({
    address: RIGHTS_ADDRESS,
    abi: rightsAbi,
    functionName: 'getRightsHolder',
    args: [workHash],
    query: { enabled: !!workHash },
  })

  // Compares the holder address returned by the contract to our own
  // connected wallet address. Lowercased because Ethereum addresses
  // are case-insensitive but JS string comparison isn't.
  const isCurrentHolder = holder && address && holder.toLowerCase() === address.toLowerCase()

  // writeContract is what actually sends the transferRights transaction
  // (pops up MetaMask, costs gas). txHash is the transaction's ID once sent.
  const { writeContract, data: txHash, isPending, error: writeError } = useWriteContract()

  // Once we have a txHash, this watches for it to actually get mined
  // on-chain, so we know the transfer really went through.
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Runs when the "Transfer rights" button is clicked. Sends the
  // transferRights(workHash, newHolder) call to the contract.
  function handleTransfer(e) {
    e.preventDefault()
    if (!workHash || !newHolder) return

    writeContract({
      address: RIGHTS_ADDRESS,
      abi: rightsAbi,
      functionName: 'transferRights',
      args: [workHash, newHolder],
    })
  }

  // If no wallet is connected, don't show any of the form, just a prompt.
  if (!isConnected) {
    return (
      <div className="bg-panel border border-border-warm rounded-xl p-7 shadow-[0_0_30px_-8px_rgba(201,162,75,0.2)]">
        <h2 className="font-display text-sm uppercase tracking-[0.2em] text-gold mb-2">
          Transfer rights
        </h2>
        <p className="text-base text-gray-400 font-body">Connect your wallet first</p>
      </div>
    )
  }

  return (
    <div className="bg-panel border border-border-warm rounded-xl p-7 flex flex-col gap-4 shadow-[0_0_30px_-8px_rgba(201,162,75,0.2)]">
      <h2 className="font-display text-sm uppercase tracking-[0.2em] text-gold">
        Transfer rights
      </h2>

      {/* Step 1: upload the file so we can hash it and look up who owns it */}
      <input
        type="file"
        onChange={handleFileChange}
        className="text-base text-gray-300 font-body file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border file:border-gold file:bg-transparent file:text-gold file:text-sm file:uppercase file:tracking-wide"
      />

      {/* Once we know who holds the rights, show it, and flag if it's us */}
      {holder && (
        <p className="text-sm text-bronze font-body break-all">
          Current holder: {holder.slice(0, 6)}...{holder.slice(-4)}
          {isCurrentHolder && ' (you)'}
        </p>
      )}

      {/* If someone else holds the rights, there's nothing more to do here */}
      {holder && !isCurrentHolder && (
        <p className="text-base text-red-400 font-body">
          You aren't the current rights holder for this work.
        </p>
      )}

      {/* Step 2: only show the transfer form if we ARE the current holder,
          the contract would reject the transaction otherwise anyway, but
          hiding the form makes that obvious upfront instead of erroring later. */}
      {isCurrentHolder && (
        <form onSubmit={handleTransfer} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="New holder address (0x...)"
            value={newHolder}
            onChange={(e) => setNewHolder(e.target.value)}
            className="bg-obsidian border border-border-warm rounded-lg px-3 py-2.5 text-base font-body text-white placeholder:text-gray-500"
          />

          <button
            type="submit"
            disabled={!newHolder || isPending || isConfirming}
            className="px-4 py-3 border border-gold text-gold rounded-lg font-display text-base tracking-wide hover:bg-gold hover:text-obsidian transition-all disabled:opacity-40"
          >
            {isPending
              ? 'Confirm in wallet...'
              : isConfirming
              ? 'Transferring...'
              : 'Transfer rights'}
          </button>

          {writeError && (
            <p className="text-sm text-red-400 font-body">
              {writeError.shortMessage || writeError.message}
            </p>
          )}

          {isConfirmed && (
            <p className="text-sm text-gold-bright font-body">
              Rights transferred successfully.
            </p>
          )}
        </form>
      )}
    </div>
  )
}

export default TransferRights