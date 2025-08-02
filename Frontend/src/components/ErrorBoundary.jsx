import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-zinc-800 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-amber-400 mb-4">เกิดข้อผิดพลาด</h1>
            <p className="text-zinc-300 mb-6">ขออภัย เกิดข้อผิดพลาดบางอย่าง กรุณารีเฟรชหน้าเว็บ</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg font-medium"
            >
              รีเฟรชหน้า
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="text-zinc-400 cursor-pointer">รายละเอียดข้อผิดพลาด</summary>
                <pre className="mt-2 text-xs text-red-400 bg-zinc-900 p-4 rounded overflow-auto">
                  {this.state.error && this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
