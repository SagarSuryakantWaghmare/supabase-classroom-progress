import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600">EduTrack</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-blue-600 hover:bg-blue-50">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Empower Your Classroom Management
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
          Streamline student progress tracking, assignments, and communication in one powerful platform designed for educators.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link href="/signup">
            <Button size="lg" className="text-lg py-6 px-8 bg-blue-600 hover:bg-blue-700">
              Start Free Trial
            </Button>
          </Link>
          <Link href="/features">
            <Button variant="outline" size="lg" className="text-lg py-6 px-8 border-blue-600 text-blue-600 hover:bg-blue-50">
              Learn More
            </Button>
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-1 max-w-5xl mx-auto">
          <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">Platform Preview</span>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need in One Place
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Track Progress',
                description: 'Monitor student performance with real-time analytics and detailed reports.',
                icon: '📊'
              },
              {
                title: 'Assign & Grade',
                description: 'Create assignments, collect submissions, and provide feedback all in one place.',
                icon: '📝'
              },
              {
                title: 'Engage Students',
                description: 'Foster better communication and collaboration in your classroom.',
                icon: '💬'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to transform your classroom?</h2>
          <p className="text-xl mb-8 text-blue-100">Join thousands of educators who are already using our platform.</p>
          <Link href="/signup">
            <Button size="lg" className="text-lg py-6 px-8 bg-white text-blue-600 hover:bg-blue-50">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <span className="text-xl font-bold text-white">EduTrack</span>
              <p className="text-gray-400 mt-2">Empowering educators, inspiring students.</p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">Product</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Integrations</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">Support</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white">Help Center</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Contact Us</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} EduTrack. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
