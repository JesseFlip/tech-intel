
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="py-32 text-center">
    <h1 className="text-6xl font-black text-white mb-4">404</h1>
    <p className="text-slate-500 mb-12 text-lg">Signal lost. This coordinate does not exist.</p>
    <Link to="/" className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20">
      Return to Pulse
    </Link>
  </div>
);

export default NotFound;
