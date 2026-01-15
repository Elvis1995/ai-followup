import { Building2, Sun, Home, Car, Briefcase } from 'lucide-react';

const industries = [
  {
    icon: Home,
    name: 'Real Estate',
    description: 'Follow up on all prospects automatically and book more viewings.',
    stat: '45% more viewings booked',
  },
  {
    icon: Building2,
    name: 'Construction',
    description: 'Never let a quote request fall through the cracks.',
    stat: '38% higher win rate',
  },
  {
    icon: Sun,
    name: 'Solar & Energy',
    description: 'Convert more leads from your energy calculations.',
    stat: '52% faster sales cycle',
  },
  {
    icon: Car,
    name: 'Auto Dealers',
    description: 'Automatic follow-up on test drives and quotes.',
    stat: '3x more repeat customers',
  },
  {
    icon: Briefcase,
    name: 'B2B & Consulting',
    description: 'Professional follow-ups that build trust.',
    stat: '28% shorter sales cycle',
  },
];

const IndustriesSection = () => {
  return (
    <section id="industries" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
            Industries
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Perfect for{' '}
            <span className="gradient-text">your industry</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            FollowUp AI is built for companies that rely on leads and quotes.
          </p>
        </div>

        {/* Industries grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {industries.map((industry, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 overflow-hidden"
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4">
                  <industry.icon className="w-6 h-6 text-primary" />
                </div>

                <h3 className="text-xl font-semibold mb-2">{industry.name}</h3>
                <p className="text-muted-foreground mb-4">{industry.description}</p>

                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium">
                  {industry.stat}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustriesSection;
