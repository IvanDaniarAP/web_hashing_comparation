import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Shield, 
  BarChart3, 
  Coins, 
  Hash, 
  Globe,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      icon: Hash,
      title: 'Advanced Hashing',
      description: 'Test SHA512, BLAKE3, and combined hashing algorithms with real-time performance metrics.'
    },
    {
      icon: Shield,
      title: 'Security Testing',
      description: 'Comprehensive security analysis with collision resistance and entropy testing.'
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Detailed performance comparisons with throughput and latency measurements.'
    },
    {
      icon: Coins,
      title: 'Stable Coin Simulation',
      description: 'Test stable coin transactions with various hashing methods and blockchain integration.'
    }
  ];

  const hashingMethods = [
    {
      name: 'SHA512',
      description: 'Secure Hash Algorithm 512-bit, widely used cryptographic hash function.',
      advantages: ['High security', 'Standardized', 'Well-tested']
    },
    {
      name: 'BLAKE3',
      description: 'Modern cryptographic hash function designed for speed and security.',
      advantages: ['Fast performance', 'Parallel processing', 'Modern design']
    },
    {
      name: 'SHA512 + BLAKE3',
      description: 'Combined approach leveraging strengths of both algorithms.',
      advantages: ['Enhanced security', 'Balanced performance', 'Redundant protection']
    }
  ];

  const testingStages = [
    'Data Input & Preprocessing',
    'Hash Generation',
    'Performance Measurement',
    'Security Analysis',
    'Result Comparison',
    'Report Generation'
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">StableCoin Platform</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/signin" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md font-medium"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Advanced Blockchain
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {' '}Hashing Platform
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Test and compare the performance of SHA512, BLAKE3, and combined hashing algorithms 
              in a comprehensive stable coin simulation environment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center"
              >
                Start Testing
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link 
                to="#learn-more" 
                className="border border-white/20 text-white px-8 py-4 rounded-lg font-medium hover:bg-white/10 transition-all duration-200"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="learn-more" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive Testing Suite
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform provides everything you need to test, analyze, and compare 
              different hashing algorithms in blockchain applications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Hashing Methods Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Supported Hashing Methods
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Compare the performance and security characteristics of different hashing algorithms.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {hashingMethods.map((method) => (
              <div key={method.name} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{method.name}</h3>
                <p className="text-gray-600 mb-4">{method.description}</p>
                <div className="space-y-2">
                  {method.advantages.map((advantage) => (
                    <div key={advantage} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">{advantage}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testing Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Testing Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive testing methodology ensures accurate and reliable results.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testingStages.map((stage, index) => (
              <div key={stage} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 ml-3">{stage}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blockchain Information Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Hashing Matters in Blockchain
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Cryptographic hashing is the foundation of blockchain security. It ensures data integrity, 
                  enables secure transactions, and provides the immutability that makes blockchain technology reliable.
                </p>
                <p>
                  Our platform allows you to test different hashing algorithms to understand their performance 
                  characteristics, security properties, and suitability for various blockchain applications.
                </p>
                <p>
                  By comparing SHA512, BLAKE3, and combined approaches, you can make informed decisions 
                  about which hashing method best suits your specific use case.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
              <Globe className="w-16 h-16 text-blue-600 mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">What You'll Learn</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Hash function performance comparison</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Security analysis and collision resistance</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Real-world blockchain application scenarios</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Optimal algorithm selection strategies</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Testing?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join our platform and discover the performance characteristics of different hashing algorithms.
          </p>
          <Link 
            to="/signup" 
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200 inline-flex items-center"
          >
            Create Your Account
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">StableCoin Platform</span>
            </div>
            <p className="text-gray-400">
              Advanced blockchain hashing testing platform for developers and researchers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;