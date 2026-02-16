import { CheckCircle, Plus } from 'lucide-react';

export default function ClientOnboarding() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-7 h-7 text-blue-400" />
            Client Onboarding
          </h1>
          <p className="text-gray-400 mt-1">Onboard every client the same professional way</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Start Onboarding
        </button>
      </div>
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
        <CheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Onboarding Workflows Yet</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          Onboard every client the same professional way. Create an onboarding template to get started.
        </p>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg inline-flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>
    </div>
  );
}
