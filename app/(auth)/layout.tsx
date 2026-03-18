import { ReactNode } from "react";
import { BrainCircuit } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

/**
 * Auth layout - split panel design with dark brand panel and white form panel
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col items-center justify-center p-8 text-white">
        <div className="max-w-sm text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center">
              <BrainCircuit className="w-8 h-8 text-white" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold">SalesBrain</h1>
            <p className="text-lg text-slate-300">
              Lead qualification powered by AI
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-primary-400">✓</div>
              <div className="text-sm text-slate-300">
                Automatically qualify leads with AI-powered conversations
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 text-primary-400">✓</div>
              <div className="text-sm text-slate-300">
                Train and test your sales approach with realistic simulations
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 text-primary-400">✓</div>
              <div className="text-sm text-slate-300">
                Get detailed insights and analytics on every conversation
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SalesBrain</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Lead qualification powered by AI
            </p>
          </div>

          {/* Form Content */}
          <div className="space-y-6">{children}</div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center text-xs text-gray-500">
            <p>Secure, AI-powered lead qualification for your business</p>
          </div>
        </div>
      </div>
    </div>
  );
}
