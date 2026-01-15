import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';

const benefits = [
  '14-day free trial',
  'No credit card required',
  'Full support included',
  'Cancel anytime',
];

const CTASection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="relative max-w-5xl mx-auto">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl blur-3xl" />

          <div className="relative rounded-3xl bg-gradient-to-br from-primary to-accent p-px overflow-hidden">
            <div className="rounded-3xl bg-card p-8 md:p-16">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  Ready to stop losing leads?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Start free today and see how many more deals you can close with automated follow-ups.
                </p>

                {/* Benefits */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link to="/register">
                  <Button variant="hero" size="xl" className="group">
                    Start free now
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>

                <p className="text-sm text-muted-foreground mt-4">
                  Join 500+ companies already using FollowUp AI
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
