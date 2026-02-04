-- Seed integration_catalog with existing integrations
INSERT INTO integration_catalog (id, name, description, icon_url, category, oauth_provider, features, popular, sort_order) VALUES
-- Productivity & Automation
('zapier', 'Zapier', 'Connect to 6,000+ apps and automate workflows without code', 'https://zapier.com/favicon.ico', 'productivity', 'zapier', '["Connect 6,000+ apps", "Automated workflows", "Multi-step Zaps", "VOPSy can trigger your Zaps"]'::jsonb, true, 1),
('google-workspace', 'Google Workspace (Read-Only)', 'Connect Gmail, Calendar, and Drive for AI agent read access', 'https://www.google.com/favicon.ico', 'productivity', 'google', '["Gmail read access", "Calendar read access", "Drive read access"]'::jsonb, true, 2),
('microsoft-365', 'Microsoft 365', 'Integrate Outlook, Teams, OneDrive, and Office apps', 'https://www.microsoft.com/favicon.ico', 'productivity', 'microsoft', '["Outlook email", "Teams messaging", "OneDrive storage", "Office apps"]'::jsonb, true, 3),
('calendly', 'Calendly', 'Automated scheduling for meetings and appointments', 'https://calendly.com/favicon.ico', 'productivity', 'calendly', '["Meeting scheduling", "Calendar sync", "Automated reminders", "Booking pages"]'::jsonb, true, 10),
('asana', 'Asana', 'Project management and team collaboration', 'https://asana.com/favicon.ico', 'productivity', 'asana', '["Task management", "Project tracking", "Team collaboration", "Timeline views"]'::jsonb, false, 11),
('notion', 'Notion', 'All-in-one workspace for notes, docs, and wikis', 'https://www.notion.so/favicon.ico', 'productivity', 'notion', '["Documentation", "Databases", "Team wikis", "Project management"]'::jsonb, false, 12),
('airtable', 'Airtable', 'Flexible database and spreadsheet hybrid', 'https://airtable.com/favicon.ico', 'productivity', 'airtable', '["Custom databases", "Automation", "API access", "Collaboration"]'::jsonb, false, 13),
('trello', 'Trello', 'Visual project management with boards and cards', 'https://trello.com/favicon.ico', 'productivity', 'trello', '["Kanban boards", "Task cards", "Team collaboration", "Power-Ups"]'::jsonb, false, 14),
('monday', 'Monday.com', 'Work operating system for teams', 'https://monday.com/favicon.ico', 'productivity', 'monday', '["Project tracking", "Workflow automation", "Team collaboration", "Dashboards"]'::jsonb, false, 15),
('clickup', 'ClickUp', 'All-in-one productivity platform', 'https://clickup.com/favicon.ico', 'productivity', 'clickup', '["Tasks", "Docs", "Goals", "Time tracking"]'::jsonb, false, 16),
('typeform', 'Typeform', 'Beautiful forms and surveys', 'https://www.typeform.com/favicon.ico', 'productivity', 'typeform', '["Forms", "Surveys", "Quizzes", "Data collection"]'::jsonb, false, 17),
('jotform', 'JotForm', 'Online form builder', 'https://www.jotform.com/favicon.ico', 'productivity', 'jotform', '["Form builder", "Payment collection", "Conditional logic", "Templates"]'::jsonb, false, 18),
('docusign', 'DocuSign', 'Electronic signature and document management', 'https://www.docusign.com/favicon.ico', 'productivity', 'docusign', '["E-signatures", "Document tracking", "Templates", "Compliance"]'::jsonb, false, 19),

-- Communication
('slack', 'Slack', 'Team communication and collaboration platform', 'https://slack.com/favicon.ico', 'communication', 'slack', '["Channel notifications", "Direct messages", "File sharing", "Workflow automation"]'::jsonb, false, 20),
('zoom', 'Zoom', 'Video conferencing and virtual meetings', 'https://zoom.us/favicon.ico', 'communication', 'zoom', '["Meeting scheduling", "Recording sync", "Attendance tracking", "Calendar sync"]'::jsonb, false, 21),
('twilio', 'Twilio', 'SMS, voice, and communication APIs', 'https://www.twilio.com/favicon.ico', 'communication', 'twilio', '["SMS messaging", "Voice calls", "WhatsApp", "Programmable communication"]'::jsonb, false, 22),
('intercom', 'Intercom', 'Customer messaging and engagement platform', 'https://www.intercom.com/favicon.ico', 'communication', 'intercom', '["Live chat", "Customer support", "Product tours", "Email campaigns"]'::jsonb, false, 23),
('zendesk', 'Zendesk', 'Customer service and support platform', 'https://www.zendesk.com/favicon.ico', 'communication', 'zendesk', '["Help desk", "Ticketing", "Live chat", "Knowledge base"]'::jsonb, false, 24),

-- Finance & Accounting
('quickbooks', 'QuickBooks', 'Accounting software for invoicing, expenses, and financial reports', 'https://quickbooks.intuit.com/favicon.ico', 'finance', 'quickbooks', '["Invoicing", "Expense tracking", "Financial reports", "Bank reconciliation"]'::jsonb, true, 30),
('xero', 'Xero', 'Cloud accounting software for small business', 'https://www.xero.com/favicon.ico', 'finance', 'xero', '["Invoicing", "Bank reconciliation", "Expense claims", "Financial reporting"]'::jsonb, false, 31),
('stripe', 'Stripe', 'Online payment processing for internet businesses', 'https://stripe.com/favicon.ico', 'finance', 'stripe', '["Payment processing", "Subscription billing", "Invoice management", "Financial reporting"]'::jsonb, true, 32),
('square', 'Square', 'Point of sale and payment processing', 'https://squareup.com/favicon.ico', 'finance', 'square', '["Payment processing", "POS system", "Invoicing", "Inventory"]'::jsonb, false, 33),
('gusto', 'Gusto', 'Payroll, benefits, and HR', 'https://gusto.com/favicon.ico', 'finance', 'gusto', '["Payroll processing", "Benefits administration", "Time tracking", "HR tools"]'::jsonb, false, 34),
('freshbooks', 'FreshBooks', 'Accounting software for small businesses', 'https://www.freshbooks.com/favicon.ico', 'finance', 'freshbooks', '["Invoicing", "Expense tracking", "Time tracking", "Reporting"]'::jsonb, false, 35),
('sage', 'Sage', 'Business management software', 'https://www.sage.com/favicon.ico', 'finance', 'sage', '["Accounting", "Payroll", "Payments", "Business intelligence"]'::jsonb, false, 36),

-- Marketing
('mailchimp', 'Mailchimp', 'Email marketing and automation platform', 'https://mailchimp.com/favicon.ico', 'marketing', 'mailchimp', '["Email campaigns", "Marketing automation", "Audience segmentation", "Analytics"]'::jsonb, true, 40),
('hubspot', 'HubSpot', 'CRM, marketing, sales, and service platform', 'https://www.hubspot.com/favicon.ico', 'marketing', 'hubspot', '["CRM", "Email marketing", "Lead generation", "Analytics"]'::jsonb, true, 41),
('convertkit', 'ConvertKit', 'Email marketing for creators', 'https://convertkit.com/favicon.ico', 'marketing', 'convertkit', '["Email campaigns", "Landing pages", "Automation", "Subscriber management"]'::jsonb, false, 42),
('activecampaign', 'ActiveCampaign', 'Customer experience automation', 'https://www.activecampaign.com/favicon.ico', 'marketing', 'activecampaign', '["Email marketing", "Marketing automation", "CRM", "Sales automation"]'::jsonb, false, 43),
('constantcontact', 'Constant Contact', 'Email and digital marketing', 'https://www.constantcontact.com/favicon.ico', 'marketing', 'constantcontact', '["Email campaigns", "Social media", "Event marketing", "Website builder"]'::jsonb, false, 44),

-- CRM & Sales
('salesforce', 'Salesforce', 'World''s #1 CRM platform', 'https://www.salesforce.com/favicon.ico', 'crm', 'salesforce', '["Contact management", "Sales pipeline", "Marketing automation", "Analytics"]'::jsonb, true, 50),
('shopify', 'Shopify', 'E-commerce platform for online stores', 'https://www.shopify.com/favicon.ico', 'crm', 'shopify', '["Order management", "Inventory tracking", "Customer data", "Sales analytics"]'::jsonb, true, 51),
('zoho-crm', 'Zoho CRM', 'Cost-effective CRM for solopreneurs and small businesses', 'https://www.zoho.com/favicon.ico', 'crm', 'zoho', '["Lead management", "Deal tracking", "Email integration", "Workflow automation"]'::jsonb, false, 52),
('pipedrive', 'Pipedrive', 'Sales-focused CRM with simple pipeline management', 'https://www.pipedrive.com/favicon.ico', 'crm', 'pipedrive', '["Visual pipeline", "Activity tracking", "Sales forecasting", "Email sync"]'::jsonb, false, 53),
('woocommerce', 'WooCommerce', 'WordPress e-commerce plugin', 'https://woocommerce.com/favicon.ico', 'crm', 'woocommerce', '["Online store", "Product management", "Order processing", "Payment gateways"]'::jsonb, false, 54),
('bigcommerce', 'BigCommerce', 'Enterprise e-commerce platform', 'https://www.bigcommerce.com/favicon.ico', 'crm', 'bigcommerce', '["Online stores", "Multi-channel selling", "SEO tools", "Analytics"]'::jsonb, false, 55),

-- Storage & Documents
('dropbox', 'Dropbox', 'Cloud storage and file sharing', 'https://www.dropbox.com/favicon.ico', 'storage', 'dropbox', '["File storage", "File sharing", "Team folders", "Version history"]'::jsonb, false, 60),
('box', 'Box', 'Secure content management and collaboration', 'https://www.box.com/favicon.ico', 'storage', 'box', '["File storage", "Collaboration", "Security", "Workflow automation"]'::jsonb, false, 61)

ON CONFLICT (id) DO NOTHING;
