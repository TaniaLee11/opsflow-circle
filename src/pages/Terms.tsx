import { Helmet } from "react-helmet-async";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PageThemeToggle } from "@/components/ui/page-theme-toggle";

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Terms of Service | Virtual OPS Assist</title>
        <meta name="description" content="Terms of Service for Virtual OPS Assist - Read our terms and conditions for using our services." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <PublicNav />
        
        {/* Page Theme Toggle */}
        <div className="fixed top-20 right-4 z-40">
          <PageThemeToggle className="px-0 py-0" />
        </div>

        <main className="flex-1 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 14, 2025</p>

            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using the Virtual OPS Assist website and services ("Services"), you agree to be bound by these 
                  Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Services. We reserve the 
                  right to modify these Terms at any time, and your continued use constitutes acceptance of any changes.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">2. Description of Services</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Virtual OPS Assist provides AI-enabled operations, finance, compliance, and automation services for founders, 
                  executives, nonprofits, and enterprises. Our services include access to VOPSy, our AI operations assistant, 
                  the Integration Hub, and various consulting and support services. Service availability and features may change 
                  without prior notice.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">3. User Accounts</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">To access certain features, you may need to create an account. You agree to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your information as needed</li>
                  <li>Keep your login credentials secure and confidential</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">4. Acceptable Use</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">You agree not to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Use our Services for any unlawful purpose</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on the rights of others</li>
                  <li>Transmit harmful code, malware, or viruses</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt our Services</li>
                  <li>Use automated systems to access our Services without permission</li>
                  <li>Resell or redistribute our Services without authorization</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">5. AI Services and VOPSy</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our AI assistant, VOPSy, is designed to provide helpful information and support. By using VOPSy, you acknowledge and agree that:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>AI responses are generated automatically and may not always be accurate or complete</li>
                  <li>VOPSy does not provide professional legal, financial, tax, or medical advice</li>
                  <li>You should verify important information with qualified professionals</li>
                  <li>We are not liable for decisions made based on AI-generated responses</li>
                  <li>Conversations may be used to improve our AI systems</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">6. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All content, features, and functionality of our Services—including but not limited to text, graphics, logos, 
                  icons, images, audio, video, software, and the VOPSy AI system—are owned by Virtual OPS Assist and protected 
                  by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create 
                  derivative works without our express written permission.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">7. User Content</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You retain ownership of content you submit through our Services. However, by submitting content, you grant us 
                  a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, and display such content for the 
                  purpose of providing and improving our Services. You represent that you have the right to submit any content 
                  and that it does not violate any third-party rights.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">8. Payment Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Certain Services require payment. By subscribing to paid Services, you agree to pay all applicable fees as 
                  described at the time of purchase. Fees are non-refundable unless otherwise stated. We reserve the right to 
                  change pricing with reasonable notice. Failure to pay may result in suspension or termination of your account.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">9. Disclaimer of Warranties</h2>
                <p className="text-muted-foreground leading-relaxed">
                  OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. 
                  WE DISCLAIM ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
                  AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT OUR SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">10. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, VIRTUAL OPS ASSIST SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
                  SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING FROM YOUR 
                  USE OF OUR SERVICES. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICES IN THE TWELVE 
                  MONTHS PRECEDING THE CLAIM.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">11. Indemnification</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You agree to indemnify, defend, and hold harmless Virtual OPS Assist, its officers, directors, employees, 
                  and agents from any claims, damages, losses, or expenses (including reasonable attorneys' fees) arising from 
                  your use of our Services, your violation of these Terms, or your violation of any rights of a third party.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">12. Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may suspend or terminate your access to our Services at any time, with or without cause, with or without 
                  notice. Upon termination, your right to use our Services will immediately cease. Provisions that by their 
                  nature should survive termination will survive, including intellectual property rights, disclaimers, and 
                  limitations of liability.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">13. Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of the State of New York, without 
                  regard to its conflict of law provisions. Any disputes arising from these Terms or your use of our Services 
                  shall be resolved in the courts located in Monroe County, New York.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">14. Severability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or 
                  eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">15. Entire Agreement</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and Virtual OPS 
                  Assist regarding your use of our Services and supersede all prior agreements and understandings.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">16. Contact Information</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about these Terms, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-card border border-border rounded-lg">
                  <p className="text-foreground font-medium">Virtual OPS Assist</p>
                  <p className="text-muted-foreground">Greater Rochester, NY</p>
                  <p className="text-muted-foreground">Email: legal@virtualopsassist.com</p>
                </div>
              </section>
            </div>
          </div>
        </main>

        <PublicFooter />
      </div>
    </>
  );
}
