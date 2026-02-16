import { Code, Plus } from 'lucide-react';

export default function APIConnections() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Code className="w-7 h-7 text-cyan-400" />
            APIConnections
          </h1>
          <p className="text-gray-400 mt-1">Systems tool - Full implementation coming soon</p>
        </div>
        <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New
        </button>
      </div>
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
        <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Page Under Construction</h3>
        <p className="text-gray-400">This page is being built. Check back soon!</p>
      </div>
    </div>
  );
}
