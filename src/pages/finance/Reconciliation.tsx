import { useState } from "react";
import { Receipt, Check, X, RefreshCw, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  suggestedCategory: string;
  status: "uncategorized" | "categorized" | "matched";
  source: string; // QuickBooks, Wave, Xero, Stripe, etc.
}

export default function Reconciliation() {
  // Mock data - will be replaced with real data from connected accounting software
  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      date: "2026-02-15",
      description: "Client Payment - Smith Family",
      amount: 1200,
      type: "income",
      suggestedCategory: "Service Revenue",
      status: "uncategorized",
      source: "Stripe",
    },
    {
      id: "2",
      date: "2026-02-14",
      description: "Office Supplies - Staples",
      amount: 87.43,
      type: "expense",
      suggestedCategory: "Office Supplies",
      status: "uncategorized",
      source: "QuickBooks Online",
    },
    {
      id: "3",
      date: "2026-02-13",
      description: "Software Subscription - Adobe",
      amount: 54.99,
      type: "expense",
      suggestedCategory: "Software & Subscriptions",
      status: "matched",
      source: "Wave",
    },
  ]);

  const hasConnectedAccounts = true; // Will check if user has connected accounting software
  const uncategorizedCount = transactions.filter(t => t.status === "uncategorized").length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reconciliation</h1>
          <p className="text-muted-foreground mt-1">
            Review and categorize transactions from your connected accounting software
          </p>
        </div>
        {hasConnectedAccounts && (
          <Button>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Now
          </Button>
        )}
      </div>

      {/* Empty State - No Connected Accounts */}
      {!hasConnectedAccounts ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Receipt className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Connect Your Accounting Software</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Connect QuickBooks Online, Wave, Xero, FreshBooks, or Stripe to automatically import and categorize your transactions.
            </p>
            <Button>
              <LinkIcon className="w-4 h-4 mr-2" />
              Connect Accounting Software
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Needs Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600">{uncategorizedCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Uncategorized transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Auto-Matched
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {transactions.filter(t => t.status === "matched").length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Automatically categorized</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Connected Accounts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">3</p>
                <p className="text-xs text-muted-foreground mt-1">Stripe, QuickBooks, Wave</p>
              </CardContent>
            </Card>
          </div>

          {/* Needs Review Section */}
          {uncategorizedCount > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-orange-600" />
                  {uncategorizedCount} {uncategorizedCount === 1 ? "transaction" : "transactions"} need categorization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  VOPSy has suggested categories. Review and accept, or choose a different category.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Transactions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Transactions</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">All</Button>
                <Button variant="ghost" size="sm">Uncategorized</Button>
                <Button variant="ghost" size="sm">Categorized</Button>
              </div>
            </div>

            {transactions.map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Transaction Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === "income" ? "bg-green-100" : "bg-red-100"
                        }`}>
                          <Receipt className={`w-5 h-5 ${
                            transaction.type === "income" ? "text-green-600" : "text-red-600"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{transaction.description}</h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span>{new Date(transaction.date).toLocaleDateString()}</span>
                            <Badge variant="outline" className="text-xs">
                              {transaction.source}
                            </Badge>
                          </div>
                          
                          {/* Suggested Category */}
                          {transaction.status === "uncategorized" && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm text-muted-foreground mb-2">
                                VOPSy suggests:
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-blue-100 text-blue-700">
                                  {transaction.suggestedCategory}
                                </Badge>
                                <Button size="sm" variant="outline" className="h-7">
                                  <Check className="w-3 h-3 mr-1" />
                                  Accept
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7">
                                  <X className="w-3 h-3 mr-1" />
                                  Change
                                </Button>
                              </div>
                            </div>
                          )}

                          {transaction.status === "matched" && (
                            <div className="mt-2">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <Check className="w-3 h-3 mr-1" />
                                {transaction.suggestedCategory}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }`}>
                        {transaction.type === "income" ? "+" : "-"}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {transaction.type}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Integration Info */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-base">Integration-First Reconciliation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Virtual OPS Hub reads transactions from your connected accounting software and adds an intelligence layer on top. 
                We don't create invoices or record expenses - your accounting software handles that. We reconcile, categorize, and organize for tax compliance.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
