"use client";
import React, { forwardRef } from "react";

const CustomInput = forwardRef(
  ({ label, type = "text", error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1 flex flex-col">
        {label && <label className="text-xs sm:text-sm text-black font-semibold">{label}</label>}

        <input
          ref={ref} // ✅ MUST for RHF
          type={type}
          className={`w-full border  shadow-2xl rounded-lg px-3 py-2 mt-1 outline-none 
            ${error ? "border-red-500" : "border-gray-300"}`}
          {...props}
        />

        {error && (
          <p className="text-red-500 text-[10px]">{error}</p>
        )}
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";
export default CustomInput;