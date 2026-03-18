import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (category) => {
    onCategoryChange(category);
    setIsOpen(false);
  };

  return (
    <div className="w-full py-6 bg-white border-b border-light">
      <div className="container">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-primary whitespace-nowrap">
            Category:
          </label>
          <div className="relative w-full max-w-sm">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="category-dropdown-trigger"
            >
              <span className="flex-1 text-left">{activeCategory}</span>
              <ChevronDown className={`w-5 h-5 text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsOpen(false)}
                  aria-hidden="true"
                />
                <div className="category-dropdown-menu">
                  <button
                    onClick={() => handleSelect('All')}
                    className={`category-dropdown-item ${activeCategory === 'All' ? 'active' : ''}`}
                  >
                    All Tools
                  </button>
                  <div className="category-dropdown-divider" />
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleSelect(category)}
                      className={`category-dropdown-item ${activeCategory === category ? 'active' : ''}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { CategoryFilter };
