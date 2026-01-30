import { Card } from "@/components/Card"

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="max-w-4xl w-full p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-2xl mb-6">
            <span className="text-4xl font-bold text-white">POS</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mobile POS Application</h1>
          <p className="text-lg text-gray-600">
            A professional Point of Sale system for Android terminals with thermal printer support
          </p>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">React Native / Expo Project</h3>
              <p className="text-yellow-800 text-sm">
                This is a React Native mobile application built with Expo. It cannot run in a web browser preview.
                Follow the setup instructions below to run on Android.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">1. Install Dependencies</h3>
                <code className="block bg-gray-900 text-gray-100 p-3 rounded text-sm">npm install</code>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">2. Start Development Server</h3>
                <code className="block bg-gray-900 text-gray-100 p-3 rounded text-sm">npm start</code>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">3. Run on Android</h3>
                <code className="block bg-gray-900 text-gray-100 p-3 rounded text-sm">npm run android</code>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Demo Credentials</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-semibold">Business ID:</span> BIZ001
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Admin PIN:</span> 1234
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Manager PIN:</span> 5678
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Cashier PIN:</span> 9999
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">🔐 Authentication</h3>
                <p className="text-sm text-gray-600">
                  Business registration, onboarding, and secure PIN-based login with role-based access
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">🛒 POS System</h3>
                <p className="text-sm text-gray-600">
                  Touch-optimized checkout, cart management, multiple payment methods, and receipt printing
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">📦 Inventory</h3>
                <p className="text-sm text-gray-600">
                  Product management, search, low stock alerts, and category organization
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">📊 Reports</h3>
                <p className="text-sm text-gray-600">
                  Sales analytics, revenue tracking, and business insights with role-based access
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Architecture</h2>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Offline-first design with local caching</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Role-based permissions (Admin, Manager, Cashier)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Business-type specific theming</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Backend-ready service layer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Thermal printer integration ready</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              See README.md for complete documentation and setup instructions
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
