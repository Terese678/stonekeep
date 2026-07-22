// The Dashboard page where a connected wallet actually does things;
// register a work, verify one, or transfer rights. This used to be the
// entire app; now it's just one page, since Browse Works lives on its
// own page and Wallet connection lives in the persistent Header.

import RegisterWork from '../components/RegisterWork'
import VerifyWork from '../components/VerifyWork'
import TransferRights from '../components/TransferRights'

function Dashboard() {
  return (
    <main className="p-10 grid grid-cols-1 md:grid-cols-3 gap-6">
      <RegisterWork />
      <VerifyWork />

      <div className="md:col-span-3">
        <TransferRights />
      </div>
    </main>
  )
}

export default Dashboard