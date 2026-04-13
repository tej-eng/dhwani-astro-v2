export const SnapshotCard = ({ data }) => {
    const energyColor =
  data.energy > 70
    ? "bg-green-500"
    : data.energy > 50
    ? "bg-yellow-500"
    : "bg-red-500";
    return (
        <div className="bg-yellow-100 rounded-md p-4 max-w-md shadow-md">
            <h3 className="font-semibold text-yellow-700 mb-2">
                🌟 Astro Snapshot
            </h3>
            <div className="mt-2">
                <div className="h-2 bg-gray-200 rounded-full">
                    <div className={`h-2 ${energyColor} rounded-full`} />
            
                </div>
            </div>

            <div className="space-y-2 text-[13px]">
                <p><span className="font-medium text-yellow-700">⚡ Energy:</span> {data.energy}/100</p>
                <p><span className="font-medium text-yellow-700">🙂 Mood:</span> {data.mood}</p>
                <p><span className="font-medium text-yellow-700">🎯 Focus:</span> {data.focus}</p>
                <p><span className="font-medium text-yellow-700">⚠️ Risk:</span> {data.risk}</p>
                <p><span className="font-medium text-yellow-700">⏰ Lucky Time:</span> {data.luckyTime}</p>
            </div>
        </div>
    );
};