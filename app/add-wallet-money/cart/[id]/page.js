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
              <span>₹ {gstAmount.toFixed(2)}</span>
            </div>
            <div className="mt-4">
              <div
                onClick={() => setShowCouponModal(true)}
                className="border rounded-lg px-3 py-3 flex justify-between items-center cursor-pointer"
              >
                <span>
                  {selectedCoupon
                    ? `${selectedCoupon.code} Applied`
                    : "Apply Coupon"}
                </span>

                <button className="text-purple-600 font-semibold">Apply</button>
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
          <div className="bg-white rounded-xl w-[400px] p-5">
            <h2 className="font-bold text-lg mb-4">Available Coupons</h2>
            <button onClick={() => closeCoup()}>X</button>

            {couponData?.getCoupons?.map((coupon) => (
              <div
                key={coupon.id}
                onClick={() => applyCoupon(coupon)}
                className="border rounded-lg p-3 mb-3 cursor-pointer hover:bg-gray-100"
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
