import { UserPlus, Workflow, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Connect your leads',
    description: 'Integrate with your CRM, web forms, or import leads manually. It only takes a few minutes.',
  },
  {
    icon: Workflow,
    step: '02',
    title: 'Create your flows',
    description: 'Build automated follow-up flows with email, SMS, and WhatsApp. Choose timing and templates.',
  },
  {
    icon: TrendingUp,
    step: '03',
    title: 'Let AI do the work',
    description: 'AI handles all follow-ups and books meetings. You focus on closing deals.',
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            How it Works
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Get started in{' '}
            <span className="gradient-text">3 simple steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            No technical knowledge required. Set up your first automation in under 10 minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-20" />

            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {/* Step number */}
                <div className="relative inline-flex mb-6">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <step.icon className="w-12 h-12 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
                    {step.step}
                  </span>
                </div>

                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rounded-2xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-border">
            {[
              { value: '94%', label: 'Response rate' },
              { value: '< 2 min', label: 'Response time' },
              { value: '3x', label: 'More meetings booked' },
              { value: '32%', label: 'Higher conversion' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
