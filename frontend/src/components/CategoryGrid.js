import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const categories = [
  {
    name: 'Built-in Ovens',
    slug: 'ovens',
    image: 'https://images.unsplash.com/photo-1723259461381-59ab9fa18f5d?w=600&q=80',
    description: 'Premium cooking perfection'
  },
  {
    name: 'Induction Cooktops',
    slug: 'cooktops',
    image: 'https://images.unsplash.com/photo-1762810931790-40b25e10b3e7?w=600&q=80',
    description: 'Smart & efficient heating'
  },
  {
    name: 'Dishwashers',
    slug: 'dishwashers',
    image: 'https://images.unsplash.com/photo-1676907228185-6869277a9f8f?w=600&q=80',
    description: 'Silent cleaning technology'
  },
  {
    name: 'Kitchen Chimneys',
    slug: 'chimneys',
    image: 'https://images.unsplash.com/photo-1760067537565-1d4cbb8da0c3?w=600&q=80',
    description: 'Powerful ventilation systems'
  }
];

const CategoryGrid = () => {
  return (
    <section className="section-spacing bg-white" data-testid="category-grid-section">
      <div className="container-custom">
        <div className="text-center mb-16">
          <p className="caption-text text-bosch-red mb-4">EXPLORE BY CATEGORY</p>
          <h2 className="subheading-text text-bosch-navy">Premium Kitchen Solutions</h2>
        </div>

        <div className="bento-grid">
          {categories.map((category, index) => (
            <Link
              key={category.slug}
              to={`/products?category=${category.slug}`}
              className={`group relative overflow-hidden rounded-sm shadow-soft hover:shadow-hover transition-all duration-300 ${
                index === 0 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
              data-testid={`category-card-${category.slug}`}
            >
              <div className="relative h-full min-h-[300px]">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold font-heading mb-2">{category.name}</h3>
                  <p className="text-sm text-white/90 mb-4">{category.description}</p>
                  <div className="inline-flex items-center space-x-2 text-sm font-medium">
                    <span>Shop Now</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;