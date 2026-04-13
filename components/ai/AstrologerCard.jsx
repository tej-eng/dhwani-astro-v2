export const AstrologerCard = ({ data }) => {
  return (
    <div className="bg-gradient-to-br from-purple-900 to-black text-white p-4 rounded-2xl shadow-xl w-[260px] animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center gap-3">
        <img
          src="https://i.pravatar.cc/100?img=12"
          alt="astro"
          className="w-12 h-12 rounded-full border-2 border-yellow-400"
        />
        <div>
          <h3 className="font-semibold text-sm">{data.name}</h3>
          <p className="text-xs text-gray-300">{data.specialty}</p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center justify-between mt-3 text-xs">
        <span className="bg-yellow-400 text-black px-2 py-0.5 rounded-full">
          {data.rating}
        </span>
        <span className="text-green-400 font-semibold">{data.price}</span>
      </div>

      {/* CTA */}
      <div className="flex gap-2 mt-4">
        <button className="flex-1 bg-green-500 text-white py-1 rounded-lg text-xs hover:scale-105 transition">
          Chat
        </button>
        <button className="flex-1 bg-blue-500 text-white py-1 rounded-lg text-xs hover:scale-105 transition">
          Call
        </button>
      </div>
    </div>
  );
};