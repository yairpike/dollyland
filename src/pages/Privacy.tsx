import { DashboardLayout } from "@/components/DashboardLayout";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Privacy = () => {
  const { user } = useAuth();

  const PrivacyContent = () => (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Card className="shadow-lg">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-4xl font-bold mb-4">Privacy Policy</CardTitle>
          <p className="text-muted-foreground">Last updated: December 16, 2024</p>
        </CardHeader>
        
        <CardContent className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect information you provide directly to us and information we obtain from your use of our services:
            </p>
            
            <h3 className="text-xl font-medium mb-3 mt-6">Account Information</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Name, email address, and account credentials</li>
              <li>Profile information and preferences</li>
              <li>Billing and payment information (processed securely by Stripe)</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6">Usage Data</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>AI agent configurations and customizations</li>
              <li>Conversation data and chat interactions</li>
              <li>Knowledge base uploads and files</li>
              <li>Platform usage analytics and performance metrics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide and maintain our AI agent platform services</li>
              <li>Process your knowledge uploads to train and improve your agents</li>
              <li>Enable real-time chat functionality with your AI agents</li>
              <li>Process payments and manage your subscription</li>
              <li>Send important service updates and notifications</li>
              <li>Improve our platform and develop new features</li>
              <li>Provide customer support and respond to your inquiries</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. AI Processing and Data</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our platform processes your data through AI systems:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Knowledge base content is processed to create AI agent responses</li>
              <li>Conversation data is used to improve agent performance</li>
              <li>Your data remains associated with your specific agents</li>
              <li>We do not use your private data to train general AI models</li>
              <li>Processing occurs within secure, isolated environments</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We integrate with trusted third-party services to provide our platform:
            </p>
            
            <h3 className="text-xl font-medium mb-3 mt-6">Supabase (Data Storage)</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Secure database hosting and user authentication</li>
              <li>Data stored in accordance with industry security standards</li>
              <li>Regular backups and data protection measures</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6">Stripe (Payment Processing)</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Secure payment processing and subscription management</li>
              <li>PCI DSS compliant payment handling</li>
              <li>We do not store complete payment card information</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6">Google OAuth (Authentication)</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Optional login method for user convenience</li>
              <li>Only basic profile information is accessed</li>
              <li>You can manage permissions through your Google account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties except:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>With your explicit consent</li>
              <li>To trusted service providers who assist in platform operations</li>
              <li>When required by law or to protect our legal rights</li>
              <li>In connection with a business transfer or acquisition</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We implement comprehensive security measures:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Encryption in transit and at rest</li>
              <li>Regular security audits and monitoring</li>
              <li>Access controls and authentication requirements</li>
              <li>Secure API endpoints and data transmission</li>
              <li>Regular security updates and patches</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access: Request information about data we hold about you</li>
              <li>Correction: Update or correct inaccurate personal information</li>
              <li>Deletion: Request deletion of your personal data</li>
              <li>Portability: Request a copy of your data in a portable format</li>
              <li>Objection: Object to certain types of data processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. We ensure adequate 
              protection through appropriate safeguards and comply with applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Maintain your login session</li>
              <li>Remember your preferences and settings</li>
              <li>Analyze platform usage and performance</li>
              <li>Improve user experience and functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal 
              information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your information for as long as necessary to provide our services, comply with legal obligations, 
              resolve disputes, and enforce our agreements. You can request deletion of your data at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy or our data practices, please contact us through the 
              support channels available in your dashboard or by email.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );

  // If user is signed in, use dashboard layout
  if (user) {
    return (
      <DashboardLayout>
        <PrivacyContent />
      </DashboardLayout>
    );
  }

  // For anonymous users, use the original layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Header />
      <main>
        <PrivacyContent />
      </main>
    </div>
  );
};

export default Privacy;