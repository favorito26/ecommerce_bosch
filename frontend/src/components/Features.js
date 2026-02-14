import React from 'react';
import { Shield, Truck, Headphones, Award } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Genuine Products',
    description: 'Authentic Bosch appliances with warranty'
  },
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Pan India shipping at no extra cost'
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Expert assistance anytime you need'
  },
  {
    icon: Award,
    title: 'Easy Returns',
    description: '7-day hassle-free return policy'
  }
];

const Features = () => {
  return (
    <section className="section-spacing bg-bosch-surface" data-testid="features-section">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center space-y-4 p-6 bg-white rounded-sm shadow-soft hover:shadow-hover transition-all duration-300"
              data-testid={`feature-${index}`}
            >
              <div className="w-16 h-16 rounded-sm bg-bosch-red/10 flex items-center justify-center">
                <feature.icon className="w-8 h-8 text-bosch-red" />
              </div>
              <h3 className="text-lg font-semibold font-heading text-bosch-navy">{feature.title}</h3>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;