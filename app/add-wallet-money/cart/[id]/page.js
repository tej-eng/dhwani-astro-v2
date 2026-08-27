"use client";

import { useParams } from "next/navigation";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import PayOPT from "@/components/Smcompo/Paycomp/PayOPT";
import { GET_COUPONS } from "@/app/graphql/gqlQuery";
import { useState } from "react";
import Swal from "sweetalert2";
const GET_SINGLE_PACK = gql`
  query GetRechargePackById($id: ID!) {
    getRechargePackById(id: $id) {
      id
      name
      price
      coins
      talktime
      validityDays
    }
  }
`;

export default function CartPage() {
  const [couponCode, setCouponCode] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const { data: couponData } = useQuery(GET_COUPONS);
  const params = useParams();
  const packId = params?.id;

  const { data, loading, error } = useQuery(GET_SINGLE_PACK, {
    variables: { id: packId },
    skip: !packId,
  });

  const pack = data?.getRechargePackById;

  if (loading) {
    return <div className="p-6 text-center">Loading pack details...</div>;
  }

  if (error || !pack) {
    return (
      <div className="p-6 text-center text-red-500">Invalid Recharge Pack</div>
    );
  }

  const gstAmount = (pack.price * 18) / 100;
  const totalBeforeDiscount = pack.price + gstAmount;

  let discountAmount = 0;

  if (selectedCoupon) {
    if (selectedCoupon.type === "FLAT") {
      discountAmount = selectedCoupon.flatAmount;
    } else {
      discountAmount = (totalBeforeDiscount * selectedCoupon.percentage) / 100;

      if (
        selectedCoupon.maxDiscount &&
        discountAmount > selectedCoupon.maxDiscount
      ) {
        discountAmount = selectedCoupon.maxDiscount;
      }
    }

    discountAmount = Math.min(discountAmount, totalBeforeDiscount);
  }

  const finalAmount = totalBeforeDiscount - discountAmount;
  const closeCoup = () => {
    setShowCouponModal(false);
  };
  const applyCoupon = (coupon) => {
    if (coupon.minOrderAmount && totalBeforeDiscount < coupon.minOrderAmount) {
      Swal.fire({
        icon: "error",
        title: "Coupon not applicable",
        text: `Minimum order amount should be ₹${coupon.minOrderAmount}`,
      });
      return;
    }
    const now = new Date();

    if (new Date(coupon.startDate) > now || new Date(coupon.endDate) < now) {
      Swal.fire({
        icon: "error",
        title: "Coupon expired",
      });
      return;
    }

    setSelectedCoupon(coupon);
    setShowCouponModal(false);

    Swal.fire({
      icon: "success",
      title: "Congratulations 🎉",
      text: `Coupon ${coupon.code} applied successfully.`,
      confirmButtonColor: "#7c3aed",
    });
  };
  const applyCouponByCode = () => {
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      Swal.fire({
        icon: "warning",
        title: "Enter Coupon Code",
      });
      return;
    }

    const coupon = couponData?.getCoupons?.find(
      (item) => item.code.toUpperCase() === code,
    );

    if (!coupon) {
      Swal.fire({
        icon: "error",
        title: "Invalid Coupon",
        text: "Coupon code not found.",
      });
      return;
    }

    applyCoupon(coupon);
    setCouponCode("");
  };

  return (
    <div className="text-gray-500 lg:w-[80%] w-full md:p-4 p-2 bg-white rounded-xl shadow-md flex flex-col gap-3 my-8 place-self-center">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="p-4 shadow-xl rounded-xl bg-white">
          <h3 className="bg-gradient-to-r from-purple-400 to-purple-600 py-2 px-3 text-white rounded-lg font-bold mb-4">
            Recharge Summary
          </h3>

          <div className="space-y-3 text-black">
            <div className="flex justify-between">
              <span>Selected Pack</span>
              <span className="font-semibold">{pack.name}</span>
            </div>

            <div className="flex justify-between">
              <span>Amount</span>
              <span>₹ {pack.price}</span>
            </div>

            <div className="flex justify-between">
              <span>GST @18%</span>
              <span>₹ {gstAmount?.toFixed(2)}</span>
            </div>
            <div className="mt-4">
              <div className="border border-gray-300 rounded-2xl px-3 py-3 flex justify-between items-center">
                <span className="text-purple-400 font-semibold text-sm">
                  {selectedCoupon
                    ? `${selectedCoupon.code} Applied`
                    : "Apply Coupon"}
                </span>

                {selectedCoupon ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCoupon(null);
                    }}
                    className="text-red-600 text-xs bg-red-100 px-2 py-1 rounded-full cursor-pointer font-extralight"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCouponModal(true)}
                    className="text-white bg-green-500 rounded-full px-2 py-1 text-sm cursor-pointer font-semibold"
                  >
                    Apply
                  </button>
                )}
              </div>
            </div>

            <hr />
            {selectedCoupon && (
              <div className="flex justify-between text-green-600">
                <span>Coupon Discount</span>
                <span>- ₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-lg">
              <span>Total Payable</span>
              <span>₹ {finalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <PayOPT
          type="RECHARGE"
          amount={finalAmount}
          oriamount={pack.price}
          packid={pack.id}
          coupon_id={selectedCoupon?.id ?? null}
          couponprice={discountAmount}
          coupon_code={selectedCoupon?.code ?? null}
        />
      </div>
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-100 p-5">
            <div className="flex bg-purple-200 rounded-2xl px-4 py-2 text-black items-center justify-between">
              <h2 className="font-bold text-md ">Available Coupons R</h2>
              <button
                className="cursor-pointer hover:scale-104"
                onClick={() => closeCoup()}
              >
                <svg
                  height={22}
                  width={22}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#c80c0c"
                  viewBox="0 0 640 640"
                >
                  <path d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM231 231C240.4 221.6 255.6 221.6 264.9 231L319.9 286L374.9 231C384.3 221.6 399.5 221.6 408.8 231C418.1 240.4 418.2 255.6 408.8 264.9L353.8 319.9L408.8 374.9C418.2 384.3 418.2 399.5 408.8 408.8C399.4 418.1 384.2 418.2 374.9 408.8L319.9 353.8L264.9 408.8C255.5 418.2 240.3 418.2 231 408.8C221.7 399.4 221.6 384.2 231 374.9L286 319.9L231 264.9C221.6 255.5 221.6 240.3 231 231z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applyCouponByCode();
                  }
                }}
                placeholder="Enter coupon code"
                className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-purple-500"
              />

              <button
                onClick={applyCouponByCode}
                className="rounded-full bg-purple-600 text-white px-5 py-2 text-sm font-semibold hover:bg-purple-700 transition"
              >
                Apply
              </button>
            </div>

            {couponData?.getCoupons
              ?.filter(
                (coupon) =>
                  coupon.visibility === "VISIBLE" &&
                  coupon.applicable === "recharge",
              )
              .map((coupon) => (
                <div
                  key={coupon.id}
                  onClick={() => applyCoupon(coupon)}
                  className="border text-black border-gray-300 bg-gradient-to-r from-purple-200 via-violet-200 to-indigo-200 rounded-2xl shadow-xl p-3 mb-3 mt-5 cursor-pointer hover:bg-gray-100"
                >
                  <div className="font-semibold">{coupon.code}</div>

                  <div className="text-sm text-gray-500">
                    {coupon.type === "FLAT"
                      ? `₹${coupon.flatAmount} OFF`
                      : `${coupon.percentage}% OFF`}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
