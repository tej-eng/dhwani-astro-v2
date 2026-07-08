"use client";

import Image from "next/image";

import { BiSolidBadgeCheck } from "react-icons/bi";
import StarRating from "@/components/Homepagecomp/Remedosha/StarRating";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import CustomButton from "@/components/Custom/CustomButton";
import GiftPop from "@/components/Smcompo/GiftPop";
import { useLanguage } from "@/app/context/LangContext";
import { AlertLoading, SingleButton } from "@/app/common";

import { useRouter } from "next/navigation";
import { GET_ASTROLOGER_BY_ID, GET_ASTROLOGER_REVIEWS } from "@/app/graphql/gqlQuery";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import RecentRequestPopup from "@/components/Custom/RecentRequestPopUp";
export const FOLLOW_ASTROLOGER = gql`
  mutation FollowAstrologer($astrologerId: ID!) {
    followAstrologer(astrologerId: $astrologerId) {
      success
      message
    }
  }
`;

export const UNFOLLOW_ASTROLOGER = gql`
  mutation UnfollowAstrologer($astrologerId: ID!) {
    unfollowAstrologer(astrologerId: $astrologerId) {
      success
      message
    }
  }
`;

export const IS_FOLLOWING = gql`
  query IsFollowing($astrologerId: ID!) {
    isFollowing(astrologerId: $astrologerId) {
      isFollowing
    }
  }
`;

export const GET_ASTROLOGER_FOLLOWERS_COUNT = gql`
  query GetAstrologerFollowersCount($astrologerId: ID!) {
    getAstrologerFollowersCount(astrologerId: $astrologerId) {
      totalFollowers
    }
  }
`;

export default function ProfileAstro({ astrologerId }) {
  const router = useRouter();
  const id = astrologerId;
const [showRecentPopup, setShowRecentPopup] = useState(false);
const [selectedMode, setSelectedMode] = useState("");
const openRequestPopup = (mode) => {
  setSelectedMode(mode);
  setShowRecentPopup(true);
};
  const {
    data: astrologerResponse,
    loading: astrologerloading,
    error,
  } = useQuery(GET_ASTROLOGER_BY_ID, {
    variables: {
      id,
    },
    skip: !id,
    fetchPolicy: "network-only",
  });
  console.log("Astrologer ID:", id);
  console.log("Skip Value:", !id);


 const {
  data: followStatusData,
  loading: followLoadingStatus,
  error: followError,
  refetch: refetchFollow,
} = useQuery(IS_FOLLOWING, {
  variables: {
    astrologerId: id,
  },
  skip: !id,
  fetchPolicy: "network-only",
  notifyOnNetworkStatusChange: true,
});

  const {
    data: followersCountData,
    loading: followersCountLoading,
    error: followersCountError,
    refetch: refetchFollowersCount,
  } = useQuery(GET_ASTROLOGER_FOLLOWERS_COUNT, {
    variables: {
      astrologerId: id,
    },
    skip: !id,
    fetchPolicy: "network-only",
  });
  const followersCount =
    followersCountData?.getAstrologerFollowersCount?.totalFollowers || 0;
 


  const astrologerdetail = astrologerResponse?.getAstrologerById;
  const { messages: t } = useLanguage();

  const [showGiftPopup, setShowGiftPopup] = useState(false);

  const [astrofollow, setAstroFollow] = useState(false);

 useEffect(() => {
  setAstroFollow(
    followStatusData?.isFollowing?.isFollowing ?? false
  );
}, [followStatusData]);

  const [followAstrologer, { loading: followLoading }] =
    useMutation(FOLLOW_ASTROLOGER);

  const [unfollowAstrologer, { loading: unfollowLoading }] =
    useMutation(UNFOLLOW_ASTROLOGER);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // const astrologerlist = useMemo(() => {
  //   const list = astrologersData?.filter((item) => item.availability === 1);
  //   return list;
  // }, []);

  const useunfollow = () => setShowConfirmModal(true);

  const unfollow = async (confirm) => {
    if (!confirm) return;

    try {
      const { data } = await unfollowAstrologer({
        variables: {
          astrologerId: id,
        },
      });

      if (data?.unfollowAstrologer?.success) {
        setAstroFollow(false);

        await Promise.all([refetchFollow(), refetchFollowersCount()]);

        toast.success(
          data.unfollowAstrologer.message ||
            "Astrologer unfollowed successfully",
        );
      }

      setShowConfirmModal(false);
    } catch (error) {
      toast.error(error.message);
    }
  };
  const follow = async () => {
    try {
      const { data } = await followAstrologer({
        variables: {
          astrologerId: id,
        },
      });

      if (data?.followAstrologer?.success) {
        setAstroFollow(true);

        await Promise.all([refetchFollow(), refetchFollowersCount()]);

        toast.success(
          data.followAstrologer.message || "Astrologer followed successfully",
        );
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  const { data: reviewResponse } = useQuery(GET_ASTROLOGER_REVIEWS, {
  variables: {
    astrologerId: id,
    page: 1,
    limit: 10,
  },
  skip: !id,
});
const reviews =
  reviewResponse?.getAstrologerReviews?.data || [];
  if (astrologerloading) {
    return (
      <div className="text-center text-gray-600 mt-10">
        Loading astrologer details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-10">{error.message}</div>
    );
  }

  if (!astrologerdetail) {
    return (
      <div className="text-center text-gray-600 mt-10">
        Astrologer not found
      </div>
    );
  }

  const chatPricing = astrologerdetail?.pricing?.find(
    (item) => item.type === "CHAT",
  );
  const callPricing = astrologerdetail?.pricing?.find(
  (item) => item.type === "CALL"
);

  return (
    <div className="w-full p-3 pt-5 md:pt-5">
      <div className="max-w-7xl p-3 mx-auto rounded-lg shadow-md  md:p-6">
        <div className="flex items-start relative overflow-hidden justify-evenly bg-linear-to-r from-yellow-100 p-3 rounded-2xl md:p-6 via-yellow-50 to-yellow-100 flex-col gap-5 sm:flex-row md:gap-10">
          {!astrologerdetail?.astro_tag ? (
            <></>
          ) : (
            <div className="celeb-tag absolute -rotate-45 top-4 left-[-35px] z-20">
              <span className="bg-[#ffd70a] p-1 text-[9px] text-black w-30 inline-block text-center  px-8">
                {astrologerdetail?.astro_tag}
              </span>
            </div>
          )}

          <div className="flex flex-col items-center justify-center gap-2">
            <Image
              src={
                astrologerdetail?.profilePic
                  ? `https://www.dhwaniastro.com${astrologerdetail.profilePic}`
                  : "/man.png"
              }
              alt="image"
              width={100}
              height={100}
              className="border-4 border-yellow-400 rounded-full w-35 h-35 object-cover"
            />
            {followLoadingStatus ? (
              <CustomButton variant="yellow" disabled>
                Please Wait...
              </CustomButton>
            ) : astrofollow ? (
              <CustomButton
                variant="yellow"
                disabled={unfollowLoading}
                onClick={useunfollow}
              >
                {unfollowLoading ? "Please Wait..." : "Following"}
              </CustomButton>
            ) : (
              <CustomButton
                variant="yellow"
                disabled={followLoading}
                onClick={follow}
              >
                {followLoading ? "Please Wait..." : "Follow"}
              </CustomButton>
            )}

            <button
              onClick={() => setShowGiftPopup(true)}
              className="relative shine-text mt-7 px-5 py-2 rounded-full text-white font-medium
             bg-linear-to-r from-pink-500 to-red-500 shadow-[4px_4px_8px_rgba(0,0,0,0.2)]
             overflow-hidden transition-transform duration-300 hover:scale-105"
              aria-label="Send Gift to Astrologer"
            >
              🎁 Send Gift
            </button>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row md:items-start sm:gap-5 lg:gap-20">
            <div className="flex flex-col gap-2 py-2 text-sm md:text-base">
              <h2 className="flex items-center gap-1 text-xl text-gray-800 sm:text-xl sm:font-bold lg:text-3xl lg:font-semibold">
                {astrologerdetail?.displayName || astrologerdetail?.name}
                <BiSolidBadgeCheck className="w-5 h-5 text-green-500" />
              </h2>

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-600 rounded-full"></span>
                <span className="text-base font-semibold text-green-600">
                  Available
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-semibold text-black">
                  {astrologerdetail?.rating || 0}/5
                </span>
                <StarRating
                  className="text-yellow-500"
                  onRate={(val) => console.log("Rated:", val)}
                />
              </div>

              <span className="text-sm font-semibold text-black">
                {astrologerdetail?.totalSessions || 0} + Satisfied Consultations
              </span>
{/* 
              <div className="flex flex-col mt-0 text-sm text-gray-700 sm:gap-1 lg:gap-1">
                <span className="font-semibold">Call/Chat Charges:</span>
                <span className="font-bold charge-price flex items-center gap-2">
                  {astro?.disc_chat_charge ? (
                    <>
                      <span className="text-lg text-red-600 font-extrabold">
                        ₹{astro.disc_chat_charge}
                      </span>
                      <span className="line-through text-gray-500 text-sm">
                        ₹{astro.astro_chat_charges}/min
                      </span>
                    </>
                   ) : (
                    <span className="text-lg">
                      ₹{astro.astro_chat_charges}/min
                    </span>
                  )}
                  {chatPricing?.offerPrice ? (
                    <>
                      <span className="text-lg text-red-600 font-extrabold">
                        ₹{chatPricing.offerPrice}
                      </span>

                      <span className="line-through text-gray-500 text-sm">
                        ₹{chatPricing.price}/min
                      </span>
                    </>
                  ) : (
                    <span>₹{chatPricing?.price}/min</span>
                  )}
                </span>
              </div> */}
            </div>

            <div className="sm:w-60 lg:w-120 w-full flex flex-col text-black">
              <div className="space-y-2 text-sm sm:text-sm lg:text-base">
                <div className="grid grid-cols-2 gap-5">
                  <span className="font-semibold">Experience</span>
                  <span>{astrologerdetail?.experience} Years</span>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <span className="font-semibold">Language</span>
                  <span>{astrologerdetail?.languages?.join(", ")}</span>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <span className="font-semibold">Skills</span>
                  <span>{astrologerdetail?.skills?.join(", ")}</span>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <span className="font-semibold">Expertise</span>
                  <span>{astrologerdetail?.problems?.join(", ")}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-5 mt-6 text-sm sm:flex-col lg:flex-row md:text-base">
              <div className="flex gap-3 w-full">
  <CustomButton
    variant="green"
    className="flex-1"
    disabled={
      !astrologerdetail?.isOnline || !astrologerdetail?.isChatActive
    }
    onClick={() => openRequestPopup("chat")}
  >
    Chat ₹
    {chatPricing?.offerPrice || chatPricing?.price || 0}/min
  </CustomButton>

  <CustomButton
    variant="yellow"
    className="flex-1"
    disabled={
      !astrologerdetail?.isOnline || !astrologerdetail?.isCallActive
    }
    onClick={() => openRequestPopup("call")}
  >
    Call ₹
    {callPricing?.offerPrice || callPricing?.price || 0}/min
  </CustomButton>
</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="p-4 mt-4 border   shadow bg-linear-to-r from-purple-50  rounded-2xl md:p-6 via-violet-50 to-yellow-50">
            <h3 className="mb-1 text-lg font-bold text-gray-800">About Me</h3>
            <div className="text-sm text-gray-700">
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    astrologerdetail?.about || "No description available.",
                }}
              />
            </div>
          </div>

          <div className="astro-rate flex flex-col md:flex-row gap-8 py-6 rounded-2xl">
            <div className="as-tate-simi shadow-xl rounded-2xl p-4 flex-1 bg-linear-to-r from-purple-50  md:p-6 via-violet-50 to-yellow-50">
              <div className="flex flex-col items-center justify-center text-center">
                <h5 className="text-lg font-semibold mb-4 text-gray-800">
                  Check Similar Consultants
                </h5>

                <div className="flex flex-wrap justify-center gap-4">
                  {false > 0 ? (
                    astrologerlist.map((astro, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-around gap-3 bg-[#ffffffe7] rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 p-3 w-[220px]"
                      >
                        <Image
                          src={`/ds-img/${astro?.profile_image}`}
                          alt="image"
                          width={60}
                          height={60}
                          className="rounded-full object-cover"
                          onClick={() =>
                            router.push(`/astrologerprofile/${astro?.id}`)
                          }
                        />

                        <div className="flex flex-col items-start">
                          <Link href={`/astrologerprofile/${astro?.id}`}>
                            <h5 className="font-medium text-gray-700 hover:text-blue-600 transition-colors">
                              {astro?.full_name || "Unknown"}
                            </h5>
                          </Link>
                          <Link href={`/astrologerprofile/${astro?.id}`}>
                            <span className="text-sm text-gray-500">
                              ₹{astro.disc_chat_charge ?? 0}/min
                            </span>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">
                      No similar consultants found.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col shadow-xl rounded-2xl p-4 items-center flex-1 bg-linear-to-r from-yellow-50 md:p-6 via-violet-50 to-purple-100">
              <h5 className="text-lg font-semibold text-gray-800 text-center mb-4">
                Ratings & Reviews
              </h5>

              {reviews?.length > 0 ? (
                <>
                  <div className="w-full max-w-xl space-y-5">
                   {(reviews || [])
  .slice(0, showAll ? reviews.length : 3)
  .map((review) => (
                        <div
                          key={review.id}
                          className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-4"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h5 className="font-semibold text-gray-700">
                              {review?.userName?.split(" ")[0] || "User"}
                            </h5>

                            <div className="text-right">
                              <p className="text-xs text-gray-400">
                                {new Date(Number(review.createdAt)).toLocaleDateString("en-IN", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Kolkata",
})}
                              </p>

                              <div>
                                {[...Array(review?.rating || 0)].map(
                                  (_, index) => (
                                    <span
                                      key={index}
                                      style={{
                                        color: "gold",
                                        fontSize: "18px",
                                      }}
                                    >
                                      ★
                                    </span>
                                  ),
                                )}
                              </div>
                            </div>
                          </div>

                          <hr className="border-gray-200 mb-3" />

                          <div className="text-sm italic text-gray-600 mb-2">
                            {review?.comment}
                          </div>

                          {review?.reply && (
                            <div className="bg-gray-50 p-3 rounded-md text-sm text-black border-l-4 border-blue-400">
                              <strong className="text-gray-700">
                                Astrologer:
                              </strong>{" "}
                              <i>{review.reply}</i>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                  {!showAll && reviews?.length > 3 && (
                    <div className="mt-5">
                      <button
                        onClick={() => setShowAll(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm transition-all"
                      >
                        View More
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-500">No reviews yet</div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="font-semibold text-black">
                {astrologerdetail?.rating || 0}/5
              </span>

              <StarRating
                className="text-yellow-500"
                onRate={(val) => console.log("Rated:", val)}
              />
            </div>

            <div className="text-sm font-medium text-gray-700">
              👥 {followersCount} Followers
            </div>
          </div>
        </div>
      </div>

 {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="p-6 bg-white rounded-lg shadow-lg">
            <p className="text-sm text-center text-black">
              Are you sure you want to unfollow{" "}
              {astrologerdetail?.displayName || astrologerdetail?.name}?
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                aria-label="Confirm Unfollow"
                className="px-4 py-2 text-white bg-green-500 rounded-md"
                onClick={() => unfollow(true)}
              >
                Yes
              </button>
              <button
                aria-label="Cancel Unfollow"
                className="px-4 py-2 text-white bg-red-500 rounded-md"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <GiftPop
        open={showGiftPopup}
        astrologername={astrologerdetail?.displayName || astrologerdetail?.name}
        astro_id={astrologerdetail?.id}
        onClose={() => setShowGiftPopup(false)}
      />
<RecentRequestPopup
  show={showRecentPopup}
  onClose={() => setShowRecentPopup(false)}
  astroId={astrologerdetail?.id}
  mode={selectedMode}
  astrologer={astrologerdetail}
/>
      <AlertLoading
        show={followLoading || unfollowLoading}
        title="Please Wait..."
      />
    </div>
  );
}