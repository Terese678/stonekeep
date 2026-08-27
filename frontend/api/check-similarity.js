// Serverless function (runs on Vercel, server-side only).
// Given a newly registered work's title and on-chain hash, this:
//   1. Uploads the title as a small text document to our Backboard
//      assistant, which auto-embeds and indexes it.
//   2. Waits for it to finish indexing.
//   3. Asks the assistant whether this new work closely resembles any
//      previously uploaded (registered) work.
//   4. Logs the mapping (work_hash, title, backboard_document_id) in
//      Supabase, so we can trace which on-chain work maps to which
//      Backboard document.
//   5. Returns a similarity verdict to the frontend.

// All secrets here (BACKBOARD_API_KEY, SUPABASE_URL, SUPABASE_SECRET_KEY,
// BACKBOARD_ASSISTANT_ID) are read from server-side environment
// variables only - never exposed to the browser.

const BACKBOARD_BASE = 'https://app.backboard.io/api'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { title, workHash } = req.body || {}

  if (!title || !workHash) {
    return res.status(400).json({ error: 'title and workHash are required' })
  }

  const {
    BACKBOARD_API_KEY,
    BACKBOARD_ASSISTANT_ID,
    SUPABASE_URL,
    SUPABASE_SECRET_KEY,
  } = process.env

  if (!BACKBOARD_API_KEY || !BACKBOARD_ASSISTANT_ID || !SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    return res.status(500).json({ error: 'Server misconfigured: missing environment variables' })
  }

  try {
    // Step 1: upload the title as a small text "document" to our assistant.
    // We wrap it as a .txt file since Backboard's document upload expects
    // an actual file, not a raw string.
    const fileContent = `Registered work title: ${title}\nWork hash: ${workHash}`
    const fileBlob = new Blob([fileContent], { type: 'text/plain' })

    const formData = new FormData()
    formData.append('file', fileBlob, `${workHash}.txt`)

    const uploadRes = await fetch(
      `${BACKBOARD_BASE}/assistants/${BACKBOARD_ASSISTANT_ID}/documents`,
      {
        method: 'POST',
        headers: { 'X-API-Key': BACKBOARD_API_KEY },
        body: formData,
      }
    )

    if (!uploadRes.ok) {
      const errText = await uploadRes.text()
      throw new Error(`Backboard upload failed: ${uploadRes.status} ${errText}`)
    }

    const uploadData = await uploadRes.json()
    const documentId = uploadData.document_id || uploadData.id

    if (!documentId) {
      throw new Error('Backboard upload succeeded but no document_id was returned')
    }

    // Step 2: poll for "indexed" status, with a short timeout so a slow
    // index doesn't hang the request forever.
    const maxAttempts = 10
    const delayMs = 1000
    let indexed = false

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const statusRes = await fetch(`${BACKBOARD_BASE}/documents/${documentId}/status`, {
        headers: { 'X-API-Key': BACKBOARD_API_KEY },
      })
      const statusData = await statusRes.json()

      if (statusData.status === 'indexed') {
        indexed = true
        break
      }
      if (statusData.status === 'failed') {
        throw new Error('Backboard failed to index the document')
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }

    // Step 3: ask the assistant to compare this new work against
    // everything previously uploaded, regardless of whether indexing
    // fully finished in time - a partial index still lets us ask.
    const question = `A new work titled "${title}" was just registered. Compare it against all previously registered works you have documents for (excluding this exact one). Does it closely resemble any prior work in title or apparent subject matter? Respond in this exact format: SIMILAR: yes or no | MATCH: title of the closest match, or none | REASON: one short sentence.`

    const messageRes = await fetch(`${BACKBOARD_BASE}/threads/messages`, {
      method: 'POST',
      headers: {
        'X-API-Key': BACKBOARD_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: question,
        assistant_id: BACKBOARD_ASSISTANT_ID,
      }),
    })

    if (!messageRes.ok) {
      const errText = await messageRes.text()
      throw new Error(`Backboard similarity check failed: ${messageRes.status} ${errText}`)
    }

    const messageData = await messageRes.json()
    const replyText = messageData.content || ''

    // Parse the structured reply. If parsing fails for any reason, fall
    // back to returning the raw text so nothing is silently lost.
    const similarMatch = replyText.match(/SIMILAR:\s*(yes|no)/i)
    const matchTitleMatch = replyText.match(/MATCH:\s*(.+?)(\||$)/i)
    const reasonMatch = replyText.match(/REASON:\s*(.+)/i)

    const similar = similarMatch ? similarMatch[1].toLowerCase() === 'yes' : null
    const matchTitle = matchTitleMatch ? matchTitleMatch[1].trim() : null
    const reason = reasonMatch ? reasonMatch[1].trim() : replyText

    // Step 4: log the mapping in Supabase so we can trace on-chain hash
    // to Backboard document going forward.
    const supabaseRes = await fetch(`${SUPABASE_URL}/rest/v1/work_embeddings`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SECRET_KEY,
        Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        work_hash: workHash,
        title,
        backboard_document_id: documentId,
      }),
    })

    if (!supabaseRes.ok) {
      const errText = await supabaseRes.text()
      // Don't fail the whole request over a logging issue - the
      // similarity check itself already succeeded. Just note it.
      console.error('Supabase logging failed:', errText)
    }

    return res.status(200).json({
      similar,
      matchTitle,
      reason,
      indexed,
      documentId,
    })
  } catch (err) {
    console.error('check-similarity error:', err)
    return res.status(500).json({ error: err.message || 'Unknown error' })
  }
}