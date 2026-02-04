/**
 * Industry-Specific Financial Metrics Calculator
 * 
 * Calculates relevant financial metrics and benchmarks based on business industry
 */

export interface IndustryBenchmarks {
  grossMarginMin: number;
  grossMarginMax: number;
  netMarginMin: number;
  netMarginMax: number;
  currentRatioMin: number;
  quickRatioMin: number;
  daysReceivableTarget: number;
  cashRunwayMonthsMin: number;
  customMetrics?: Record<string, { label: string; target: number; unit: string }>;
}

export interface FinancialHealthMetric {
  label: string;
  value: string | number;
  benchmark?: string;
  status: 'excellent' | 'good' | 'warning' | 'critical' | 'neutral';
  explanation: string;
  trend?: 'up' | 'down' | 'stable';
}

const INDUSTRY_BENCHMARKS: Record<string, IndustryBenchmarks> = {
  'Retail': {
    grossMarginMin: 25,
    grossMarginMax: 50,
    netMarginMin: 2,
    netMarginMax: 5,
    currentRatioMin: 1.5,
    quickRatioMin: 0.5,
    daysReceivableTarget: 30,
    cashRunwayMonthsMin: 3,
    customMetrics: {
      inventoryTurnover: { label: 'Inventory Turnover', target: 6, unit: 'times/year' },
    }
  },
  'Services': {
    grossMarginMin: 50,
    grossMarginMax: 80,
    netMarginMin: 15,
    netMarginMax: 30,
    currentRatioMin: 1.2,
    quickRatioMin: 1.0,
    daysReceivableTarget: 45,
    cashRunwayMonthsMin: 6,
    customMetrics: {
      utilizationRate: { label: 'Utilization Rate', target: 75, unit: '%' },
    }
  },
  'SaaS': {
    grossMarginMin: 70,
    grossMarginMax: 90,
    netMarginMin: 10,
    netMarginMax: 25,
    currentRatioMin: 1.5,
    quickRatioMin: 1.3,
    daysReceivableTarget: 30,
    cashRunwayMonthsMin: 12,
    customMetrics: {
      churnRate: { label: 'Monthly Churn Rate', target: 5, unit: '%' },
      ltv: { label: 'LTV:CAC Ratio', target: 3, unit: ':1' },
    }
  },
  'Restaurant': {
    grossMarginMin: 60,
    grossMarginMax: 70,
    netMarginMin: 3,
    netMarginMax: 9,
    currentRatioMin: 1.0,
    quickRatioMin: 0.8,
    daysReceivableTarget: 7,
    cashRunwayMonthsMin: 3,
    customMetrics: {
      foodCostPercent: { label: 'Food Cost %', target: 30, unit: '%' },
      laborCostPercent: { label: 'Labor Cost %', target: 30, unit: '%' },
    }
  },
  'Construction': {
    grossMarginMin: 15,
    grossMarginMax: 30,
    netMarginMin: 5,
    netMarginMax: 10,
    currentRatioMin: 1.3,
    quickRatioMin: 0.9,
    daysReceivableTarget: 60,
    cashRunwayMonthsMin: 6,
    customMetrics: {
      jobProfitMargin: { label: 'Job Profit Margin', target: 20, unit: '%' },
    }
  },
  'Healthcare': {
    grossMarginMin: 40,
    grossMarginMax: 60,
    netMarginMin: 10,
    netMarginMax: 20,
    currentRatioMin: 1.5,
    quickRatioMin: 1.2,
    daysReceivableTarget: 45,
    cashRunwayMonthsMin: 6,
    customMetrics: {
      collectionRate: { label: 'Collection Rate', target: 95, unit: '%' },
    }
  },
  'Consulting': {
    grossMarginMin: 60,
    grossMarginMax: 85,
    netMarginMin: 20,
    netMarginMax: 40,
    currentRatioMin: 1.5,
    quickRatioMin: 1.3,
    daysReceivableTarget: 45,
    cashRunwayMonthsMin: 6,
    customMetrics: {
      utilizationRate: { label: 'Consultant Utilization', target: 70, unit: '%' },
      realization: { label: 'Realization Rate', target: 90, unit: '%' },
    }
  },
  'E-commerce': {
    grossMarginMin: 30,
    grossMarginMax: 50,
    netMarginMin: 5,
    netMarginMax: 15,
    currentRatioMin: 1.5,
    quickRatioMin: 0.8,
    daysReceivableTarget: 14,
    cashRunwayMonthsMin: 6,
    customMetrics: {
      conversionRate: { label: 'Conversion Rate', target: 2.5, unit: '%' },
      aov: { label: 'Average Order Value', target: 100, unit: '$' },
    }
  },
  'Manufacturing': {
    grossMarginMin: 20,
    grossMarginMax: 40,
    netMarginMin: 5,
    netMarginMax: 15,
    currentRatioMin: 1.5,
    quickRatioMin: 1.0,
    daysReceivableTarget: 45,
    cashRunwayMonthsMin: 6,
    customMetrics: {
      inventoryTurnover: { label: 'Inventory Turnover', target: 8, unit: 'times/year' },
    }
  },
  'Real Estate': {
    grossMarginMin: 30,
    grossMarginMax: 50,
    netMarginMin: 10,
    netMarginMax: 25,
    currentRatioMin: 1.2,
    quickRatioMin: 0.8,
    daysReceivableTarget: 30,
    cashRunwayMonthsMin: 12,
    customMetrics: {
      occupancyRate: { label: 'Occupancy Rate', target: 95, unit: '%' },
    }
  },
};

// Default benchmarks for unknown industries
const DEFAULT_BENCHMARKS: IndustryBenchmarks = {
  grossMarginMin: 30,
  grossMarginMax: 60,
  netMarginMin: 5,
  netMarginMax: 15,
  currentRatioMin: 1.5,
  quickRatioMin: 1.0,
  daysReceivableTarget: 45,
  cashRunwayMonthsMin: 6,
};

export function getIndustryBenchmarks(industry?: string): IndustryBenchmarks {
  if (!industry) return DEFAULT_BENCHMARKS;
  return INDUSTRY_BENCHMARKS[industry] || DEFAULT_BENCHMARKS;
}

export interface FinancialData {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  grossProfit: number;
  totalAssets: number;
  totalLiabilities: number;
  currentAssets: number;
  currentLiabilities: number;
  accountsReceivable: number;
  cashOnHand: number;
  monthlyBurnRate?: number;
}

export function calculateFinancialHealthMetrics(
  data: FinancialData,
  industry?: string
): FinancialHealthMetric[] {
  const benchmarks = getIndustryBenchmarks(industry);
  const metrics: FinancialHealthMetric[] = [];

  // Gross Margin %
  const grossMargin = data.totalRevenue > 0 
    ? (data.grossProfit / data.totalRevenue) * 100 
    : 0;
  
  metrics.push({
    label: 'Gross Margin',
    value: `${grossMargin.toFixed(1)}%`,
    benchmark: `${benchmarks.grossMarginMin}-${benchmarks.grossMarginMax}%`,
    status: grossMargin >= benchmarks.grossMarginMin && grossMargin <= benchmarks.grossMarginMax + 10
      ? 'excellent'
      : grossMargin >= benchmarks.grossMarginMin - 5
      ? 'good'
      : 'warning',
    explanation: industry
      ? `For ${industry} businesses, target gross margin is ${benchmarks.grossMarginMin}-${benchmarks.grossMarginMax}%`
      : `Target gross margin is ${benchmarks.grossMarginMin}-${benchmarks.grossMarginMax}%`,
  });

  // Net Profit Margin %
  const netMargin = data.totalRevenue > 0 
    ? (data.netIncome / data.totalRevenue) * 100 
    : 0;
  
  metrics.push({
    label: 'Net Profit Margin',
    value: `${netMargin.toFixed(1)}%`,
    benchmark: `${benchmarks.netMarginMin}-${benchmarks.netMarginMax}%`,
    status: netMargin >= benchmarks.netMarginMin
      ? 'excellent'
      : netMargin >= 0
      ? 'good'
      : 'critical',
    explanation: netMargin < 0
      ? 'Your business is operating at a loss. Review expenses and pricing.'
      : `Healthy net margin for your industry is ${benchmarks.netMarginMin}-${benchmarks.netMarginMax}%`,
  });

  // Current Ratio (Liquidity)
  const currentRatio = data.currentLiabilities > 0
    ? data.currentAssets / data.currentLiabilities
    : 0;
  
  metrics.push({
    label: 'Current Ratio',
    value: currentRatio.toFixed(2),
    benchmark: `${benchmarks.currentRatioMin}+`,
    status: currentRatio >= benchmarks.currentRatioMin
      ? 'excellent'
      : currentRatio >= 1.0
      ? 'good'
      : 'warning',
    explanation: currentRatio >= benchmarks.currentRatioMin
      ? 'You have sufficient current assets to cover short-term liabilities'
      : 'Consider improving liquidity to cover short-term obligations',
  });

  // Cash Runway (months)
  const cashRunway = data.monthlyBurnRate && data.monthlyBurnRate > 0
    ? data.cashOnHand / data.monthlyBurnRate
    : 0;
  
  if (cashRunway > 0) {
    metrics.push({
      label: 'Cash Runway',
      value: `${cashRunway.toFixed(1)} months`,
      benchmark: `${benchmarks.cashRunwayMonthsMin}+ months`,
      status: cashRunway >= benchmarks.cashRunwayMonthsMin
        ? 'excellent'
        : cashRunway >= 3
        ? 'good'
        : 'critical',
      explanation: cashRunway < benchmarks.cashRunwayMonthsMin
        ? `Aim for at least ${benchmarks.cashRunwayMonthsMin} months of runway for stability`
        : 'Healthy cash reserves to sustain operations',
    });
  }

  // Debt-to-Equity Ratio
  const equity = data.totalAssets - data.totalLiabilities;
  const debtToEquity = equity > 0 ? data.totalLiabilities / equity : 0;
  
  metrics.push({
    label: 'Debt-to-Equity',
    value: debtToEquity.toFixed(2),
    benchmark: '<2.0',
    status: debtToEquity < 1.0
      ? 'excellent'
      : debtToEquity < 2.0
      ? 'good'
      : 'warning',
    explanation: debtToEquity < 1.0
      ? 'Low leverage - strong equity position'
      : 'Moderate leverage - monitor debt levels',
  });

  // Operating Efficiency (Revenue per $ of Assets)
  const assetTurnover = data.totalAssets > 0
    ? data.totalRevenue / data.totalAssets
    : 0;
  
  metrics.push({
    label: 'Asset Turnover',
    value: assetTurnover.toFixed(2),
    benchmark: '1.0+',
    status: assetTurnover >= 1.0
      ? 'excellent'
      : assetTurnover >= 0.5
      ? 'good'
      : 'neutral',
    explanation: assetTurnover >= 1.0
      ? 'Efficient use of assets to generate revenue'
      : 'Consider optimizing asset utilization',
  });

  return metrics;
}

export function getFinancialHealthScore(metrics: FinancialHealthMetric[]): {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
} {
  const statusScores = {
    excellent: 100,
    good: 75,
    warning: 50,
    critical: 25,
    neutral: 60,
  };

  const totalScore = metrics.reduce((sum, m) => sum + statusScores[m.status], 0);
  const score = Math.round(totalScore / metrics.length);

  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  let summary: string;

  if (score >= 90) {
    grade = 'A';
    summary = 'Excellent financial health. Your business is performing well above industry benchmarks.';
  } else if (score >= 75) {
    grade = 'B';
    summary = 'Good financial health. Most metrics are on track with minor areas for improvement.';
  } else if (score >= 60) {
    grade = 'C';
    summary = 'Fair financial health. Several metrics need attention to improve stability.';
  } else if (score >= 50) {
    grade = 'D';
    summary = 'Below average financial health. Immediate action needed on key metrics.';
  } else {
    grade = 'F';
    summary = 'Critical financial health. Urgent intervention required to stabilize the business.';
  }

  return { score, grade, summary };
}
