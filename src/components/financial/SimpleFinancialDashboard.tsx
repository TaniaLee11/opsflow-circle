import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";

interface FinancialData {
  profitAndLoss?: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    grossProfit: number;
    operatingIncome: number;
    period: string;
  };
  balanceSheet?: {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    currentAssets: number;
    currentLiabilities: number;
    asOfDate: string;
  };
}

interface SimpleFinancialDashboardProps {
  data: FinancialData | null;
}

export function SimpleFinancialDashboard({ data }: SimpleFinancialDashboardProps) {
  // If no data, show placeholder
  if (!data?.profitAndLoss || !data?.balanceSheet) {
    return (
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Financial Health Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">
            Connect QuickBooks to see your financial health metrics and industry benchmarks.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { profitAndLoss, balanceSheet } = data;
  
  // Calculate key metrics safely
  const grossMargin = profitAndLoss.totalRevenue > 0 
    ? ((profitAndLoss.grossProfit / profitAndLoss.totalRevenue) * 100).toFixed(1)
    : "0.0";
    
  const netMargin = profitAndLoss.totalRevenue > 0
    ? ((profitAndLoss.netIncome / profitAndLoss.totalRevenue) * 100).toFixed(1)
    : "0.0";
    
  const currentRatio = balanceSheet.currentLiabilities > 0
    ? (balanceSheet.currentAssets / balanceSheet.currentLiabilities).toFixed(2)
    : "0.00";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Financial Health Overview
          </CardTitle>
          <p className="text-sm text-slate-400">
            {profitAndLoss.period} • As of {new Date(balanceSheet.asOfDate).toLocaleDateString()}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gross Margin */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Gross Margin</span>
                {parseFloat(grossMargin) > 30 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <div className="text-2xl font-bold text-white">{grossMargin}%</div>
              <div className="text-xs text-slate-500 mt-1">
                {formatCurrency(profitAndLoss.grossProfit)} gross profit
              </div>
            </div>

            {/* Net Margin */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Net Profit Margin</span>
                {profitAndLoss.netIncome > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
              <div className="text-2xl font-bold text-white">{netMargin}%</div>
              <div className="text-xs text-slate-500 mt-1">
                {formatCurrency(profitAndLoss.netIncome)} net income
              </div>
            </div>

            {/* Current Ratio */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Current Ratio</span>
                {parseFloat(currentRatio) >= 1.5 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              <div className="text-2xl font-bold text-white">{currentRatio}</div>
              <div className="text-xs text-slate-500 mt-1">
                Liquidity health
              </div>
            </div>
          </div>

          {/* Revenue & Expenses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="text-sm text-slate-400 mb-1">Total Revenue</div>
              <div className="text-xl font-bold text-green-400">
                {formatCurrency(profitAndLoss.totalRevenue)}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="text-sm text-slate-400 mb-1">Total Expenses</div>
              <div className="text-xl font-bold text-red-400">
                {formatCurrency(profitAndLoss.totalExpenses)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
