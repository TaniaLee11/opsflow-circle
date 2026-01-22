/**
 * Financial Fetch - OAuth-Only Architecture
 * 
 * SECURITY MANDATE: This function ONLY accesses third-party financial data via user-authenticated OAuth.
 * 
 * NON-NEGOTIABLE RULES:
 * 1. NO system keys (STRIPE_SECRET_KEY, QUICKBOOKS_CLIENT_SECRET) for reading/analyzing user data
 * 2. Every user must complete OAuth to connect their own financial accounts
 * 3. integration_configs = OAuth app registration ONLY (for token exchange)
 * 4. integrations = User connections ONLY (access_token, refresh_token per user)
 * 5. If no user OAuth tokens exist → return OAUTH_REQUIRED, never fall back to secrets
 * 
 * STRIPE SEPARATION:
 * - Platform billing (check-subscription, stripe-webhook) uses STRIPE_SECRET_KEY → OK
 * - User financial data (this function) uses Stripe Connect OAuth tokens → REQUIRED
 * - These MUST NOT overlap
 */

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
  // Error state fields for handling re-auth requirements
  error?: string;
  errorMessage?: string;
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

/**
 * Get OAuth credentials from integration_configs ONLY
 * NEVER falls back to environment variables for user data access
 */
async function getOAuthCredentials(
  supabaseClient: any, 
  provider: string
): Promise<{ clientId: string; clientSecret: string } | null> {
  const { data: config } = await supabaseClient
    .from("integration_configs")
    .select("client_id, client_secret")
    .eq("provider", provider)
    .maybeSingle();

  if (!config?.client_id || !config?.client_secret) {
    logStep(`${provider} OAuth credentials not configured in integration_configs`);
    return null;
  }

  let clientId = config.client_id as string;
  let clientSecret = config.client_secret as string;

  // Resolve credentials - ONLY from integration_configs or encrypted values
  // env: prefix is allowed since it points to where the secret is stored for this app instance
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
    logStep(`${provider} credentials could not be resolved`);
    return null;
  }

  return { clientId, clientSecret };
}

/**
 * Refresh QuickBooks token using user's OAuth credentials
 */
interface TokenRefreshResult {
  accessToken: string;
  refreshToken?: string;
  requiresReauth?: boolean;
  error?: string;
}

async function refreshQuickBooksToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<TokenRefreshResult> {
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
    
    // Parse error to detect invalid_grant (requires re-authentication)
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error === "invalid_grant") {
        return {
          accessToken: "",
          requiresReauth: true,
          error: "QuickBooks authorization has expired. Please reconnect your account.",
        };
      }
    } catch {
      // Not JSON, continue with generic error
    }
    
    return {
      accessToken: "",
      requiresReauth: true,
      error: "Failed to refresh QuickBooks token. Please reconnect your account.",
    };
  }

  const tokens = await response.json();
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  };
}

/**
 * Fetch QuickBooks data using user's OAuth tokens ONLY
 */
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
    const invoiceQuery = encodeURIComponent("SELECT * FROM Invoice ORDERBY DueDate DESC MAXRESULTS 20");
    const invoiceResponse = await fetch(
      `${baseUrl}/query?query=${invoiceQuery}`,
      { headers }
    );

    logStep("QuickBooks invoice query", { 
      status: invoiceResponse.status, 
      ok: invoiceResponse.ok,
      realmId 
    });

    if (invoiceResponse.ok) {
      const invoiceData = await invoiceResponse.json();
      const qbInvoices = invoiceData.QueryResponse?.Invoice || [];
      
      logStep("QuickBooks invoices received", { 
        count: qbInvoices.length,
        hasQueryResponse: !!invoiceData.QueryResponse
      });
      
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
    } else {
      const errorText = await invoiceResponse.text();
      logStep("QuickBooks invoice query failed", { 
        status: invoiceResponse.status, 
        error: errorText.substring(0, 500)
      });
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

/**
 * Fetch Stripe data using user's OAuth token ONLY
 * NO system key access for user financial data
 */
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

/**
 * Fetch Xero data using user's OAuth token ONLY
 */
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
    logStep("Function started - OAuth-only mode");

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

    // Aggregate data from all connected financial providers
    // ALL users access their own OAuth-authenticated accounts ONLY
    const allData: FinancialSummary[] = [];

    // Check for OAuth-based financial integrations
    // Every provider requires user OAuth - no system key access
    const { data: integrations, error: intError } = await serviceClient
      .from("integrations")
      .select("id, provider, access_token, refresh_token, connected_account, scopes")
      .eq("user_id", user.id)
      .in("provider", ["quickbooks", "stripe", "xero"]);

    if (intError) {
      logStep("Integration lookup error", { error: intError.message });
    }

    logStep("Found integrations", { 
      count: integrations?.length || 0,
      providers: integrations?.map(i => i.provider) || []
    });

    // Process OAuth integrations for the authenticated user
    for (const integration of integrations || []) {
      try {
        // Decrypt tokens
        const accessToken = integration.access_token ? await decryptToken(integration.access_token) : null;
        const refreshToken = integration.refresh_token ? await decryptToken(integration.refresh_token) : null;
        
        if (!accessToken) {
          logStep("No access token for integration - user needs to re-authenticate", { 
            provider: integration.provider 
          });
          continue;
        }

        let data: Partial<FinancialSummary> | null = null;

        if (integration.provider === "stripe") {
          // Stripe OAuth - user's own Stripe account
          data = await fetchStripeData(accessToken);
          
        } else if (integration.provider === "quickbooks") {
          // QuickBooks OAuth - user's own QBO account
          const realmId = integration.scopes?.split(',')?.[0] || '';
          
          if (!realmId) {
            logStep("QuickBooks missing realm_id - user needs to re-authenticate", { 
              integrationId: integration.id 
            });
            // Mark as needing re-auth
            await serviceClient
              .from("integrations")
              .update({ health: "reauth_required" })
              .eq("id", integration.id);
            continue;
          }

          // Get OAuth credentials for token refresh
          const qbCredentials = await getOAuthCredentials(serviceClient, "quickbooks");
          let currentAccessToken = accessToken;
          let needsReauth = false;
          
          // QuickBooks access tokens expire in 1 hour - ALWAYS try to refresh first
          if (refreshToken && qbCredentials) {
            const refreshResult = await refreshQuickBooksToken(
              refreshToken, 
              qbCredentials.clientId, 
              qbCredentials.clientSecret
            );
            
            if (refreshResult.requiresReauth) {
              logStep("QuickBooks requires re-authentication", { 
                error: refreshResult.error 
              });
              
              // Mark integration as needing re-auth
              await serviceClient
                .from("integrations")
                .update({ 
                  health: "reauth_required",
                  last_synced_at: new Date().toISOString(),
                })
                .eq("id", integration.id);
              
              needsReauth = true;
            } else if (refreshResult.accessToken) {
              currentAccessToken = refreshResult.accessToken;
              
              // Encrypt and store new tokens
              const encryptedAccessToken = await encryptToken(refreshResult.accessToken);
              const updateData: Record<string, string> = {
                access_token: encryptedAccessToken,
                health: "ok",
                last_synced_at: new Date().toISOString(),
              };
              
              // CRITICAL: QuickBooks issues new refresh tokens with each refresh
              // We MUST store the new refresh token or subsequent refreshes will fail
              if (refreshResult.refreshToken) {
                updateData.refresh_token = await encryptToken(refreshResult.refreshToken);
                logStep("QuickBooks new refresh token stored");
              }
              
              await serviceClient
                .from("integrations")
                .update(updateData)
                .eq("id", integration.id);
              
              logStep("QuickBooks token refreshed successfully");
            }
          }
          
          if (needsReauth) {
            // Add a placeholder entry so UI knows reconnection is needed
            allData.push({
              provider: 'QuickBooks',
              connectedAccount: integration.connected_account || 'QuickBooks',
              lastSync: new Date().toISOString(),
              cashFlow: null,
              invoices: [],
              recentTransactions: [],
              metrics: {
                totalReceivable: 0,
                totalPayable: 0,
                overdueCount: 0,
                upcomingPayments: 0,
              },
              // @ts-ignore - adding custom field for error state
              error: "REAUTH_REQUIRED",
              errorMessage: "QuickBooks authorization expired. Please reconnect.",
            });
            continue;
          }
          
          data = await fetchQuickBooksData(currentAccessToken, realmId);
          
        } else if (integration.provider === "xero") {
          // Xero OAuth - user's own Xero account
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
      // SECURITY: Return OAUTH_REQUIRED - no fallback to system keys
      logStep("No OAuth connections found - OAUTH_REQUIRED");
      return new Response(
        JSON.stringify({
          connected: false,
          error: "OAUTH_REQUIRED",
          message: "No financial accounts connected. Connect QuickBooks, Stripe, or Xero via OAuth to see your financial data.",
          action: "Connect a financial account using the Integrations page.",
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
