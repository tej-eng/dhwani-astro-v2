"use client";
import Image from "next/image";
import Script from "next/script";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AlertLoading } from "../../../app/common";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  sendPaymentDetail,
  resetStatusCode,
} from "../../../app/redux/reducer/payment/rechargeSlice";

import { useSearchParams } from 'next/navigation';

export default function PayOPT({ amount,oriamount,coupon_id,couponprice,packid }) {
const searchParams = useSearchParams();

  const payAmount = amount || 0;

  const dispatch = useDispatch();
  const { statusCode } = useSelector((state) => state.recharge_payment);
  const { userData } = useSelector((state) => state.getuserDetail);
  const [user, setUserData] = useState("");
 const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (userData) {
      setUserData(userData);
    }
  }, [userData]);

      useEffect(() => {
}, [oriamount]);

  useEffect(() => {
    if (statusCode === 200) {
      setLoading(false);
      toast.success("Payment Add successfully!");
      route.push("/chat-with-astrologer");
      dispatch(resetStatusCode());
      
    }
  }, [statusCode]);

  const route = useRouter();

  const [loading, setLoading] = useState(false);
  const handleCheckout = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://dhwaniastro.com/api/createOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: payAmount }),
      });

      const order = await res.json();

      console.log("Order created:", order);
     

      if (order.error) {
        alert("Error creating order");
        setLoading(false);

        return;
      }
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Dhwani Astro LLp",
        description: "Recharge Payment",
        order_id: order.id,
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
         notes: {
         userId: storedUser?.id || "test-user-1",
         source: "dhwaniastro",
         rechargePackId: packid || "pack_001",
         coins: 100,
       },
        theme: {
          color: "#fff49e",
        },
      };

      setLoading(false);

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (error) {
      alert("Error processing payment: " + error.message);
    } finally {
    }
  };
  return (
    <div className="col-span-2">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      <h3 className="mb-4 text-base font-bold text-center sm:text-lg">
        Payment Options
      </h3>
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { name: "Paytm", icon: "/prblm/pa-1.png" },
          { name: "Freecharge", icon: "/prblm/pa-2.png" },
          { name: "MobiKwik", icon: "/prblm/pa-4n.png" },
          { name: "Credit/Debit Card", icon: "/prblm/pc-a.png" },
          { name: "Net Banking", icon: "/prblm/pa-5.png" },
          { name: "Rupay UPI", icon: "/prblm/pa-6.png" },
          { name: "GooglePay", icon: "/prblm/pg-a.png" },
          { name: "PhonePay", icon: "/prblm/ph-a.png" },
          { name: "Bhim UPI", icon: "/prblm/bh-a.png" },
        ].map((method, idx) => (
          <button aria-label={`Pay with ${method.name}`}
            onClick={handleCheckout}
            key={idx}
            className="bg-[linear-gradient(to_right,#a65ed677_54%,#ba38cb67_100%)] rounded-lg p-2  flex flex-col gap-1 items-center hover:scale-105 transition-transform shadow"
          >
            <Image
              src={method.icon}
              alt={method.name}
              width={100}
              height={100}
              className="sm:h-8 sm:w-10.5  h-5.7 w-7"
            />
            <span className="text-xs font-semibold text-center text-white sn:font-bold">
              {method.name}
            </span>
          </button>
        ))}

        <AlertLoading show={loading} title="Please Waiting..." />
      </div>
    </div>
  );
}
