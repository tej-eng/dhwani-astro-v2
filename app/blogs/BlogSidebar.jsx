"use client";

import Image from "next/image";
import Link from "next/link";

export default function BlogSidebar({ categories, recentBlogs }) {
  return (
    <div className="space-y-10">
      {/* Categories */}

      <div className="blog-cat-nw rounded-2xl md:block">
        <h6 className="text-xl font-semibold text-center  text-black">
          Category
        </h6>
        <div className="bl-cat-main-nw grid grid-cols-3 lg:grid-cols-2 gap-3">
          {categories.map((category) => (
            <Link
              href={`/blogs/category/${category.slug}`}
              key={category.id}
              className="category-nw flex flex-col items-center justify-center"
            >
              <div className="bl-cat-nw">{category.name?.charAt(0)}</div>

              <h6 className="text-xs md:font-semibold text-black text-center">
                {category.name}
              </h6>
            </Link>
          ))}
        </div>
      </div>

      <div className="blog-cat zoom-image bg-purple-200 rounded-xl p-2">
        <h5 className="text-center  text-black text-lg font-semibold py-2">
          Recent Blogs{" "}
        </h5>
        <div className="flex flex-col gap-2">
          {recentBlogs.map((item) => (
            <Link key={item.id} href={`/blogs/${item.slug}`}>
              <div className="bg-[#ffffffba] pr-2 rounded-full flex gap-2 items-center hover:scale-102">
                <div className="trend-bi w-14 h-14 rounded-full overflow-hidden">
                  <Image
                    src={`https://www.dhwaniastro.com${item.featuredImage}`}
                    width={100}
                    height={100}
                    alt={item.title}
                    unoptimized
                    className="object-cover w-full h-full"
                  />
                </div>

                <p className="text-[14px] w-60 text-gray-600 line-clamp-2">
                  {item.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
