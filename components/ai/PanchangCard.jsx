 export const PanchangCard = ({ data }) => {
  return (
    <div className="bg-purple-100 rounded-md p-4 max-w-md shadow-md">
      <h3 className="font-semibold text-purple-700 mb-2">
        📅 Today Panchang
      </h3>

      <div className="space-y-2 text-[13px]">
        <p><span className="font-medium text-purple-600">🪔 Tithi:</span> {data.tithi}</p>
        <p><span className="font-medium text-purple-600">🌟 Nakshatra:</span> {data.nakshatra || "N/A"}</p>
        <p><span className="font-medium text-purple-600">⏳ Rahu Kaal:</span> {data.rahuKaal}</p>
        <p><span className="font-medium text-purple-600">🌅 Sunrise:</span> {data.sunrise || "N/A"}</p>
        <p><span className="font-medium text-purple-600">🌇 Sunset:</span> {data.sunset || "N/A"}</p>
        <p><span className="font-medium text-purple-600">📆 Day:</span> {data.day || "N/A"}</p>
      </div>
    </div>
  );
};