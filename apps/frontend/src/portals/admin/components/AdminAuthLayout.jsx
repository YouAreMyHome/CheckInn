import { Shield } from 'lucide-react';

const AdminAuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-blue-200">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-blue-300 text-sm">
            © 2025 CheckInn Admin Portal. All rights reserved.
          </p>
          <p className="text-blue-400 text-xs mt-1">
            Need help? Contact{' '}
            <a href="mailto:admin-support@checkinn.com" className="text-blue-200 hover:text-white transition-colors">
              admin-support@checkinn.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminAuthLayout;