import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-white/20 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <h3 className="font-bold text-lg bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Downhill Radar
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed max-w-md">
              Track and discover downhill longboard races around the world. 
              Submit races, view results, and connect with the community of passionate riders.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mr-2 group-hover:bg-blue-600 transition-colors duration-200"></span>
                  Map
                </Link>
              </li>
              <li>
                <Link href="/riders" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mr-2 group-hover:bg-blue-600 transition-colors duration-200"></span>
                  Riders
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mr-2 group-hover:bg-blue-600 transition-colors duration-200"></span>
                  Submit Race
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mr-2 group-hover:bg-blue-600 transition-colors duration-200"></span>
                  Sign In
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Info</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mr-2 group-hover:bg-blue-600 transition-colors duration-200"></span>
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors duration-200 flex items-center group">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mr-2 group-hover:bg-blue-600 transition-colors duration-200"></span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              &copy; 2024 Downhill Radar. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
