import { Zap, Clock, Calendar, BarChart3, Mail, MessageSquare } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Instant response',
    description: 'AI responds within seconds when a lead comes in – never miss a hot prospect again.',
  },
  {
    icon: Clock,
    title: 'Automatic follow-ups',
    description: 'Schedule follow-ups automatically after 2, 5, or 10 days – exactly how you want.',
  },
  {
    icon: Mail,
    title: 'Multi-channel outreach',
    description: 'Reach your leads via email, SMS, and WhatsApp – all from one platform.',
  },
  {
    icon: Calendar,
    title: 'AI meeting booking',
    description: 'Let AI suggest times and book meetings directly in your calendar – automatically.',
  },
  {
    icon: BarChart3,
    title: 'Smart analytics',
    description: 'See exactly which flows convert best and optimize your follow-up strategy.',
  },
  {
    icon: MessageSquare,
    title: 'Personalized messages',
    description: 'AI customizes each message based on lead behavior and preferences.',
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Everything you need to{' '}
            <span className="gradient-text">never lose a lead</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            FollowUp AI automates your entire follow-up process – from first contact to closed deal.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
