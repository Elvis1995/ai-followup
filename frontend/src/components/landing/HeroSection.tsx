import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Zap, Mail, MessageSquare, Calendar } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-powered follow-ups</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-slide-up">
            Stop losing{' '}
            <span className="gradient-text">30–60%</span>{' '}
            of your leads
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up animation-delay-100">
            Let AI follow up on your quotes and leads automatically via email, SMS, and WhatsApp – and book meetings for you.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up animation-delay-200">
            <Link to="/register">
              <Button variant="hero" size="xl" className="group">
                Start for free
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button variant="hero-outline" size="xl" className="group">
              <Play className="w-5 h-5" />
              Watch demo
            </Button>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 animate-slide-up animation-delay-300">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-sm">Automated emails</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
              <MessageSquare className="w-4 h-4 text-accent" />
              <span className="text-sm">SMS & WhatsApp</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
              <Calendar className="w-4 h-4 text-success" />
              <span className="text-sm">Meeting booking</span>
            </div>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="mt-20 max-w-6xl mx-auto animate-slide-up animation-delay-400">
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-2xl opacity-50" />
            
            {/* Dashboard mockup */}
            <div className="relative rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/50" />
                  <div className="w-3 h-3 rounded-full bg-warning/50" />
                  <div className="w-3 h-3 rounded-full bg-success/50" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="w-64 h-6 rounded-md bg-muted" />
                </div>
              </div>

              {/* Dashboard content preview */}
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Leads', value: '248', change: '+12%' },
                    { label: 'Follow-ups', value: '67', change: '+8%' },
                    { label: 'Meetings', value: '23', change: '+24%' },
                    { label: 'Conversion', value: '32.4%', change: '+5%' },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-lg bg-muted/50 border border-border">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{stat.value}</span>
                        <span className="text-xs text-success">{stat.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-48 rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 flex items-center justify-center">
                  <span className="text-muted-foreground">Leads & follow-ups graph</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className="mt-16 text-center animate-fade-in animation-delay-400">
          <p className="text-sm text-muted-foreground mb-4">Trusted by 500+ companies worldwide</p>
          <div className="flex items-center justify-center gap-8 opacity-50">
            {['TechCorp', 'SolarPro', 'RealtyMax', 'AutoPremium'].map((company, i) => (
              <span key={i} className="text-lg font-semibold text-muted-foreground">
                {company}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
