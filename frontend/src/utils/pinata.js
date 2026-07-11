// THIS uploads a file to IPFS via Pinata and returns its CID (content hash).
// The CID is what gets stored on-chain as ipfsHash, a pointer to the
// actual file content, which lives on IPFS rather than the blockchain.

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT

export async function uploadToPinata(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Pinata upload failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.IpfsHash // this is the CID - e.g. "Qm..."
}