import { GET_PRIVACY_PAGE } from "@/app/graphql/gqlQuery";
import serverApollo from "@/utils/serverApollo";
import { notFound } from "next/navigation";

export async function generateMetadata() {
  try {
    const { data } = await serverApollo.query({
      query: GET_PRIVACY_PAGE,
    });

    const page = data?.getPrivacyPage;

    return {
      title: page?.metaTitle || "Privacy Policy | Dhwani Astro",

      description:
        page?.metaDescription || "Read the Privacy Policy of Dhwani Astro.",

      keywords: page?.keywords || [],

      openGraph: {
        title: page?.metaTitle,
        description: page?.metaDescription,
        type: "website",
      },

      twitter: {
        card: "summary_large_image",
        title: page?.metaTitle,
        description: page?.metaDescription,
      },
    };
  } catch {
    return {
      title: "Privacy Policy | Dhwani Astro",
      description: "Read the Privacy Policy of Dhwani Astro.",
    };
  }
}
export default async function PrivacyP() {
  const { data } = await serverApollo.query({
    query: GET_PRIVACY_PAGE,
  });

  const privacy = data?.getPrivacyPage;
  if (!privacy) {
    notFound();
  }

  return (
    <div className="w-full flex flex-col items-center">
       <section className="horo-icons-zod relative w-full mx-auto py-5 mt-1.5 h-36 sm:py-5 px-4 rounded-b-xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: "url('/ds-img/mnew.jpg')",
            }}
          />
        </div>

        <div className="relative service-horocope flex flex-col justify-center">
          <div className="flex flex-col justify-center bg-[#000000c0] px-15 py-5 w-[50%] place-self-center rounded-xl">
            <span className="text-2xl text-white font-bold place-self-center">
              Privacy Policy
            </span>

            <h1 className="text-[#efd335] text-base sm:text-xl text-center font-semibold">
              {privacy?.title}
            </h1>
          </div>
        </div>
      </section>

      <div className="max-w-7xl place-self-center text-black py-5">
        <div className="flex flex-col gap-5">
          <div className="abp"></div>

          <div className="max-w-6xl mx-auto p-4 md:p-4">
            <div className="backdrop-blur-md bg-white/30 border border-white/20 shadow-lg rounded-xl flex flex-col items-center gap-6 p-4 md:p-6 neumorphism-card">
              <div
                className="prose max-w-none text-sm md:text-sm leading-relaxed text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: privacy?.content || "",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
