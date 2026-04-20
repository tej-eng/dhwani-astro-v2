// import React from 'react';
// const variantClasses = {
//   half: 'w-[80%]  text-sm sm:text-sm px-4 py-2  border placeholder:text-gray-300 bg-white rounded-full focus:outline-none focus:ring-0 ',
//   full: 'w-full text-sm sm:text-sm px-4 py-2  border placeholder:text-gray-300 bg-white rounded-full focus:outline-none focus:ring-0 ',
// };

// export default function CustomSelect({ ...props }) {
//   const { name, value, onChange, options = [], required, error, className = "", variant } = props;
//   return (
//     <div className="mb-2 w-full">
//       <select {...props}
//         name={name}
//         value={value}
//         onChange={onChange}
//         required={required}
//         className={`${className} ${variantClasses[variant]} ${error ? 'border-red-500' : ''} `}
//       >
//         {options.map((opt, idx) => (
//           <option
//             key={idx}
//             value={opt === "Day" ? "" : opt}
//             style={opt === "Day" ? { color: "red" } : {}}
//             disabled={opt === "Day"}
//           >
//             {opt}
//           </option>
//         ))}
//       </select>
//       {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
//     </div>
//   );
// }


"use client";
import React, { forwardRef } from "react";

const CustomSelect = forwardRef(
  ({label, options = [], error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1 flex flex-col">
              {label && <label className="text-sm font-semibold">{label}</label>}
        <select
          ref={ref}
          className={`w-full border rounded-lg px-3 py-2 outline-none 
            ${error ? "border-red-500" : "border-gray-300"}`}
          {...props}
        >
          <option value="">Select</option>
          {options.map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        {error && (
          <p className="text-red-500 text-[10px]">{error}</p>
        )}
      </div>
    );
  }
);

CustomSelect.displayName = "CustomSelect";
export default CustomSelect;