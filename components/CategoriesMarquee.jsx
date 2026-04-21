import { categories } from "../assets/assets";

const CategoriesMarquee = ({ selectedCategory, onToggleCategory }) => {
  return (
    <div className="group relative mx-auto w-full max-w-7xl select-none overflow-hidden py-2 sm:my-20">
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-white to-transparent sm:w-20" />

      <div className="flex min-w-[560%] gap-3 animate-[marqueeScroll_20s_linear_infinite] group-hover:[animation-play-state:paused] sm:min-w-[500%] sm:gap-4 sm:animate-[marqueeScroll_40s_linear_infinite]">
        {[...categories, ...categories, ...categories, ...categories].map((category, index) => (
          <button
            key={`${category}-${index}`}
            type="button"
            onClick={() => onToggleCategory(category)}
            className={`inline-flex shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[11px] leading-none active:scale-95 transition-all duration-300 sm:px-5 sm:text-sm ${
              selectedCategory === category
                ? "bg-slate-700 text-white shadow-sm"
                : "bg-slate-100 text-slate-500 hover:bg-slate-600 hover:text-white"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white to-transparent sm:w-20 md:w-40" />
    </div>
  );
};

export default CategoriesMarquee;
