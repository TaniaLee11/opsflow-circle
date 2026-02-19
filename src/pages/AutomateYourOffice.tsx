import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Bot,
  Users,
  DollarSign,
  FileText,
  Calendar,
  BarChart3,
  Mail
} from 'lucide-react';

export default function AutomateYourOffice() {
  const navigate = useNavigate();
  const [selectedPath, setSelectedPath] = useState<'tech' | 'human' | null>(null);

  const automatedProcesses = [
    { icon: DollarSign, title: 'Financial Workflows', description: 'Invoicing, expense tracking, reconciliation' },
    { icon: Users, title: 'Client Onboarding', description: 'Automated intake, document collection, setup' },
    { icon: FileText, title: 'Document Management', description: 'Organization, storage, retrieval' },
    { icon: Mail, title: 'Email Sequences', description: 'Follow-ups, reminders, nurture campaigns' },
    { icon: Calendar, title: 'Scheduling', description: 'Appointments, deadlines, recurring tasks' },
    { icon: BarChart3, title: 'Reporting', description: 'Dashboards, KPIs, financial statements' },
  ];

  const techTiers = [
    {
      name: 'AI Free',
      price: 'Free',
      description: 'Guidance only — no integration',
      features: [
        'VOPSy AI chat & guidance',
        'Document discussion',
        'Educational resources',
        'Financial literacy tools',
        'Community support'
      ],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'AI Assistant',
      price: '$39.99',
      period: '/month',
      description: 'Read access — advisory only',
      features: [
        'Everything in AI Free',
        'Connect bank, email & calendars',
        'Read and analyze your data',
        'Smart recommendations',
        'Financial literacy tools'
      ],
      cta: 'Get Started',
      popular: false
    },
    {
      name: 'AI Operations',
      price: '$99.99',
      period: '/month',
      description: 'Full execution — VOPSy works on your behalf',
      features: [
        'Everything in AI Assistant',
        'VOPSy executes tasks for you',
        'Automated workflows',
        'Write & modify data',
        'Reconciliation & organization'
      ],
      cta: 'Most Popular',
      popular: true
    }
  ];

  const humanTiers = [
    {
      name: 'AI Advisory',
      price: '$150',
      period: '/hour',
      description: 'Strategic guidance from Tania Potter with full platform execution',
      features: [
        'One-on-one advisory sessions',
        'Strategic financial planning',
        'Growth readiness assessments',
        'Fractional CFO services',
        'Full AI Operations access'
      ],
      cta: 'Schedule Consultation',
      popular: false
    },
    {
      name: 'AI Tax',
      price: 'From $125',
      period: '',
      description: 'Professional tax preparation reviewed by Tania Potter',
      features: [
        'Personal & business returns',
        'Expert tax preparation',
        'IRS notice support',
        'Year-round tax planning',
        'AI Free platform access'
      ],
      cta: 'Schedule Tax Review',
      popular: false
    },
    {
      name: 'AI Compliance',
      price: '$350',
      period: '/quarter',
      description: 'Ongoing compliance management with dedicated support',
      features: [
        'Quarterly compliance review',
        'Filing deadline management',
        'Sales tax tracking',
        '1099 contractor management',
        'Full AI Operations access'
      ],
      cta: 'Schedule Compliance Call',
      popular: false
    },
    {
      name: 'AI Enterprise',
      price: '$499-$999',
      period: '/month',
      description: 'Custom solutions with dedicated account manager',
      features: [
        'Dedicated account manager',
        'Custom integrations',
        'White-glove onboarding',
        'Multi-user access',
        'Full AI Operations access'
      ],
      cta: 'Contact Us',
      popular: false
    }
  ];

  const handleTierSelect = (tierName: string) => {
    if (tierName === 'AI Free') {
      navigate('/hub');
    } else {
      navigate('/services');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-purple-500/10" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-orange-500/20 mb-6">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-gray-300">Virtual Back Office Support</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-white">Automate Your </span>
            <span className="text-gradient">Office</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            With Virtual OPS as your back office support, you get more done faster.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={() => document.getElementById('choose-path')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary text-lg px-8 py-4"
            >
              Choose Your Path
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/services')}
              className="btn-secondary text-lg px-8 py-4"
            >
              View All Services
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="glass p-6 rounded-xl">
              <div className="text-3xl font-bold text-orange-500 mb-2">10+</div>
              <div className="text-sm text-gray-400">Hours Saved Per Week</div>
            </div>
            <div className="glass p-6 rounded-xl">
              <div className="text-3xl font-bold text-orange-500 mb-2">95%</div>
              <div className="text-sm text-gray-400">Error Reduction</div>
            </div>
            <div className="glass p-6 rounded-xl">
              <div className="text-3xl font-bold text-orange-500 mb-2">24/7</div>
              <div className="text-sm text-gray-400">Automated Operations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Your Time is Too Valuable for Manual Work
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Business owners spend 40% of their time on administrative tasks that could be automated.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Time Wasted</h3>
              <p className="text-gray-400">
                Hours spent on data entry, invoice creation, expense tracking, and manual reconciliation.
              </p>
            </div>

            <div className="glass p-8 rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Errors & Delays</h3>
              <p className="text-gray-400">
                Manual processes lead to mistakes, missed deadlines, and compliance issues.
              </p>
            </div>

            <div className="glass p-8 rounded-xl">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Growth Blocked</h3>
              <p className="text-gray-400">
                Can't scale when you're stuck doing admin work instead of growing your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Automate */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              We Automate Your Entire Back Office
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From financial workflows to client management, we handle it all—so you can focus on what matters.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {automatedProcesses.map((process, index) => (
              <div key={index} className="glass p-6 rounded-xl hover:border-orange-500/50 transition-all">
                <process.icon className="w-8 h-8 text-orange-500 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{process.title}</h3>
                <p className="text-gray-400 text-sm">{process.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Choose Your Path */}
      <section id="choose-path" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Choose Your Path
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Whether you prefer AI-powered automation or hands-on expert guidance, we have the right fit for you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <button
              onClick={() => setSelectedPath('tech')}
              className={`glass p-8 rounded-xl text-left transition-all hover:border-orange-500/50 ${
                selectedPath === 'tech' ? 'border-orange-500 bg-orange-500/5' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-blue-500" />
                </div>
                {selectedPath === 'tech' && (
                  <CheckCircle2 className="w-6 h-6 text-orange-500" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Tech-Only Automation</h3>
              <p className="text-gray-400 mb-4">
                AI-powered platform handles your back office automatically. No human involvement needed.
              </p>
              <div className="flex items-center gap-2 text-orange-500">
                <span className="font-semibold">Free - $99.99/month</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>

            <button
              onClick={() => setSelectedPath('human')}
              className={`glass p-8 rounded-xl text-left transition-all hover:border-orange-500/50 ${
                selectedPath === 'human' ? 'border-orange-500 bg-orange-500/5' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-500" />
                </div>
                {selectedPath === 'human' && (
                  <CheckCircle2 className="w-6 h-6 text-orange-500" />
                )}
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Tech + Human Expertise</h3>
              <p className="text-gray-400 mb-4">
                AI automation plus direct access to Tania Potter and her team of professionals.
              </p>
              <div className="flex items-center gap-2 text-orange-500">
                <span className="font-semibold">From $125</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>

          {/* Tech Tiers */}
          {selectedPath === 'tech' && (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">Tech-Only Tiers</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {techTiers.map((tier, index) => (
                  <div
                    key={index}
                    className={`glass p-6 rounded-xl ${
                      tier.popular ? 'border-orange-500 bg-orange-500/5' : ''
                    }`}
                  >
                    {tier.popular && (
                      <div className="inline-block px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-semibold mb-4">
                        Most Popular
                      </div>
                    )}
                    <h4 className="text-xl font-bold text-white mb-2">{tier.name}</h4>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-orange-500">{tier.price}</span>
                      {tier.period && <span className="text-gray-400">{tier.period}</span>}
                    </div>
                    <p className="text-sm text-gray-400 mb-6">{tier.description}</p>
                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleTierSelect(tier.name)}
                      className={tier.popular ? 'btn-primary w-full' : 'btn-secondary w-full'}
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Human Tiers */}
          {selectedPath === 'human' && (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">Tech + Human Tiers</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {humanTiers.map((tier, index) => (
                  <div key={index} className="glass p-6 rounded-xl">
                    <h4 className="text-xl font-bold text-white mb-2">{tier.name}</h4>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-orange-500">{tier.price}</span>
                      {tier.period && <span className="text-gray-400">{tier.period}</span>}
                    </div>
                    <p className="text-sm text-gray-400 mb-6">{tier.description}</p>
                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                          <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleTierSelect(tier.name)}
                      className="btn-secondary w-full"
                    >
                      {tier.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass p-12 rounded-2xl">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Automate Your Office?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Stop wasting time on manual work. Let Virtual OPS handle your back office so you can focus on growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/services')}
                className="btn-primary text-lg px-8 py-4"
              >
                View All Tiers
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => window.location.href = 'mailto:tania@virtualopsassist.com'}
                className="btn-secondary text-lg px-8 py-4"
              >
                Schedule a Call
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
