import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container mx-auto px-6 py-24 text-center">
      <p className="text-6xl font-black text-red-500">404</p>
      <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
        Page not found
      </h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        The page you are looking for does not exist or has moved.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center justify-center px-8 py-4 font-semibold text-white bg-red-500 rounded-full hover:bg-red-600 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
