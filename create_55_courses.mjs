// Create 55 practical courses with real software and tools focus
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://rugazxkuyjgondgojkmo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1Z2F6eGt1eWpnb25kZ29qa21vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDA4MDQ2NCwiZXhwIjoyMDg1NjU2NDY0fQ.xL06OOdZbntYIA_Sp2csJeDVFlEg8j8a5l3_Z2v6S1w'
);

const OWNER_ID = 'e3d8f4d1-8f63-4d0e-8863-297f32da04c7';

const courses = [
  // Accounting Software (10 courses)
  { title: 'QuickBooks Online Basics', description: 'Learn to set up and use QuickBooks Online for small business accounting', tier_access: 'ai_free' },
  { title: 'QuickBooks: Chart of Accounts Setup', description: 'Master the chart of accounts structure for accurate bookkeeping', tier_access: 'ai_assistant' },
  { title: 'QuickBooks: Invoicing & Payments', description: 'Create professional invoices and track customer payments', tier_access: 'ai_assistant' },
  { title: 'QuickBooks: Bank Reconciliation', description: 'Match transactions and reconcile bank accounts monthly', tier_access: 'ai_operations' },
  { title: 'Wave Accounting for Freelancers', description: 'Free accounting software setup for independent contractors', tier_access: 'ai_free' },
  { title: 'Xero Accounting Fundamentals', description: 'Cloud-based accounting for growing businesses', tier_access: 'ai_operations' },
  { title: 'FreshBooks for Service Businesses', description: 'Time tracking, invoicing, and expense management', tier_access: 'ai_assistant' },
  { title: 'Excel for Business Accounting', description: 'Build accounting spreadsheets without expensive software', tier_access: 'ai_free' },
  { title: 'Google Sheets Financial Templates', description: 'Free templates for P&L, cash flow, and budgets', tier_access: 'ai_free' },
  { title: 'Choosing the Right Accounting Software', description: 'Compare QuickBooks, Xero, Wave, and FreshBooks', tier_access: 'ai_free' },
  
  // Financial Reports (8 courses)
  { title: 'Reading Your Profit & Loss Statement', description: 'Understand revenue, expenses, and net income', tier_access: 'ai_free' },
  { title: 'Understanding Your Balance Sheet', description: 'Assets, liabilities, and equity explained', tier_access: 'ai_assistant' },
  { title: 'Cash Flow Statement Basics', description: 'Track money in and out of your business', tier_access: 'ai_assistant' },
  { title: 'Accounts Receivable Aging Report', description: 'Track who owes you money and when', tier_access: 'ai_operations' },
  { title: 'Accounts Payable Management', description: 'Manage vendor bills and payment schedules', tier_access: 'ai_operations' },
  { title: 'Monthly Financial Close Process', description: 'Step-by-step month-end accounting procedures', tier_access: 'ai_tax' },
  { title: 'Creating Budget vs Actual Reports', description: 'Compare planned spending to actual expenses', tier_access: 'ai_operations' },
  { title: 'Financial Dashboard Setup', description: 'Build a one-page view of your business health', tier_access: 'ai_operations' },
  
  // Tax & Compliance (7 courses)
  { title: 'Quarterly Estimated Tax Payments', description: 'Calculate and pay taxes four times per year', tier_access: 'ai_tax' },
  { title: 'Preparing for Tax Season', description: 'Organize documents and receipts for your CPA', tier_access: 'ai_tax' },
  { title: '1099 Contractor Reporting', description: 'Issue 1099-NEC forms to contractors you paid', tier_access: 'ai_tax' },
  { title: 'Sales Tax Collection & Remittance', description: 'When and how to collect and pay sales tax', tier_access: 'ai_tax' },
  { title: 'Business Expense Deductions', description: 'What you can write off legally', tier_access: 'ai_tax' },
  { title: 'Home Office Deduction Guide', description: 'Calculate and claim your home office space', tier_access: 'ai_tax' },
  { title: 'Mileage Tracking for Business', description: 'Log business miles for tax deductions', tier_access: 'ai_tax' },
  
  // Operations Tools (8 courses)
  { title: 'Asana for Project Management', description: 'Organize tasks, projects, and team workflows', tier_access: 'ai_operations' },
  { title: 'Trello Board Setup', description: 'Visual task management with cards and lists', tier_access: 'ai_assistant' },
  { title: 'Monday.com Workflow Automation', description: 'Build automated workflows for recurring tasks', tier_access: 'ai_operations' },
  { title: 'Slack for Team Communication', description: 'Set up channels, threads, and integrations', tier_access: 'ai_assistant' },
  { title: 'Notion Workspace Setup', description: 'All-in-one workspace for notes, docs, and databases', tier_access: 'ai_operations' },
  { title: 'Google Workspace for Business', description: 'Gmail, Drive, Docs, Sheets, and Calendar', tier_access: 'ai_free' },
  { title: 'Calendly Scheduling Setup', description: 'Automate appointment booking and reminders', tier_access: 'ai_assistant' },
  { title: 'Zapier Automation Basics', description: 'Connect apps and automate repetitive tasks', tier_access: 'ai_operations' },
  
  // Marketing Platforms (6 courses)
  { title: 'Mailchimp Email Marketing', description: 'Build email lists and send newsletters', tier_access: 'ai_assistant' },
  { title: 'Canva for Business Graphics', description: 'Design social posts, flyers, and presentations', tier_access: 'ai_free' },
  { title: 'Hootsuite Social Media Scheduling', description: 'Plan and schedule posts across platforms', tier_access: 'ai_assistant' },
  { title: 'Google Analytics Setup', description: 'Track website traffic and user behavior', tier_access: 'ai_operations' },
  { title: 'Facebook Ads Manager Basics', description: 'Create and run Facebook and Instagram ads', tier_access: 'ai_operations' },
  { title: 'LinkedIn for Business Networking', description: 'Build your professional presence and connections', tier_access: 'ai_free' },
  
  // Sales & CRM (5 courses)
  { title: 'HubSpot CRM Setup', description: 'Free CRM for tracking leads and deals', tier_access: 'ai_assistant' },
  { title: 'Salesforce Basics for Small Business', description: 'Enterprise CRM for growing companies', tier_access: 'ai_operations' },
  { title: 'Pipedrive Sales Pipeline', description: 'Visual sales pipeline management', tier_access: 'ai_operations' },
  { title: 'Creating Sales Proposals', description: 'Write winning proposals that close deals', tier_access: 'ai_assistant' },
  { title: 'Sales Follow-Up Systems', description: 'Automate follow-ups without being pushy', tier_access: 'ai_assistant' },
  
  // E-commerce (4 courses)
  { title: 'Shopify Store Setup', description: 'Launch your online store in one day', tier_access: 'ai_operations' },
  { title: 'Stripe Payment Processing', description: 'Accept credit cards and ACH payments', tier_access: 'ai_operations' },
  { title: 'Square for In-Person Payments', description: 'POS system for retail and service businesses', tier_access: 'ai_operations' },
  { title: 'WooCommerce for WordPress', description: 'Add e-commerce to your WordPress site', tier_access: 'ai_operations' },
  
  // HR & Payroll (4 courses)
  { title: 'Gusto Payroll Setup', description: 'Run payroll and manage employee benefits', tier_access: 'ai_operations' },
  { title: 'Time Tracking for Employees', description: 'Tools and systems for hourly workers', tier_access: 'ai_operations' },
  { title: 'Employee Onboarding Checklist', description: 'Paperwork and setup for new hires', tier_access: 'ai_operations' },
  { title: 'Performance Review Process', description: 'Conduct effective employee evaluations', tier_access: 'ai_advisory' },
  
  // Business Systems (3 courses)
  { title: 'Business Phone System Setup', description: 'VoIP, forwarding, and professional voicemail', tier_access: 'ai_assistant' },
  { title: 'Document Management Systems', description: 'Organize and secure business documents', tier_access: 'ai_operations' },
  { title: 'Contract Management Best Practices', description: 'Store, track, and renew business contracts', tier_access: 'ai_advisory' }
];

async function createCourses() {
  console.log(`Creating ${courses.length} new courses...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const course of courses) {
    const { error } = await supabase.from('courses').insert({
      title: course.title,
      description: course.description,
      tier_access: [course.tier_access],
      status: 'published',
      created_by: OWNER_ID,
      thumbnail_url: ''
    });
    
    if (error) {
      console.log(`✗ ${course.title}: ${error.message}`);
      errorCount++;
    } else {
      console.log(`✓ ${course.title}`);
      successCount++;
    }
  }
  
  console.log(`\n🎉 Complete!`);
  console.log(`${successCount} success, ${errorCount} errors`);
  console.log(`Total courses should now be: 32 + ${successCount} = ${32 + successCount}`);
}

createCourses().catch(console.error);
