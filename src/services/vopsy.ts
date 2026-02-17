// VOPSy Insight System - Tier-aware static insights for all pages

export interface UserContext {
  name: string;
  stage: 'foundations' | 'operating' | 'growing';
  tier: 'free' | 'assist' | 'ops' | 'human-led';
  industry: 'owner' | 'contractor' | 'nonprofit';
  integrations: string[];
}

export function getStaticInsight(page: string, userContext: UserContext): string {
  const { tier, integrations } = userContext;
  const hasAccounting = integrations.some(i => ['quickbooks', 'wave', 'xero', 'freshbooks'].includes(i));
  const hasGHL = integrations.includes('ghl');
  const hasGmail = integrations.includes('gmail');
  
  // TIER: FREE — educational, no data references
  if (tier === 'free') {
    const freeInsights: Record<string, string> = {
      reconciliation: "Track your income and expenses here. Categorizing transactions helps you understand where your money goes. Take the 'Setting Up Your Books' course to learn more.",
      pipeline: "Track your deals from first contact to closed. A pipeline helps you see what's coming and plan ahead.",
      inbox: "Log your important communications here. Keeping track of client conversations helps you follow up on time.",
      campaigns: "Track your marketing efforts here. Even simple tracking helps you see what's working.",
      people: "Keep your contacts organized here. Knowing who your clients, leads, and vendors are is the foundation of your business.",
      cashflow: "Track money coming in and going out. Cash flow is the heartbeat of your business.",
      tax: "Stay ahead of tax deadlines. I've pre-loaded the common deadlines for your business type.",
      reports: "Add transactions and I'll start building reports from your data.",
      followups: "Track who you need to reach out to. Consistent follow-up is what separates growing businesses from stagnant ones.",
      surveys: "Create a simple survey to find out how your clients feel about your service.",
      banking: "Track your account balances here. Connect your bank to see live balances.",
      audience: "Track where your leads and clients come from. Understanding your audience helps you market smarter.",
      documents: "Upload and track your proposals and contracts. Knowing what's signed and what's pending keeps deals moving.",
      workflows: "Set up simple rules to remind yourself of important tasks and deadlines.",
      calendar: "Keep your schedule organized. Add events, deadlines, and reminders.",
      tasks: "Track your to-dos here. I'll add suggestions based on what your business needs.",
      vault: "Store your important business documents. Tax files, contracts, licenses — keep everything in one place.",
      contractors: "Track your team members and contractors here. Knowing who does what keeps projects moving.",
      payroll: "Track payroll and payments to your team. Staying organized helps you stay compliant.",
      integrations: "Connect your business tools here. The more you connect, the smarter I get.",
      funding: "Track your funding readiness. This page helps you prepare for investment or loans.",
      grants: "Track grant applications and donations. Stay organized and never miss a deadline.",
    };
    return freeInsights[page] || "Track your business activity here. Take an Academy course to learn how to get the most out of this page.";
  }
  
  // TIER: ASSIST — data-aware, tells user what to do
  if (tier === 'assist') {
    if (!hasAccounting && ['reconciliation', 'cashflow', 'reports', 'tax', 'banking'].includes(page)) {
      return "Connect your accounting software to see your financial data here automatically. I'll analyze it and tell you what needs attention. Until then, you can add transactions manually.";
    }
    if (!hasGHL && ['people', 'pipeline', 'campaigns', 'audience', 'followups'].includes(page)) {
      return "Connect GoHighLevel to sync your contacts and campaigns automatically. I'll flag what needs your attention. Until then, track things manually here.";
    }
    if (!hasGmail && page === 'inbox') {
      return "Connect Gmail and I'll categorize your messages and suggest replies. Until then, log important communications manually.";
    }
    
    const assistInsights: Record<string, string> = {
      reconciliation: "I've reviewed your recent transactions and suggested categories for the ones that need attention. Review my suggestions and approve or edit.",
      pipeline: "Your pipeline is active. I've flagged deals that have been sitting too long — check the ones with orange borders.",
      inbox: "I've categorized your recent emails. Check the Action Needed tab for messages that need your response.",
      campaigns: "Here's how your campaigns performed since your last visit. I've highlighted what's working and what might need adjusting.",
      people: "Your contact list is current. I've flagged clients who haven't heard from you recently.",
      cashflow: "Your cash flow this month is on track. Here's the 30-day outlook based on your current pace.",
      tax: "Your next deadline is approaching. All required documents are accounted for — here's your checklist.",
      reports: "Your monthly reports are ready. I've flagged the most important trends for you to review.",
      followups: "You have follow-ups due. I've prioritized them by how important each relationship is to your revenue.",
      surveys: "Your latest survey results are in. Overall satisfaction is holding steady.",
      banking: "Your connected accounts are synced. Here's your current cash position across all accounts.",
      audience: "Your audience is growing. Here's which channels are driving the most leads.",
      documents: "You have proposals and contracts in progress. I've flagged any that need your attention.",
      workflows: "Your automations are running smoothly. Here's a summary of what triggered this week.",
      calendar: "Here's your upcoming schedule. I've added reminders for deadlines from your Tax Organizer.",
      tasks: "You have tasks due. I've added a few suggestions based on what I see in your data.",
      vault: "Your documents are organized. I've automatically filed recent uploads into the right folders.",
      contractors: "Your team roster is up to date. I've flagged any missing documents or expiring contracts.",
      payroll: "Your payroll is current. Next run is scheduled for [date].",
      integrations: "Your connected tools are syncing properly. Here's what's active.",
      funding: "Your funding readiness score is [X]. Here's what to improve to increase it.",
      grants: "You have [X] active grant applications. Here's the status of each.",
    };
    return assistInsights[page] || "Your data is up to date. I'll flag anything that needs your attention.";
  }
  
  // TIER: OPS — VOPSy acted overnight, owner reviews
  if (tier === 'ops') {
    const opsInsights: Record<string, string> = {
      reconciliation: "I categorized 8 transactions overnight. 4 need your review — the rest matched your usual patterns and are auto-approved.",
      pipeline: "I updated your pipeline from GHL overnight. 2 new leads came in, and I've flagged 1 deal that's gone stale.",
      inbox: "I processed 12 emails overnight. 3 need your response — I've drafted replies for each. Review and approve.",
      campaigns: "Your campaigns ran overnight. The contractor outreach sequence sent 15 emails — 4 were opened. Here's the breakdown.",
      people: "I synced your contacts from GHL. 3 new leads were added, and I've flagged 2 existing clients for follow-up.",
      cashflow: "I ran your cash flow projection overnight. You're on track, but one large invoice is 15 days overdue.",
      tax: "I checked your tax calendar. Your Q1 estimated payment is due in 12 days. Based on your revenue, I estimate $2,400.",
      reports: "I generated your weekly reports overnight. Revenue is up 8% — I've highlighted the key drivers.",
      followups: "I built your follow-up queue overnight from all your connected tools. 4 contacts need your attention today.",
      surveys: "I analyzed your latest survey responses. One client gave a low score — I'd recommend reaching out.",
      banking: "I synced your bank accounts overnight. Your checking balance is healthy. No unusual transactions flagged.",
      audience: "I analyzed your audience data overnight. LinkedIn engagement is up 15% — your last post performed well.",
      documents: "I checked your proposals overnight. One has been viewed but not signed for 7 days — follow up recommended.",
      workflows: "Your automations processed overnight. Welcome sequence triggered 5 times. All ran successfully.",
      calendar: "I updated your calendar with new deadlines and follow-up reminders based on overnight processing.",
      tasks: "I've added 3 new tasks based on overnight processing. Review them alongside your personal to-dos.",
      vault: "New documents were auto-filed overnight. Your tax folder has been updated with the latest receipts.",
      contractors: "I reviewed your team roster overnight. One contractor's W-9 expires next month — I've flagged it.",
      payroll: "I calculated your next payroll run overnight. Total: $X,XXX. Review and approve.",
      integrations: "All integrations synced overnight. No errors detected.",
      funding: "I updated your funding readiness score overnight. It's now [X] — up 5 points from last week.",
      grants: "I checked your grant deadlines overnight. One application is due in 10 days — I've flagged the missing documents.",
    };
    return opsInsights[page] || "I processed your data overnight. Everything looks good — I'll flag anything that needs you.";
  }
  
  // TIER: HUMAN-LED — Tania did the work, owner reviews
  if (tier === 'human-led') {
    const humanLedInsights: Record<string, string> = {
      reconciliation: "Tania reconciled your latest transactions. Review her categorizations and approve.",
      pipeline: "Tania updated your pipeline and followed up on 2 stale deals. Here's what happened.",
      inbox: "Tania responded to 5 emails on your behalf. Review the conversations and flag anything you want to handle personally.",
      campaigns: "Tania adjusted your campaign targeting based on last week's performance. Here are the results.",
      people: "Tania cleaned up your contact list and tagged 3 new leads for outreach. Review the changes.",
      cashflow: "Tania prepared your cash flow report for this month. Review the projections.",
      tax: "Tania organized your tax documents and confirmed your next deadline. Everything is on track.",
      reports: "Tania generated your monthly reports. She's flagged two areas she wants to discuss with you.",
      followups: "Tania completed 3 follow-ups on your behalf today. She recommends you personally call Riverside Properties.",
      surveys: "Tania reviewed your survey results and drafted a response plan for the low scores.",
      banking: "Tania reviewed your bank accounts and flagged one unusual charge for your review.",
      audience: "Tania analyzed your audience growth this month and has recommendations for next month's focus.",
      documents: "Tania sent 2 proposals this week. One is signed, one is pending. Here's the status.",
      workflows: "Tania reviewed your automations and optimized the welcome sequence. Here's what changed.",
      calendar: "Tania updated your calendar with this week's priorities and client meetings.",
      tasks: "Tania added 5 tasks based on what she saw in your business this week. Review and prioritize.",
      vault: "Tania organized your vault and filed all recent documents. Everything is up to date.",
      contractors: "Tania reviewed your team roster and reached out to one contractor about a missing document.",
      payroll: "Tania prepared your payroll for this period. Review the amounts and approve.",
      integrations: "Tania checked all your integrations. Everything is syncing properly.",
      funding: "Tania updated your funding readiness materials. Your score improved — she wants to discuss next steps.",
      grants: "Tania submitted one grant application on your behalf. Here's the confirmation.",
    };
    return humanLedInsights[page] || "Tania has been working on your behalf. Review what was done and approve.";
  }
  
  return "Welcome. Let's get your business organized.";
}
