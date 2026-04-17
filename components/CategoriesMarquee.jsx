import { categories } from "../assets/assets";

const CategoriesMarquee = ({ selectedCategory, onToggleCategory }) => {
  return (
    <div className="overflow-hidden w-full relative max-w-7xl mx-auto select-none group sm:my-20">
      <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />

      <div className="flex min-w-[500%] animate-[marqueeScroll_20s_linear_infinite] sm:animate-[marqueeScroll_40s_linear_infinite] group-hover:[animation-play-state:paused] gap-4">
        {[...categories, ...categories, ...categories, ...categories].map((category, index) => (
          <button
            key={`${category}-${index}`}
            type="button"
            onClick={() => onToggleCategory(category)}
            className={`px-5 py-2 rounded-lg text-xs sm:text-sm active:scale-95 transition-all duration-300 ${
              selectedCategory === category
                ? "bg-slate-700 text-white shadow-sm"
                : "bg-slate-100 text-slate-500 hover:bg-slate-600 hover:text-white"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
    </div>
  );
};

export default CategoriesMarquee;
