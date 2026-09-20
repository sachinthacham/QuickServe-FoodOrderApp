import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="relative overflow-hidden bg-slate-50 dark:bg-slate-900 pt-24 pb-32">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-orange-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container relative z-10 mx-auto px-6 text-center md:text-left md:flex md:items-center md:justify-between">
        {/* Left Content */}
        <div className="max-w-xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-medium text-sm animate-fade-in-down">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            Fastest Delivery in Town
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Cravings Satisfied. <br />
            <span className="text-gradient">Lightning Fast.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-light animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Experience enterprise-grade food delivery. Fresh meals from top-rated restaurants, tracked in real-time straight to your door.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <a
              href="#restaurants"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold text-white bg-red-500 rounded-full overflow-hidden transition-transform hover:scale-105 hover:shadow-[0_0_40px_rgba(239,68,68,0.4)]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span>Explore Restaurants</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
            <Link
              to="/signin"
              className="inline-flex items-center justify-center px-8 py-4 font-semibold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Right Image Container - Glassmorphic display */}
        <div className="hidden md:block relative w-full max-w-lg mt-12 md:mt-0 animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-tr from-red-500 to-orange-400 rounded-[2.5rem] blur-2xl opacity-30 transform rotate-6"></div>
          <div className="relative glass-card rounded-[2.5rem] p-4 transform transition-transform hover:-translate-y-2 duration-500">
            <img
              src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80"
              alt="Artisan Pizza"
              className="w-full rounded-[2rem] shadow-lg object-cover aspect-[4/3]"
            />
            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-6 glass-card px-6 py-4 rounded-2xl flex items-center gap-4 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="bg-green-500 p-2 rounded-full text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white">Delivered in</p>
                <p className="text-red-500 font-semibold text-sm">Under 30 mins</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
