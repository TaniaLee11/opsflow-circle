import { Building2, Plus } from 'lucide-react';

export default function Banking() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-7 h-7 text-yellow-400" />
            Banking
          </h1>
          <p className="text-gray-400 mt-1">Connect and monitor your business bank accounts</p>
        </div>
        <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Connect Account
        </button>
      </div>
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
        <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Bank Accounts Connected</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Connect your business bank accounts to see balances, transactions, and cash flow in real-time.
        </p>
        <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Connect Bank Account
        </button>
      </div>
    </div>
  );
}
