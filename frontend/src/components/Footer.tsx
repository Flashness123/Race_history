import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold mb-3">Downhill Race History</h3>
            <p className="text-sm text-gray-600">
              Track and discover downhill longboard races around the world. 
              Submit races, view results, and connect with the community.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-gray-600 hover:text-gray-900">Map</Link></li>
              <li><Link href="/riders" className="text-gray-600 hover:text-gray-900">Riders</Link></li>
              <li><Link href="/submit" className="text-gray-600 hover:text-gray-900">Submit Race</Link></li>
              <li><Link href="/login" className="text-gray-600 hover:text-gray-900">Sign In</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3">Info</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-6 text-center text-sm text-gray-500">
          <p>&copy; 2024 Downhill Race History. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
