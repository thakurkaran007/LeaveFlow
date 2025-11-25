"use client";

export const AdminWelcome = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-red-500">
      <div className="text-center animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 animate-ping opacity-75">
            <div className="w-32 h-32 mx-auto bg-white rounded-full"></div>
          </div>
          <div className="relative animate-bounce">
            <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl">
              <svg className="w-16 h-16 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
            </div>
          </div>
        </div>
        <h1 className="mt-8 text-6xl font-bold text-white animate-slide-up">
          You're the Admin
        </h1>
        <p className="mt-4 text-2xl text-white/90 animate-slide-up-delay">
          Welcome to the control center
        </p>
        <div className="mt-8 flex gap-2 justify-center animate-slide-up-delay-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 bg-white rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.3s both;
        }
        .animate-slide-up-delay {
          animation: slide-up 0.8s ease-out 0.6s both;
        }
        .animate-slide-up-delay-2 {
          animation: slide-up 0.8s ease-out 0.9s both;
        }
      `}</style>
    </div>
  );
};

// HOD Animation Component
export const HODWelcome = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600">
      <div className="text-center animate-fade-in">
        <div className="relative">
          <div className="absolute inset-0 animate-spin-slow opacity-50">
            <div className="w-40 h-40 mx-auto border-8 border-white border-t-transparent rounded-full"></div>
          </div>
          <div className="relative animate-scale-in">
            <div className="w-40 h-40 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl">
              <svg className="w-20 h-20 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
            </div>
          </div>
        </div>
        <h1 className="mt-8 text-6xl font-bold text-white animate-slide-in-left">
          You're the HOD
        </h1>
        <p className="mt-4 text-2xl text-white/90 animate-slide-in-right">
          Head of Department Dashboard
        </p>
        <div className="mt-8 flex gap-4 justify-center animate-fade-in-delay">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-16 bg-white rounded-full animate-wave"
              style={{ animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes wave {
          0%, 100% { height: 4rem; }
          50% { height: 2rem; }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        .animate-scale-in {
          animation: scale-in 0.8s ease-out;
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out 0.3s both;
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out 0.5s both;
        }
        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.8s both;
        }
        .animate-wave {
          animation: wave 1s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
};