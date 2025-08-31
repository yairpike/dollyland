import { DashboardLayout } from "@/components/DashboardLayout";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  const { user } = useAuth();

  const TermsContent = () => (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <Card className="shadow-lg">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-4xl font-bold mb-4">Terms of Service</CardTitle>
          <p className="text-muted-foreground">Last updated: December 16, 2024</p>
        </CardHeader>
        
        <CardContent className="prose prose-gray dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to dollyland.ai ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our AI agent platform, 
              where you can create, customize, and deploy AI agents for various purposes. By accessing or using our service, you agree to 
              be bound by these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              dollyland.ai provides a platform for creating, managing, and deploying AI agents. Our services include:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-muted-foreground">
              <li>AI agent creation and customization tools</li>
              <li>Knowledge base uploading and processing</li>
              <li>Real-time chat capabilities with AI agents</li>
              <li>Agent marketplace for sharing and discovering agents</li>
              <li>Integration capabilities with third-party services</li>
              <li>Analytics and performance monitoring</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Obligations</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">You agree to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide accurate and complete information when creating your account</li>
              <li>Maintain the security of your account credentials</li>
              <li>Use the service only for lawful purposes</li>
              <li>Not create agents that promote harmful, illegal, or inappropriate content</li>
              <li>Respect intellectual property rights of others</li>
              <li>Not attempt to reverse engineer or compromise our platform security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. AI Content and Limitations</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our AI agents generate content based on machine learning models. Important disclaimers:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>AI-generated content may not always be accurate, complete, or reliable</li>
              <li>You are responsible for reviewing and verifying AI-generated content before use</li>
              <li>We do not guarantee the accuracy of AI responses or advice</li>
              <li>AI agents should not be used for medical, legal, or financial advice without professional consultation</li>
              <li>We are not liable for decisions made based on AI-generated content</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Payment Terms</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              For paid subscription plans:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Payments are processed securely through Stripe</li>
              <li>Subscriptions automatically renew unless cancelled</li>
              <li>We offer a 14-day money-back guarantee for new subscriptions</li>
              <li>Price changes will be communicated 30 days in advance</li>
              <li>Refunds are processed according to our refund policy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of content you upload to our platform. By using our service, you grant us a limited license to 
              process your content to provide our services. We respect your intellectual property and expect the same in return.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Data Processing and Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We process your data according to our Privacy Policy. Your data is stored securely using Supabase infrastructure, 
              and we implement appropriate security measures to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may terminate your account at any time. We may terminate or suspend your account for violations of these Terms. 
              Upon termination, your access to the service will cease, though some data may be retained as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by law, dollyland.ai shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages arising out of your use of our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about these Terms, please contact us through our support channels available in your dashboard.
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
        <TermsContent />
      </DashboardLayout>
    );
  }

  // For anonymous users, use the original layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Header />
      <main>
        <TermsContent />
      </main>
    </div>
  );
};

export default Terms;