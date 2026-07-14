"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import {
  GET_BLOG_BY_SLUG,
  GET_BLOG_CATEGORIES,
  GET_BLOGS,
} from "@/app/graphql/gqlQuery";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";

export default function BlogDetail() {
  const { slug } = useParams();

  const { data, loading, error } = useQuery(GET_BLOG_BY_SLUG, {
    variables: {
      slug,
    },
    skip: !slug,
  });

  const { data: categoryData } = useQuery(GET_BLOG_CATEGORIES);

  const blog = data?.blogBySlug;

  const { data: blogsData } = useQuery(GET_BLOGS);
  const recentBlogs =
    blogsData?.blogs?.filter((item) => item.slug !== slug)?.slice(0, 4) || [];

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(Number(date)).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return <div className="py-20 text-center">Loading...</div>;
  }

  if (error || !blog) {
    return <div className="py-20 text-center">Blog not found</div>;
  }

  return (
    <section className="w-full max-w-6xl border border-gray-200 shadow-xl p-5 px-8 rounded-2xl mx-auto px-4 py-10">
      <div className="flex flex-col gap-2">
        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-bold text-black">
          {blog.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span>{formatDate(blog.createdAt)}</span>

          <span>• Posted By DhwaniAstro</span>
        </div>

        {/* Categories */}
        {blog.categories?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {blog.categories.map((category) => (
              <span
                key={category.id}
                className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}

        {/* Featured Image */}
        {blog.featuredImage && (
          <div className="overflow-hidden rounded-xl">
            <Image
              src={`https://www.dhwaniastro.com${blog.featuredImage}`}
              className="bl-im rounded-2xl"
              width={400}
              height={250}
              alt={blog.title}
              priority
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose max-w-none prose-headings:text-black text-black prose-p:text-black mt-8"
          dangerouslySetInnerHTML={{
            __html: blog.content || "",
          }}
        />
      </div>
    </section>
  );
}
