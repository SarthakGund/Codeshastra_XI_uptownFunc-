import React from 'react';
import { Check } from 'lucide-react';

const PricingSection: React.FC = () => {
  const pricingPlans = [
    {
      name: 'Hobby',
      price: '$4/mo',
      description: 'Best for occasional listeners',
      features: [
        'Stream music on 1 device',
        'Access to basic music library',
        'Standard audio quality',
        'Ad-supported listening',
        'Create and share playlists'
      ],
      ctaText: 'Get Started',
      ctaLink: '/signup/hobby'
    },
    {
      name: 'Professional',
      price: '$8/mo',
      description: 'Best for regular listeners',
      features: [
        'Stream music on up to 3 devices simultaneously',
        'Access to premium music library',
        'High-definition audio quality',
        'Ad-free listening experience',
        'Download music for offline listening',
        'Create and share unlimited playlists',
        'Access to exclusive content and early releases'
      ],
      ctaText: 'Get Started',
      ctaLink: '/signup/professional'
    },
    {
      name: 'Enterprise',
      price: 'Contact Us',
      description: 'Best for big artists',
      features: [
        'Stream music on unlimited devices',
        'Access to entire music library',
        'Ultra high-definition audio quality',
        'Ad-free listening experience',
        'Download unlimited music for offline listening',
        'Create and share unlimited playlists',
        'Access to exclusive content and early releases',
        'Priority customer support'
      ],
      ctaText: 'Contact Us',
      ctaLink: '/contact'
    }
  ];

  return (
    <div className="w-full bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Choose Your Plan</h2>
          <p className="mt-4 text-xl text-gray-300">Select the perfect plan for your listening needs</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index} 
              className="flex flex-col h-full bg-zinc-900 rounded-lg overflow-hidden"
            >
              <div className="p-6 flex-grow">
                <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-bold">{plan.price}</span>
                </div>
                <p className="text-gray-300 mb-6">{plan.description}</p>
                
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center mr-2">
                        <Check size={16} className="text-white" />
                      </div>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="p-6 mt-auto">
                <a
                  href={plan.ctaLink}
                  className="block w-full py-4 px-6 text-center font-medium bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors duration-200"
                >
                  {plan.ctaText}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingSection;