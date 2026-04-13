import { useState } from "react";

export default function OptionsButtons({ options, handleUserInput }) {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map((opt, i) => (
        <button
          disabled={clicked}
          key={i}
          onClick={() => {
            setClicked(true);
            handleUserInput(opt); 
          }}
          className="px-3 py-1.5 rounded-full cursor-pointer text-xs font-semibold 
          bg-linear-to-r from-gray-700 via-violet-400 to-gray-700
          text-white shadow-lg 
          hover:scale-105 hover:shadow-lg 
          active:scale-95 transition-all duration-200"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}