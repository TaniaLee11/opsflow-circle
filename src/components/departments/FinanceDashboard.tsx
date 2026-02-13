import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, CreditCard, Receipt, Waves, FileText } from "lucide-react";

export function FinanceDashboard() {
  const metrics = {
    totalRevenue: 0,
    totalExpenses: 0,
    netCashFlow: 0,
    outstandingInvoices: 0,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/10">
          <DollarSign className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Finance</h1>
          <p className="text-sm text-muted-foreground">Track and manage business finances</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue (MTD)</CardDescription>
            <CardTitle className="text-3xl">${metrics.totalRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Expenses (MTD)</CardDescription>
            <CardTitle className="text-3xl">${metrics.totalExpenses.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Net Cash Flow</CardDescription>
            <CardTitle className="text-3xl">${metrics.netCashFlow.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Outstanding Invoices</CardDescription>
            <CardTitle className="text-3xl">{metrics.outstandingInvoices}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your finances</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2">
            <CreditCard className="w-4 h-4" />
            Create Invoice
          </Button>
          <Button variant="outline" className="gap-2">
            <Receipt className="w-4 h-4" />
            Record Expense
          </Button>
          <Button variant="outline" className="gap-2">
            <Waves className="w-4 h-4" />
            View Cash Flow
          </Button>
          <Button variant="outline" className="gap-2">
            <FileText className="w-4 h-4" />
            Export Financial Summary
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest financial activity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent transactions. Start tracking your finances.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Invoice Due Dates</CardTitle>
            <CardDescription>Bills and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No upcoming invoices.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Finance Tasks</CardTitle>
            <CardDescription>Pending financial actions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No finance tasks scheduled.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Financial Documents</CardTitle>
            <CardDescription>Recent uploads and reports</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No financial documents uploaded.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
