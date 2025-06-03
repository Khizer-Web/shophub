import React from 'react';
import { Package, Truck, Shield, Users } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-blue-600 dark:bg-blue-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About ShopHub</h1>
            <p className="text-lg md:text-xl text-blue-100">
              Your trusted destination for quality products and exceptional shopping experiences.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">Our Mission</h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-8">
              At ShopHub, we're committed to revolutionizing the online shopping experience. Our mission is to provide customers with a seamless, secure, and enjoyable shopping journey, offering high-quality products at competitive prices.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-12 text-center">Why Choose Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Quality Products</h3>
              <p className="text-gray-600 dark:text-gray-300">Carefully curated selection of premium products from trusted brands.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Fast Delivery</h3>
              <p className="text-gray-600 dark:text-gray-300">Quick and reliable shipping to get your products to you on time.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Secure Shopping</h3>
              <p className="text-gray-600 dark:text-gray-300">Your security is our priority with safe payment methods and data protection.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Customer Support</h3>
              <p className="text-gray-600 dark:text-gray-300">Dedicated support team ready to assist you with any questions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">Our Story</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                Founded in 2023, ShopHub began with a simple idea: to create an online marketplace that puts customers first. We understood the challenges of online shopping and set out to build a platform that would address these pain points head-on.
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                Today, we're proud to serve thousands of customers, offering a wide range of products across multiple categories. Our commitment to quality, transparency, and customer satisfaction remains at the heart of everything we do.
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                As we continue to grow, we remain focused on innovation and improvement, always looking for new ways to enhance your shopping experience.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;