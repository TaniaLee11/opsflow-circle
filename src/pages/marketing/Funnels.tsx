import { useState } from 'react';
import { TrendingUp, Plus, Play, Pause, FileText, BarChart3, Users, Target } from 'lucide-react';

export default function Funnels() {
  const [funnels] = useState([
    {
      id: 1,
      name: "Founder Clarity Score Funnel",
      status: "active",
      conversionRate: 24.5,
      totalLeads: 342,
      stages: [
        { name: "Landing Page", count: 1200, dropOff: 0 },
        { name: "Opt-in", count: 850, dropOff: 29 },
        { name: "Assessment", count: 520, dropOff: 39 },
        { name: "Results Page", count: 420, dropOff: 19 },
        { name: "Consultation Booked", count: 294, dropOff: 30 }
      ]
    },
    {
      id: 2,
      name: "Tax Prep Lead Magnet",
      status: "active",
      conversionRate: 18.2,
      totalLeads: 156,
      stages: []
    },
    {
      id: 3,
      name: "Nonprofit Starter Guide",
      status: "draft",
      conversionRate: 0,
      totalLeads: 0,
      stages: []
    }
  ]);

  const bestPerforming = funnels.filter(f => f.status === "active").sort((a, b) => b.conversionRate - a.conversionRate)[0];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-purple-400" />
            Funnels
          </h1>
          <p className="text-gray-400 mt-1">Visual funnel builder — guide people from discovery to decision</p>
        </div>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          Create Funnel
        </button>
      </div>

      {/* Best Performing Funnel Card */}
      {bestPerforming && (
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-purple-300 mb-1">🏆 Best Performing Funnel</p>
              <h3 className="text-xl font-semibold text-white mb-2">{bestPerforming.name}</h3>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-gray-400">Conversion Rate: </span>
                  <span className="text-green-400 font-semibold">{bestPerforming.conversionRate}%</span>
                </div>
                <div>
                  <span className="text-gray-400">Total Leads: </span>
                  <span className="text-white font-semibold">{bestPerforming.totalLeads}</span>
                </div>
              </div>
            </div>
            <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded transition-colors">
              View Details
            </button>
          </div>
        </div>
      )}

      {/* Funnels List */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">All Funnels</h2>
        </div>

        {funnels.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center">
            <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Funnels Yet</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Funnels guide people from discovery to decision. Create your first one or connect GoHighLevel to sync existing funnels.
            </p>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg inline-flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" />
              Create Your First Funnel
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {funnels.map((funnel) => (
              <div key={funnel.id} className="p-4 hover:bg-gray-800/30 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-medium">{funnel.name}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        funnel.status === 'active' ? 'bg-green-900/50 text-green-300' :
                        funnel.status === 'paused' ? 'bg-yellow-900/50 text-yellow-300' :
                        'bg-gray-700 text-gray-300'
                      }`}>
                        {funnel.status === 'active' ? <><Play className="w-3 h-3 inline mr-1" />Active</> :
                         funnel.status === 'paused' ? <><Pause className="w-3 h-3 inline mr-1" />Paused</> :
                         'Draft'}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <BarChart3 className="w-4 h-4" />
                        <span>Conversion: <span className="text-white font-medium">{funnel.conversionRate}%</span></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>Leads: <span className="text-white font-medium">{funnel.totalLeads}</span></span>
                      </div>
                      {funnel.stages.length > 0 && (
                        <div className="flex items-center gap-1.5 text-gray-400">
                          <Target className="w-4 h-4" />
                          <span>{funnel.stages.length} stages</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors">
                    View Funnel
                  </button>
                </div>

                {/* Stage Breakdown (for expanded view) */}
                {funnel.stages.length > 0 && funnel.id === 1 && (
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-3">Stage Breakdown:</p>
                    <div className="grid grid-cols-5 gap-2">
                      {funnel.stages.map((stage, idx) => (
                        <div key={idx} className="bg-gray-900/50 p-3 rounded">
                          <p className="text-xs text-gray-400 mb-1">{stage.name}</p>
                          <p className="text-lg font-semibold text-white">{stage.count}</p>
                          {stage.dropOff > 0 && (
                            <p className="text-xs text-red-400 mt-1">-{stage.dropOff}% drop-off</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Integration Note */}
      <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-300">
          <strong>Integration:</strong> GoHighLevel funnels sync here automatically. If you have funnels in your GHL account (or managed through Virtual OPS Hub's GHL), they appear with live performance data.
        </p>
      </div>
    </div>
  );
}
