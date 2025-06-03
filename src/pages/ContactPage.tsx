import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the message to a backend
    setStatus({
      type: 'success',
      message: 'Thank you for your message. We\'ll get back to you soon!'
    });
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-blue-600 dark:bg-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-xl text-blue-100">
              We're here to help! Send us a message and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Get in Touch</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white">Our Location</h3>
                      <p className="mt-1 text-gray-600 dark:text-gray-300">
                        123 Commerce Street<br />
                        Market City, MC 12345
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white">Email Us</h3>
                      <a href="mailto:info@shophub.com" className="mt-1 text-blue-600 dark:text-blue-400 hover:underline">
                        info@shophub.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white">Call Us</h3>
                      <p className="mt-1 text-gray-600 dark:text-gray-300">
                        +1 (555) 123-4567
                      </p>
                    </div>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="mt-12">
                  <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Business Hours</h3>
                  <div className="space-y-2 text-gray-600 dark:text-gray-300">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 10:00 AM - 4:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Send us a Message</h2>

                {status && (
                  <div className="mb-6">
                    <Alert
                      type={status.type}
                      message={status.message}
                      onClose={() => setStatus(null)}
                    />
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    leftIcon={<Send size={18} />}
                  >
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;