import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder }) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search AI tools...'}
        className="w-full pl-12 pr-4 py-4 text-base rounded-full border border-light bg-card focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all"
      />
    </div>
  );
};

export { SearchBar };
