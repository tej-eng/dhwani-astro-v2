export const RemedyCards = ({ data }) => {
  return (
    <div className="flex gap-4 overflow-x-auto py-2 px-1">
      {data.map((item, i) => (
        <div
          key={i}
          className="min-w-[220px] bg-white rounded-2xl shadow-lg p-3 hover:scale-105 transition-all duration-300 border border-gray-100"
        >
          {/* Image */}
          <div className="relative">
            <img
              src={
                item.type === "puja"
                  ? "https://images.unsplash.com/photo-1604608672516-7b6bb1c5e6c4"
                  : item.type === "rudraksha"
                  ? "https://images.unsplash.com/photo-1594737625785-cb3c76a97f65"
                  : "https://images.unsplash.com/photo-1581092335397-9583eb92d232"
              }
              alt={item.title}
              className="w-full h-28 object-cover rounded-xl"
            />

            <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">
              Recommended
            </span>
          </div>

          {/* Content */}
          <h3 className="text-sm font-semibold mt-2">{item.title}</h3>
          <p className="text-xs text-gray-500">{item.desc}</p>

          {/* Price */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-green-600 font-bold">{item.price}</span>
          </div>

          {/* CTA */}
          <button className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-1.5 rounded-lg text-xs hover:scale-105 transition">
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
};