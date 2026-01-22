import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { decryptToken, encryptToken } from "../_shared/token-encryption.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Invoice {
  id: string;
  number: string;
  customerName: string;
  amount: number;
  currency: string;
  status: 'paid' | 'unpaid' | 'overdue' | 'draft';
  dueDate: string;
  createdDate: string;
}

interface CashFlowData {
  balance: number;
  income: number;
  expenses: number;
  currency: string;
  period: string;
}

interface FinancialSummary {
  provider: string;
  connectedAccount: string;
  lastSync: string;
  cashFlow: CashFlowData | null;
  invoices: Invoice[];
  recentTransactions: Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
  }>;
  metrics: {
    totalReceivable: number;
    totalPayable: number;
    overdueCount: number;
    upcomingPayments: number;
  };
}

const logStep = (step: string, details?: Record<string, unknown>) => {
  // Never log token values
  const safeDetails = details ? { ...details } : undefined;
  if (safeDetails) {
    delete safeDetails.access_token;
    delete safeDetails.refresh_token;
  }
  console.log(`[FINANCIAL-FETCH] ${step}`, safeDetails ? JSON.stringify(safeDetails) : '');
};

// Refresh QuickBooks token
async function refreshQuickBooksToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const response = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    logStep("QuickBooks token refresh failed", { status: response.status });
    throw new Error("Failed to refresh QuickBooks token");
  }

  const tokens = await response.json();
  return tokens.access_token;
}

// Fetch QuickBooks data
async function fetchQuickBooksData(accessToken: string, realmId: string): Promise<Partial<FinancialSummary>> {
  const baseUrl = `https://quickbooks.api.intuit.com/v3/company/${realmId}`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
  };

  const invoices: Invoice[] = [];
  const recentTransactions: FinancialSummary['recentTransactions'] = [];

  try {
    // Fetch invoices
    const invoiceResponse = await fetch(
      `${baseUrl}/query?query=SELECT * FROM Invoice ORDERBY DueDate DESC MAXRESULTS 20`,
      { headers }
    );

    if (invoiceResponse.ok) {
      const invoiceData = await invoiceResponse.json();
      const qbInvoices = invoiceData.QueryResponse?.Invoice || [];
      
      for (const inv of qbInvoices) {
        const dueDate = new Date(inv.DueDate);
        const isPaid = inv.Balance === 0;
        const isOverdue = !isPaid && dueDate < new Date();
        
        invoices.push({
          id: inv.Id,
          number: inv.DocNumber || inv.Id,
          customerName: inv.CustomerRef?.name || 'Unknown',
          amount: inv.TotalAmt || 0,
          currency: inv.CurrencyRef?.value || 'USD',
          status: isPaid ? 'paid' : isOverdue ? 'overdue' : 'unpaid',
          dueDate: inv.DueDate,
          createdDate: inv.TxnDate,
        });
      }
    }

    // Fetch company info for account balance
    const companyResponse = await fetch(`${baseUrl}/companyinfo/${realmId}`, { headers });
    let companyName = 'QuickBooks';
    
    if (companyResponse.ok) {
      const companyData = await companyResponse.json();
      companyName = companyData.CompanyInfo?.CompanyName || 'QuickBooks';
    }

    // Fetch recent purchases/expenses
    const purchaseResponse = await fetch(
      `${baseUrl}/query?query=SELECT * FROM Purchase ORDERBY TxnDate DESC MAXRESULTS 10`,
      { headers }
    );

    if (purchaseResponse.ok) {
      const purchaseData = await purchaseResponse.json();
      const purchases = purchaseData.QueryResponse?.Purchase || [];
      
      for (const p of purchases) {
        recentTransactions.push({
          id: p.Id,
          date: p.TxnDate,
          description: p.PrivateNote || p.Line?.[0]?.Description || 'Purchase',
          amount: p.TotalAmt || 0,
          type: 'expense',
        });
      }
    }

    // Calculate metrics
    const totalReceivable = invoices
      .filter(i => i.status !== 'paid')
      .reduce((sum, i) => sum + i.amount, 0);
    
    const overdueCount = invoices.filter(i => i.status === 'overdue').length;
    const upcomingPayments = invoices.filter(i => {
      const due = new Date(i.dueDate);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return i.status !== 'paid' && due <= nextWeek;
    }).length;

    return {
      provider: 'QuickBooks',
      connectedAccount: companyName,
      invoices,
      recentTransactions,
      cashFlow: null, // Would need more API calls for detailed cash flow
      metrics: {
        totalReceivable,
        totalPayable: 0, // Would need to fetch bills
        overdueCount,
        upcomingPayments,
      },
    };
  } catch (error) {
    logStep("QuickBooks data fetch error", { error: String(error) });
    throw error;
  }
}

// Fetch ALL Stripe data for platform owner (full access)
async function fetchStripeDataForOwner(stripeSecretKey: string): Promise<Partial<FinancialSummary>> {
  const headers = {
    Authorization: `Bearer ${stripeSecretKey}`,
  };

  const invoices: Invoice[] = [];
  const recentTransactions: FinancialSummary['recentTransactions'] = [];

  try {
    // Fetch balance
    const balanceResponse = await fetch("https://api.stripe.com/v1/balance", { headers });
    let balance = 0;
    let currency = 'usd';
    
    if (balanceResponse.ok) {
      const balanceData = await balanceResponse.json();
      balance = (balanceData.available?.[0]?.amount || 0) / 100;
      currency = balanceData.available?.[0]?.currency || 'usd';
    }

    // Fetch recent invoices (ALL platform invoices)
    const invoiceResponse = await fetch(
      "https://api.stripe.com/v1/invoices?limit=50",
      { headers }
    );

    if (invoiceResponse.ok) {
      const invoiceData = await invoiceResponse.json();
      
      for (const inv of invoiceData.data || []) {
        const dueDate = inv.due_date ? new Date(inv.due_date * 1000).toISOString() : null;
        const isOverdue = inv.status === 'open' && dueDate && new Date(dueDate) < new Date();
        
        invoices.push({
          id: inv.id,
          number: inv.number || inv.id,
          customerName: inv.customer_name || inv.customer_email || 'Customer',
          amount: (inv.total || 0) / 100,
          currency: inv.currency || 'usd',
          status: inv.status === 'paid' ? 'paid' : isOverdue ? 'overdue' : inv.status === 'draft' ? 'draft' : 'unpaid',
          dueDate: dueDate || new Date().toISOString(),
          createdDate: new Date(inv.created * 1000).toISOString(),
        });
      }
    }

    // Fetch recent charges (ALL platform charges)
    const chargeResponse = await fetch(
      "https://api.stripe.com/v1/charges?limit=20",
      { headers }
    );

    if (chargeResponse.ok) {
      const chargeData = await chargeResponse.json();
      
      for (const charge of chargeData.data || []) {
        if (charge.status === 'succeeded') {
          recentTransactions.push({
            id: charge.id,
            date: new Date(charge.created * 1000).toISOString(),
            description: charge.description || 'Payment received',
            amount: (charge.amount || 0) / 100,
            type: 'income',
          });
        }
      }
    }

    // Get account info
    const accountResponse = await fetch("https://api.stripe.com/v1/account", { headers });
    let accountName = 'Platform Stripe';
    
    if (accountResponse.ok) {
      const accountData = await accountResponse.json();
      accountName = accountData.business_profile?.name || accountData.email || 'Platform Stripe';
    }

    // Calculate metrics
    const totalReceivable = invoices
      .filter(i => i.status !== 'paid' && i.status !== 'draft')
      .reduce((sum, i) => sum + i.amount, 0);
    
    const overdueCount = invoices.filter(i => i.status === 'overdue').length;

    return {
      provider: 'Stripe',
      connectedAccount: accountName,
      invoices,
      recentTransactions,
      cashFlow: {
        balance,
        income: recentTransactions.reduce((sum, t) => sum + t.amount, 0),
        expenses: 0,
        currency: currency.toUpperCase(),
        period: 'last 30 days',
      },
      metrics: {
        totalReceivable,
        totalPayable: 0,
        overdueCount,
        upcomingPayments: invoices.filter(i => i.status === 'unpaid').length,
      },
    };
  } catch (error) {
    logStep("Stripe owner data fetch error", { error: String(error) });
    throw error;
  }
}

// Fetch Stripe data for a specific customer (sub-user) - only their invoices/charges
async function fetchStripeDataForCustomer(stripeSecretKey: string, customerId: string): Promise<Partial<FinancialSummary>> {
  const headers = {
    Authorization: `Bearer ${stripeSecretKey}`,
  };

  const invoices: Invoice[] = [];
  const recentTransactions: FinancialSummary['recentTransactions'] = [];

  try {
    logStep("Fetching Stripe data for customer", { customerId });

    // Fetch invoices for this customer only
    const invoiceResponse = await fetch(
      `https://api.stripe.com/v1/invoices?customer=${customerId}&limit=20`,
      { headers }
    );

    if (invoiceResponse.ok) {
      const invoiceData = await invoiceResponse.json();
      
      for (const inv of invoiceData.data || []) {
        const dueDate = inv.due_date ? new Date(inv.due_date * 1000).toISOString() : null;
        const isOverdue = inv.status === 'open' && dueDate && new Date(dueDate) < new Date();
        
        invoices.push({
          id: inv.id,
          number: inv.number || inv.id,
          customerName: inv.customer_name || inv.customer_email || 'My Invoice',
          amount: (inv.total || 0) / 100,
          currency: inv.currency || 'usd',
          status: inv.status === 'paid' ? 'paid' : isOverdue ? 'overdue' : inv.status === 'draft' ? 'draft' : 'unpaid',
          dueDate: dueDate || new Date().toISOString(),
          createdDate: new Date(inv.created * 1000).toISOString(),
        });
      }
    }

    // Fetch charges for this customer only
    const chargeResponse = await fetch(
      `https://api.stripe.com/v1/charges?customer=${customerId}&limit=10`,
      { headers }
    );

    if (chargeResponse.ok) {
      const chargeData = await chargeResponse.json();
      
      for (const charge of chargeData.data || []) {
        if (charge.status === 'succeeded') {
          recentTransactions.push({
            id: charge.id,
            date: new Date(charge.created * 1000).toISOString(),
            description: charge.description || 'Payment',
            amount: (charge.amount || 0) / 100,
            type: 'expense', // From user's perspective, these are their payments (expenses)
          });
        }
      }
    }

    // Calculate metrics for user's invoices
    const totalReceivable = 0; // Users don't have receivables
    const totalPayable = invoices
      .filter(i => i.status !== 'paid' && i.status !== 'draft')
      .reduce((sum, i) => sum + i.amount, 0);
    
    const overdueCount = invoices.filter(i => i.status === 'overdue').length;

    return {
      provider: 'Stripe',
      connectedAccount: 'My Account',
      invoices,
      recentTransactions,
      cashFlow: null, // Users don't see platform cash flow
      metrics: {
        totalReceivable,
        totalPayable,
        overdueCount,
        upcomingPayments: invoices.filter(i => i.status === 'unpaid').length,
      },
    };
  } catch (error) {
    logStep("Stripe customer data fetch error", { error: String(error), customerId });
    throw error;
  }
}

// Fetch Stripe data using OAuth token (original function for OAuth integrations)
async function fetchStripeData(accessToken: string): Promise<Partial<FinancialSummary>> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  const invoices: Invoice[] = [];
  const recentTransactions: FinancialSummary['recentTransactions'] = [];

  try {
    // Fetch balance
    const balanceResponse = await fetch("https://api.stripe.com/v1/balance", { headers });
    let balance = 0;
    let currency = 'usd';
    
    if (balanceResponse.ok) {
      const balanceData = await balanceResponse.json();
      balance = (balanceData.available?.[0]?.amount || 0) / 100;
      currency = balanceData.available?.[0]?.currency || 'usd';
    }

    // Fetch recent invoices
    const invoiceResponse = await fetch(
      "https://api.stripe.com/v1/invoices?limit=20",
      { headers }
    );

    if (invoiceResponse.ok) {
      const invoiceData = await invoiceResponse.json();
      
      for (const inv of invoiceData.data || []) {
        const dueDate = inv.due_date ? new Date(inv.due_date * 1000).toISOString() : null;
        const isOverdue = inv.status === 'open' && dueDate && new Date(dueDate) < new Date();
        
        invoices.push({
          id: inv.id,
          number: inv.number || inv.id,
          customerName: inv.customer_name || inv.customer_email || 'Customer',
          amount: (inv.total || 0) / 100,
          currency: inv.currency || 'usd',
          status: inv.status === 'paid' ? 'paid' : isOverdue ? 'overdue' : inv.status === 'draft' ? 'draft' : 'unpaid',
          dueDate: dueDate || new Date().toISOString(),
          createdDate: new Date(inv.created * 1000).toISOString(),
        });
      }
    }

    // Fetch recent charges
    const chargeResponse = await fetch(
      "https://api.stripe.com/v1/charges?limit=10",
      { headers }
    );

    if (chargeResponse.ok) {
      const chargeData = await chargeResponse.json();
      
      for (const charge of chargeData.data || []) {
        if (charge.status === 'succeeded') {
          recentTransactions.push({
            id: charge.id,
            date: new Date(charge.created * 1000).toISOString(),
            description: charge.description || 'Payment received',
            amount: (charge.amount || 0) / 100,
            type: 'income',
          });
        }
      }
    }

    // Get account info
    const accountResponse = await fetch("https://api.stripe.com/v1/account", { headers });
    let accountName = 'Stripe';
    
    if (accountResponse.ok) {
      const accountData = await accountResponse.json();
      accountName = accountData.business_profile?.name || accountData.email || 'Stripe';
    }

    // Calculate metrics
    const totalReceivable = invoices
      .filter(i => i.status !== 'paid' && i.status !== 'draft')
      .reduce((sum, i) => sum + i.amount, 0);
    
    const overdueCount = invoices.filter(i => i.status === 'overdue').length;

    return {
      provider: 'Stripe',
      connectedAccount: accountName,
      invoices,
      recentTransactions,
      cashFlow: {
        balance,
        income: recentTransactions.reduce((sum, t) => sum + t.amount, 0),
        expenses: 0,
        currency: currency.toUpperCase(),
        period: 'last 30 days',
      },
      metrics: {
        totalReceivable,
        totalPayable: 0,
        overdueCount,
        upcomingPayments: invoices.filter(i => i.status === 'unpaid').length,
      },
    };
  } catch (error) {
    logStep("Stripe data fetch error", { error: String(error) });
    throw error;
  }
}

// Fetch Xero data
async function fetchXeroData(accessToken: string, tenantId: string): Promise<Partial<FinancialSummary>> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Xero-tenant-id": tenantId,
    Accept: "application/json",
  };

  const invoices: Invoice[] = [];

  try {
    // Fetch invoices
    const invoiceResponse = await fetch(
      "https://api.xero.com/api.xro/2.0/Invoices?order=DueDateString DESC&pageSize=20",
      { headers }
    );

    if (invoiceResponse.ok) {
      const invoiceData = await invoiceResponse.json();
      
      for (const inv of invoiceData.Invoices || []) {
        const dueDate = new Date(inv.DueDateString);
        const isPaid = inv.Status === 'PAID';
        const isOverdue = !isPaid && dueDate < new Date();
        
        invoices.push({
          id: inv.InvoiceID,
          number: inv.InvoiceNumber,
          customerName: inv.Contact?.Name || 'Unknown',
          amount: inv.Total || 0,
          currency: inv.CurrencyCode || 'USD',
          status: isPaid ? 'paid' : isOverdue ? 'overdue' : 'unpaid',
          dueDate: inv.DueDateString,
          createdDate: inv.DateString,
        });
      }
    }

    // Get organization info
    const orgResponse = await fetch("https://api.xero.com/api.xro/2.0/Organisation", { headers });
    let orgName = 'Xero';
    
    if (orgResponse.ok) {
      const orgData = await orgResponse.json();
      orgName = orgData.Organisations?.[0]?.Name || 'Xero';
    }

    const totalReceivable = invoices
      .filter(i => i.status !== 'paid')
      .reduce((sum, i) => sum + i.amount, 0);
    
    const overdueCount = invoices.filter(i => i.status === 'overdue').length;

    return {
      provider: 'Xero',
      connectedAccount: orgName,
      invoices,
      recentTransactions: [],
      cashFlow: null,
      metrics: {
        totalReceivable,
        totalPayable: 0,
        overdueCount,
        upcomingPayments: invoices.filter(i => i.status === 'unpaid').length,
      },
    };
  } catch (error) {
    logStep("Xero data fetch error", { error: String(error) });
    throw error;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "");
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("User authenticated", { userId: user.id });

    // Check if user is platform owner
    const { data: userRole } = await serviceClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const isOwner = userRole?.role === 'owner';
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    logStep("User role check", { isOwner, hasStripeKey: !!stripeSecretKey });

    // Aggregate data from all connected financial providers
    const allData: FinancialSummary[] = [];

    // OWNER: Gets full platform Stripe data via secret key
    if (isOwner && stripeSecretKey) {
      try {
        logStep("Owner: Fetching full platform Stripe data");
        const stripeData = await fetchStripeDataForOwner(stripeSecretKey);
        if (stripeData) {
          allData.push({
            provider: 'Stripe',
            connectedAccount: stripeData.connectedAccount || 'Platform Stripe',
            lastSync: new Date().toISOString(),
            cashFlow: stripeData.cashFlow || null,
            invoices: stripeData.invoices || [],
            recentTransactions: stripeData.recentTransactions || [],
            metrics: stripeData.metrics || {
              totalReceivable: 0,
              totalPayable: 0,
              overdueCount: 0,
              upcomingPayments: 0,
            },
          });
          logStep("Owner: Stripe data fetched successfully", { 
            invoiceCount: stripeData.invoices?.length || 0,
            transactionCount: stripeData.recentTransactions?.length || 0 
          });
        }
      } catch (stripeError) {
        logStep("Owner: Error fetching Stripe data", { error: String(stripeError) });
      }
    }

    // OWNER: Gets QuickBooks data via pre-configured credentials (no OAuth needed)
    if (isOwner) {
      const qbClientId = Deno.env.get("QUICKBOOKS_CLIENT_ID");
      const qbClientSecret = Deno.env.get("QUICKBOOKS_CLIENT_SECRET");
      
      // Check if owner has a QuickBooks integration with realm_id stored
      const { data: ownerQBIntegration } = await serviceClient
        .from("integrations")
        .select("id, access_token, refresh_token, scopes")
        .eq("user_id", user.id)
        .eq("provider", "quickbooks")
        .single();
      
      if (ownerQBIntegration && qbClientId && qbClientSecret) {
        try {
          logStep("Owner: Fetching QuickBooks data via pre-configured credentials");
          const realmId = ownerQBIntegration.scopes?.split(',')?.[0] || '';
          
          if (realmId && ownerQBIntegration.refresh_token) {
            const refreshToken = await decryptToken(ownerQBIntegration.refresh_token);
            const accessToken = await refreshQuickBooksToken(refreshToken, qbClientId, qbClientSecret);
            
            // Store refreshed token
            const encryptedToken = await encryptToken(accessToken);
            await serviceClient
              .from("integrations")
              .update({ access_token: encryptedToken, last_synced_at: new Date().toISOString() })
              .eq("id", ownerQBIntegration.id);
            
            const qbData = await fetchQuickBooksData(accessToken, realmId);
            if (qbData) {
              allData.push({
                provider: 'QuickBooks',
                connectedAccount: qbData.connectedAccount || 'Platform QuickBooks',
                lastSync: new Date().toISOString(),
                cashFlow: qbData.cashFlow || null,
                invoices: qbData.invoices || [],
                recentTransactions: qbData.recentTransactions || [],
                metrics: qbData.metrics || {
                  totalReceivable: 0,
                  totalPayable: 0,
                  overdueCount: 0,
                  upcomingPayments: 0,
                },
              });
              logStep("Owner: QuickBooks data fetched successfully", { 
                invoiceCount: qbData.invoices?.length || 0 
              });
            }
          }
        } catch (qbError) {
          logStep("Owner: Error fetching QuickBooks data", { error: String(qbError) });
        }
      }
    }
    
    // SUB-USER: Gets only their own Stripe data (filtered by their customer ID)
    if (!isOwner && stripeSecretKey) {
      // Get user's stripe_customer_id from their profile or organization
      const { data: profile } = await serviceClient
        .from("profiles")
        .select("stripe_customer_id, organization_id")
        .eq("user_id", user.id)
        .single();

      let stripeCustomerId = profile?.stripe_customer_id;

      // If not on profile, check organization
      if (!stripeCustomerId && profile?.organization_id) {
        const { data: org } = await serviceClient
          .from("organizations")
          .select("stripe_customer_id")
          .eq("id", profile.organization_id)
          .single();
        stripeCustomerId = org?.stripe_customer_id;
      }

      if (stripeCustomerId) {
        try {
          logStep("Sub-user: Fetching their Stripe data", { customerId: stripeCustomerId });
          const stripeData = await fetchStripeDataForCustomer(stripeSecretKey, stripeCustomerId);
          if (stripeData) {
            allData.push({
              provider: 'Stripe',
              connectedAccount: stripeData.connectedAccount || 'My Account',
              lastSync: new Date().toISOString(),
              cashFlow: stripeData.cashFlow || null,
              invoices: stripeData.invoices || [],
              recentTransactions: stripeData.recentTransactions || [],
              metrics: stripeData.metrics || {
                totalReceivable: 0,
                totalPayable: 0,
                overdueCount: 0,
                upcomingPayments: 0,
              },
            });
            logStep("Sub-user: Stripe data fetched successfully", { 
              invoiceCount: stripeData.invoices?.length || 0,
              transactionCount: stripeData.recentTransactions?.length || 0 
            });
          }
        } catch (stripeError) {
          logStep("Sub-user: Error fetching Stripe data", { error: String(stripeError) });
        }
      } else {
        logStep("Sub-user: No stripe_customer_id found");
      }
    }

    // SUB-USER ONLY: Check for OAuth-based financial integrations (they must connect their own accounts)
    // Owner already handles QuickBooks above via pre-configured credentials
    if (!isOwner) {
      const { data: integrations, error: intError } = await serviceClient
        .from("integrations")
        .select("id, provider, access_token, refresh_token, connected_account, scopes")
        .eq("user_id", user.id)
        .in("provider", ["quickbooks", "stripe", "xero"]);

      if (intError) {
        logStep("Integration lookup error", { error: intError.message });
      }

      // Process OAuth integrations for sub-users
      for (const integration of integrations || []) {
        try {
          // Decrypt tokens
          const accessToken = integration.access_token ? await decryptToken(integration.access_token) : null;
          const refreshToken = integration.refresh_token ? await decryptToken(integration.refresh_token) : null;
          
          if (!accessToken) {
            logStep("No access token for integration", { provider: integration.provider });
            continue;
          }

          let data: Partial<FinancialSummary> | null = null;

          if (integration.provider === "stripe") {
            data = await fetchStripeData(accessToken);
          } else if (integration.provider === "quickbooks") {
            // QuickBooks requires realm_id from scopes - sub-users must OAuth connect
            const realmId = integration.scopes?.split(',')?.[0] || '';
            if (realmId) {
              // Try to refresh token if we have refresh token
              let currentAccessToken = accessToken;
              if (refreshToken) {
                try {
                  const clientId = Deno.env.get("QUICKBOOKS_CLIENT_ID") || "";
                  const clientSecret = Deno.env.get("QUICKBOOKS_CLIENT_SECRET") || "";
                  if (clientId && clientSecret) {
                    currentAccessToken = await refreshQuickBooksToken(refreshToken, clientId, clientSecret);
                    // Encrypt and store new token
                    const encryptedToken = await encryptToken(currentAccessToken);
                    await serviceClient
                      .from("integrations")
                      .update({ access_token: encryptedToken, last_synced_at: new Date().toISOString() })
                      .eq("id", integration.id);
                    logStep("QuickBooks token refreshed and encrypted");
                  }
                } catch (refreshError) {
                  logStep("QuickBooks token refresh failed", { error: String(refreshError) });
                }
              }
              data = await fetchQuickBooksData(currentAccessToken, realmId);
            }
          } else if (integration.provider === "xero") {
            // Xero requires tenant_id
            const tenantId = integration.scopes?.split(',')?.[0] || '';
            if (tenantId) {
              data = await fetchXeroData(accessToken, tenantId);
            }
          }

          if (data) {
            allData.push({
              provider: data.provider || integration.provider,
              connectedAccount: data.connectedAccount || integration.connected_account || integration.provider,
              lastSync: new Date().toISOString(),
              cashFlow: data.cashFlow || null,
              invoices: data.invoices || [],
              recentTransactions: data.recentTransactions || [],
              metrics: data.metrics || {
                totalReceivable: 0,
                totalPayable: 0,
                overdueCount: 0,
                upcomingPayments: 0,
              },
            });
          }
        } catch (providerError) {
          logStep(`Error fetching from ${integration.provider}`, { error: String(providerError) });
          // Continue with other providers
        }
      }
    }

    if (allData.length === 0) {
      // Different message for owner vs sub-user
      const message = isOwner
        ? "No financial data available. Make sure Stripe is configured correctly."
        : "No financial account connected. Your invoices and payments will appear here once you have activity.";
      
      return new Response(
        JSON.stringify({
          connected: false,
          message,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Financial data fetched", { providers: allData.map(d => d.provider), isOwner });

    return new Response(
      JSON.stringify({ connected: true, data: allData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
