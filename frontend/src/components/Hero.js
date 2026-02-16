import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative w-full overflow-hidden bg-slate-50" data-testid="hero-section">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh] items-center gap-12 py-16">
          {/* Left Content */}
          <div className="space-y-8">
            <p className="caption-text text-bosch-red">PRECISION ENGINEERED</p>
            <h1 className="hero-text text-bosch-navy">
              Transform Your Kitchen with Bosch
            </h1>
            <p className="body-text max-w-xl">
              Experience German engineering excellence with our premium range of kitchen appliances. From built-in ovens to innovative cooktops, elevate your culinary journey.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn-primary" data-testid="shop-now-button">
                Shop Now
              </Link>
              <Link to="/products?category=ovens" className="btn-secondary" data-testid="explore-ovens-button">
                Explore Ovens
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-200">
              <div>
                <p className="text-3xl font-bold text-bosch-navy">15+</p>
                <p className="text-sm text-slate-600">Years Legacy</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-bosch-navy">100K+</p>
                <p className="text-sm text-slate-600">Happy Customers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-bosch-navy">99%</p>
                <p className="text-sm text-slate-600">Satisfaction Rate</p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative h-[600px] rounded-sm overflow-hidden shadow-hover">
            <img
              src="https://media3.bosch-home.com/Images/450x600/25204055_BookanAppointmentforExperienceCenter_WebsiteTeaserBanners_900x12001.webp"
              alt="Premium Dark Kitchen Interior"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;