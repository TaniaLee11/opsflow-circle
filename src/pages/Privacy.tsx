import { Helmet } from "react-helmet-async";
import { PublicNav } from "@/components/layout/PublicNav";
import { PublicFooter } from "@/components/layout/PublicFooter";

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | Virtual OPS Assist</title>
        <meta name="description" content="Privacy Policy for Virtual OPS Assist - Learn how we collect, use, and protect your information." />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <PublicNav />

        <main className="flex-1 py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: January 14, 2025</p>

            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Virtual OPS Assist ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. 
                  This privacy policy explains how we collect, use, disclose, and safeguard your information when you visit our website 
                  or use our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">We may collect the following types of information:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li><strong className="text-foreground">Personal Information:</strong> Name, email address, phone number, and business information you provide when contacting us or signing up for our services.</li>
                  <li><strong className="text-foreground">Account Information:</strong> Login credentials and profile information when you create an account.</li>
                  <li><strong className="text-foreground">Usage Data:</strong> Information about how you interact with our website and services, including IP address, browser type, pages visited, and time spent.</li>
                  <li><strong className="text-foreground">Communications:</strong> Records of your correspondence with us, including chat messages with VOPSy.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">We use the information we collect to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send you technical notices, updates, and support messages</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Communicate with you about products, services, and events</li>
                  <li>Monitor and analyze trends, usage, and activities</li>
                  <li>Personalize and improve your experience</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">4. AI and Data Processing</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our AI assistant, VOPSy, processes conversations to provide helpful responses. Conversation data may be used to 
                  improve our AI systems. We do not sell your personal data or conversation history to third parties. 
                  AI-generated responses are designed to assist but should not be considered professional legal, financial, or tax advice.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">5. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement appropriate technical and organizational measures to protect your personal data against unauthorized 
                  access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic 
                  storage is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">6. Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, 
                  including to satisfy legal, accounting, or reporting requirements. When data is no longer needed, we securely 
                  delete or anonymize it.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">7. Your Rights</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">Depending on your location, you may have the right to:</p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>Access the personal data we hold about you</li>
                  <li>Request correction of inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to or restrict processing of your data</li>
                  <li>Request data portability</li>
                  <li>Withdraw consent at any time</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">8. Third-Party Services</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may use third-party services for payment processing, analytics, and other functions. These third parties have 
                  their own privacy policies and we encourage you to review them. We are not responsible for the privacy practices 
                  of third-party websites or services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">9. Cookies and Tracking</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use cookies and similar tracking technologies to collect and track information about your browsing activities. 
                  You can instruct your browser to refuse all cookies or indicate when a cookie is being sent. However, some features 
                  of our service may not function properly without cookies.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">10. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal 
                  information from children. If we learn we have collected personal information from a child, we will take steps 
                  to delete that information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">11. Changes to This Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy 
                  on this page and updating the "Last updated" date. Your continued use of our services after changes constitutes 
                  acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">12. Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about this privacy policy or our privacy practices, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-card border border-border rounded-lg">
                  <p className="text-foreground font-medium">Virtual OPS Assist</p>
                  <p className="text-muted-foreground">Greater Rochester, NY</p>
                  <p className="text-muted-foreground">Email: privacy@virtualopsassist.com</p>
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
