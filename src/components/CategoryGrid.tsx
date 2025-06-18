import React from 'react';
import { Pill, Baby, Heart, Dog, Stethoscope, Flower2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Category } from '../types';

const CategoryGrid: React.FC = () => {
  const { t } = useLanguage();

  const categories: Category[] = [
    {
      id: 'medications',
      name: t('medications'),
      icon: 'Pill',
      image: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg',
      productCount: 1250
    },
    {
      id: 'skincare',
      name: t('skincare'),
      icon: 'Flower2',
      image: 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg',
      productCount: 890
    },
    {
      id: 'vitamins',
      name: t('vitamins'),
      icon: 'Heart',
      image: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg',
      productCount: 650
    },
    {
      id: 'babycare',
      name: t('babycare'),
      icon: 'Baby',
      image: 'https://alldaymedicalcare.com/wp-content/uploads/2023/08/2424258.webp',
      productCount: 420
    },
    {
      id: 'petcare',
      name: t('petcare'),
      icon: 'Dog',
      image: 'https://www.pawsplaycle.com/wp-content/uploads/2023/02/pet-care.jpg',
      productCount: 180
    },
    {
      id: 'medical-devices',
      name: 'Med-Devices',
      icon: 'Stethoscope',
      image: 'https://www.massdevice.com/wp-content/uploads/2021/05/goddard-sponsored-hero-image-june2021.jpg',
      productCount: 320
    }
  ];

  const getIcon = (iconName: string) => {
    const icons = {
      Pill: Pill,
      Flower2: Flower2,
      Heart: Heart,
      Baby: Baby,
      Dog: Dog,
      Stethoscope: Stethoscope
    };
    const Icon = icons[iconName as keyof typeof icons];
    return Icon ? <Icon size={32} /> : <Pill size={32} />;
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-dark-blue"></div>
            <div className="p-3 bg-gradient-to-r from-light-blue to-medium-blue rounded-full">
              <Heart className="text-white w-6 h-6" />
            </div>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-dark-blue"></div>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
            {t('topCategories')}
          </h2>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Explore our comprehensive range of medical categories for all your healthcare needs
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="group cursor-pointer transform hover:scale-105 transition-all duration-500 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="card card-hover overflow-hidden">
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
                
                <div className="p-6 text-center">
                  <div className="mb-4">
                    <div className="inline-flex p-4 bg-gradient-to-r from-light-blue to-medium-blue rounded-full group-hover:from-medium-blue group-hover:to-dark-blue transition-all duration-300">
                      <div className="text-white">
                        {getIcon(category.icon)}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-dark-blue transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-500 text-sm flex items-center justify-center space-x-2">
                    <span>{category.productCount.toLocaleString()} products</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
