import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">dollyland.ai</h3>
            <p className="text-sm text-muted-foreground">
              Create, deploy, and manage AI agents with ease.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Product</h4>
            <div className="space-y-2">
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link to="/marketplace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Marketplace
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Resources</h4>
            <div className="space-y-2">
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Link to="/settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Settings
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Legal</h4>
            <div className="space-y-2">
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 dollyland.ai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};