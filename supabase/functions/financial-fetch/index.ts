import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { decryptToken, encryptToken, isEncrypted } from "../_shared/token-encryption.ts";

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
    delete safeDetails.client_secret;
  }
  console.log(`[FINANCIAL-FETCH] ${step}`, safeDetails ? JSON.stringify(safeDetails) : '');
};

// Get QuickBooks OAuth credentials from integration_configs (NEVER from env)
async function getQuickBooksCredentials(supabaseClient: any): Promise<{ clientId: string; clientSecret: string } | null> {
  const { data: config } = await supabaseClient
    .from("integration_configs")
    .select("client_id, client_secret")
    .eq("provider", "quickbooks")
    .maybeSingle();

  if (!config?.client_id || !config?.client_secret) {
    logStep("QuickBooks OAuth credentials not configured in integration_configs");
    return null;
  }

  // Resolve credentials (may be encrypted or use env: prefix)
  let clientId = config.client_id as string;
  let clientSecret = config.client_secret as string;

  // Handle env: prefix
  if (clientId.startsWith("env:")) {
    clientId = Deno.env.get(clientId.replace("env:", "")) || "";
  } else if (isEncrypted(clientId)) {
    clientId = await decryptToken(clientId);
  }

  if (clientSecret.startsWith("env:")) {
    clientSecret = Deno.env.get(clientSecret.replace("env:", "")) || "";
  } else if (isEncrypted(clientSecret)) {
    clientSecret = await decryptToken(clientSecret);
  }

  if (!clientId || !clientSecret) {
    logStep("QuickBooks credentials could not be resolved");
    return null;
  }

  return { clientId, clientSecret };
}

// Refresh QuickBooks token using OAuth credentials from integration_configs
async function refreshQuickBooksToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<{ accessToken: string; refreshToken?: string }> {
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
    const errorText = await response.text();
    logStep("QuickBooks token refresh failed", { status: response.status, error: errorText });
    throw new Error("Failed to refresh QuickBooks token - user may need to re-authenticate");
  }

  const tokens = await response.json();
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token, // QuickBooks may rotate refresh tokens
  };
}

// Fetch QuickBooks data using user's OAuth tokens
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

    // Fetch company info for account name
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
      cashFlow: null,
      metrics: {
        totalReceivable,
        totalPayable: 0,
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
            type: 'expense',
          });
        }
      }
    }

    // Calculate metrics for user's invoices
    const totalReceivable = 0;
    const totalPayable = invoices
      .filter(i => i.status !== 'paid' && i.status !== 'draft')
      .reduce((sum, i) => sum + i.amount, 0);
    
    const overdueCount = invoices.filter(i => i.status === 'overdue').length;

    return {
      provider: 'Stripe',
      connectedAccount: 'My Account',
      invoices,
      recentTransactions,
      cashFlow: null,
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

// Fetch Stripe data using OAuth token
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
  const recentTransactions: FinancialSummary['recentTransactions'] = [];

  try {
    // Fetch invoices
    const invoiceResponse = await fetch(
      "https://api.xero.com/api.xro/2.0/Invoices?order=DueDate DESC&page=1",
      { headers }
    );

    if (invoiceResponse.ok) {
      const invoiceData = await invoiceResponse.json();
      const xeroInvoices = invoiceData.Invoices || [];
      
      for (const inv of xeroInvoices.slice(0, 20)) {
        const isPaid = inv.Status === 'PAID';
        const isOverdue = !isPaid && new Date(inv.DueDateString) < new Date();
        
        invoices.push({
          id: inv.InvoiceID,
          number: inv.InvoiceNumber || inv.InvoiceID,
          customerName: inv.Contact?.Name || 'Unknown',
          amount: inv.Total || 0,
          currency: inv.CurrencyCode || 'USD',
          status: isPaid ? 'paid' : isOverdue ? 'overdue' : 'unpaid',
          dueDate: inv.DueDateString,
          createdDate: inv.DateString,
        });
      }
    }

    // Fetch organization info
    const orgResponse = await fetch(
      "https://api.xero.com/api.xro/2.0/Organisation",
      { headers }
    );

    let orgName = 'Xero';
    if (orgResponse.ok) {
      const orgData = await orgResponse.json();
      orgName = orgData.Organisations?.[0]?.Name || 'Xero';
    }

    // Calculate metrics
    const totalReceivable = invoices
      .filter(i => i.status !== 'paid')
      .reduce((sum, i) => sum + i.amount, 0);
    
    const overdueCount = invoices.filter(i => i.status === 'overdue').length;

    return {
      provider: 'Xero',
      connectedAccount: orgName,
      invoices,
      recentTransactions,
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
    if (!authHeader) throw new Error("No authorization header provided");

    const anonClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    
    if (authError || !user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    // Check if user is platform owner (for Stripe only - NOT for QuickBooks)
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

    // ALL USERS: Check for OAuth-based financial integrations
    // QuickBooks is STRICTLY OAuth-only - every user must authenticate their own account
    const { data: integrations, error: intError } = await serviceClient
      .from("integrations")
      .select("id, provider, access_token, refresh_token, connected_account, scopes")
      .eq("user_id", user.id)
      .in("provider", ["quickbooks", "stripe", "xero"]);

    if (intError) {
      logStep("Integration lookup error", { error: intError.message });
    }

    // Get QuickBooks OAuth credentials from integration_configs (not env vars)
    const qbCredentials = await getQuickBooksCredentials(serviceClient);

    // Process OAuth integrations for ALL users (no owner/sub-user distinction for QuickBooks)
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
          // Skip if we already fetched Stripe data via owner/customer path
          const alreadyHasStripe = allData.some(d => d.provider === 'Stripe');
          if (!alreadyHasStripe) {
            data = await fetchStripeData(accessToken);
          }
        } else if (integration.provider === "quickbooks") {
          // QuickBooks is STRICTLY OAuth-only
          // Require realm_id from OAuth scopes
          const realmId = integration.scopes?.split(',')?.[0] || '';
          
          if (!realmId) {
            logStep("QuickBooks missing realm_id - user needs to re-authenticate", { 
              integrationId: integration.id 
            });
            continue;
          }

          // Attempt to refresh token if we have credentials configured
          let currentAccessToken = accessToken;
          
          if (refreshToken && qbCredentials) {
            try {
              const refreshResult = await refreshQuickBooksToken(
                refreshToken, 
                qbCredentials.clientId, 
                qbCredentials.clientSecret
              );
              
              currentAccessToken = refreshResult.accessToken;
              
              // Encrypt and store new tokens
              const encryptedAccessToken = await encryptToken(refreshResult.accessToken);
              const updateData: Record<string, string> = {
                access_token: encryptedAccessToken,
                last_synced_at: new Date().toISOString(),
              };
              
              // Update refresh token if rotated
              if (refreshResult.refreshToken) {
                updateData.refresh_token = await encryptToken(refreshResult.refreshToken);
              }
              
              await serviceClient
                .from("integrations")
                .update(updateData)
                .eq("id", integration.id);
              
              logStep("QuickBooks token refreshed successfully");
            } catch (refreshError) {
              logStep("QuickBooks token refresh failed - user may need to re-authenticate", { 
                error: String(refreshError) 
              });
              // Continue with existing access token - it might still work
            }
          } else if (refreshToken && !qbCredentials) {
            logStep("QuickBooks credentials not configured - cannot refresh token");
          }
          
          data = await fetchQuickBooksData(currentAccessToken, realmId);
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

    if (allData.length === 0) {
      return new Response(
        JSON.stringify({
          connected: false,
          message: "No financial accounts connected. Connect QuickBooks, Stripe, or Xero to see your financial data.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logStep("Financial data fetched", { providers: allData.map(d => d.provider) });

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
