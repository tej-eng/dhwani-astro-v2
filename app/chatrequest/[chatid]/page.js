"use client";
import React, { useEffect, useState, useContext, useMemo } from "react";
import CustomInput from "@/components/Custom/CustomInput";
import CustomSelect from "@/components/Custom/CustomSelect";
import { useDispatch, useSelector } from "react-redux";
import { CustomerRequest, AlertLoading, LocationSelector } from "@/app/common";
import toast from "react-hot-toast";
import { ChatRequestCard } from "@/app/ChatComponent";
import SocketContext from "@/app/context/socketContext";
import { useParams } from "next/navigation";
import {
  resetCode,
  sendChatRequest,
} from "../../redux/reducer/chat/sendRequestSlice";
import {
  resetChatAlertData,
  setChatAlertLoading,
} from "../../redux/reducer/chat/ChatAlertSlice";
import { useRouter } from "next/navigation";
import { IntakeFromRequest } from "@/app/redux/reducer/auth/intakeStoreSlice";
import { fetchIntakeRequest } from "@/app/redux/reducer/auth/intakeSlice";
import { getIntakeDataRequest } from "@/app/redux/reducer/intake/getIntakeData";
import { RequestAstrologerDetail } from "@/app/redux/reducer/astrologer/AstrologerDetail";
import { useMutation, useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { setActiveRequest } from "../../redux/reducer/chat/sendRequestSlice";
import metadata from "libphonenumber-js/metadata.min.json";

const CREATE_INTAKE = gql`
  mutation CreateIntake($input: IntakeInput!) {
    createIntake(input: $input) {
      intakeId
      roomId
      chatTime
      message
    }
  }
`;
const GET_USER_BY_ID = gql`
  query GetUserById($id: String!) {
    getUserById(id: $id) {
      id
      name
      countryCode
      mobile
      gender
      birthDate
      birthTime
      occupation
      wallet {
        id
        balanceCoins
        createdAt
        updatedAt
      }
    }
  }
`;
const GET_ASTROLOGER_BY_ID = gql`
  query GetAstrologerById($id: String!) {
    getAstrologerById(id: $id) {
      id
      name
      profilePic
      price
      rating
      status
      experience
    }
  }
`;

export default function RequestForm({ params }) {
  const [createIntake] = useMutation(CREATE_INTAKE);
  const { chatid } = useParams();
  const astro_id = chatid;

  const router = useRouter();

  const { socket, connectSocket } = useContext(SocketContext);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [time, setTime] = useState("");
  const [occupation, setOccupation] = useState("Private Job");
  const [disabled, setDisabled] = useState(false);
  // const [request, setRequest] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [alert, setAlert] = useState(false);
  const [astrologer, setAstrologer] = useState(null);
  const [place, setPlace] = useState("");
  const [chatTime, setChatTime] = useState(0);

  const [user, setUser] = useState("");
  const [usergender, setGender] = useState("");
  const [isClient, setIsClient] = useState(false);

  const dispatch = useDispatch();

  const [intake_Id, setInatkeId] = useState(null);
  const [chatsend, setChatSend] = useState("");
  const [id, setId] = useState(null);
  const [countryCode, setCountryCode] = useState("");
  const [country, setCountry] = useState(null);
  const countries = useMemo(() => getCountries(), []);

  const { userData } = useSelector((state) => state.getuserDetail);
  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      const parsed = JSON.parse(userData);
      setId(parsed?.id);
    }
  }, []);

  const { data: userInfo } = useQuery(GET_USER_BY_ID, {
    variables: { id: id },
    skip: !id,
  });

  const { data: astrologerInfo, loading: astrologerloading } = useQuery(
    GET_ASTROLOGER_BY_ID,
    {
      variables: { id: astro_id },
      skip: !astro_id,
    },
  );
  useEffect(() => {
    if (astrologerInfo?.getAstrologerById) {
      setAstrologer(astrologerInfo.getAstrologerById);

      console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", astrologer);
    }
  }, [astrologerInfo]);

  useEffect(() => {
    if (userInfo?.getUserById) {
      const user = userInfo.getUserById;

      setName(user?.name || "");
      setPhone(user?.mobile || "");
      setCountryCode(user?.countryCode || "");
      setGender(user?.gender || "");
      setDob(user?.birthDate ? user.birthDate.split("T")[0] : "");
      setTime(user?.birthTime || "");
      setOccupation(user?.occupation || "");

      if (user?.countryCode && countries.length > 0) {
        const matched = countries.find((c) => c.dialCode === user.countryCode);
        if (matched) {
          setCountry(matched);
        }
      }
    }
  }, [userInfo, countries]);

  const sendRequest = async () => {
    if (
      !name ||
      !phone ||
      !countryCode ||
      !dob ||
      !time ||
      !place ||
      !occupation ||
      !usergender
    ) {
      toast.error("Please enter valid inputs");
      return;
    }
    if (!usergender || usergender === "Select Gender") {
      toast.error("Please select gender");
      return;
    }

    try {
      const response = await createIntake({
        variables: {
          input: {
            astrologerId: astro_id,
            name,
            countryCode: countryCode || country?.dialCode,
            mobile: phone,
            gender: usergender,
            birthDate: dob,
            birthTime: time,
            occupation,
            birthPlace: place,
            requestType: "chat",
          },
        },
      });

      const { roomId, chatTime, intakeId, message } = response.data.createIntake;
      setChatTime(chatTime);
      setRoomId(roomId);

      if (!intakeId ) {
        toast.error("Failed to create intake");
        return;
      }
       if(message=="duplicate request. User is already in queue for this astrologer"){
        toast.error("You already have a pending request for this astrologer. Please wait for it to be accepted or cancelled before sending a new request.");
        return;
       }

      console.log(" Intake created:", intakeId);

      //  CONNECT SOCKET HERE
      let activeSocket = socket;
      if (!activeSocket || !activeSocket.connected) {
        activeSocket = connectSocket();
      }

      const req_data = {
        name,
        gender: usergender,
        dateOfBirth: dob,
        timeOfBirth: time,
        occupation,
        location: place,
        userName: name,
        user_id: id,
        astro_id: astro_id,
        room_id: roomId,
        is_promotional: true,
        maximum_time: chatTime,
        user_image: userInfo?.getUserById?.profilePic || "",
        phoneNumber: phone,
      };
      // Wait for connection if not ready
      if (activeSocket.connected) {
        activeSocket.emit("chat_request", req_data);

        dispatch(
          setActiveRequest({
            roomId,
            astrologer,
            chatTime,
            userId: id,
          }),
          //
        );
      } else {
        activeSocket.on("connect", () => {
          activeSocket.emit("chat_request", req_data);

          dispatch(
            setActiveRequest({
              roomId,
              astrologer,
              chatTime,
              userId: id,
            }),
          );
        });
      }

      if (activeSocket) {
        router.push(`/chat-with-astrologer`);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const occupation_list = [
    "Private Job",
    "Govt Job",
    "Own Business",
    "College Student",
    "None of the Above",
  ];

  const handleLocationSelect = (locationObj) => {
    setPlace(locationObj?.city || "");
  };

  function getCountries() {
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    const countryCodes = Object.keys(metadata.countries);

    return countryCodes.map((iso) => {
      const dialCode = `+${metadata.countries[iso][0]}`;
      return {
        iso,
        name: displayNames.of(iso),
        dialCode,
      };
    });
  }

  return (
    <div className="w-full">
      <div className="flex items-start justify-center gap-5 px-10 my-10 ">
        <div className="w-full max-w-5xl overflow-hidden bg-white border border-gray-200 shadow-lg rounded-2xl">
          <div className="bg-[#2e0854] py-4 px-6 rounded-t-2xl">
            <h2 className="text-xl font-semibold text-center text-white">
              Consultation Form
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
            <div className="flex flex-col">
              <CustomInput
                label="Name"
                placeholder="Enter Full Name"
                className="w-full text-black border border-gray-500 focus:border-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Mobile <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center w-full gap-2 overflow-hidden rounded-md">
                <select
                  value={country?.iso || ""}
                  onChange={(e) => {
                    const selected = countries.find(
                      (c) => c.iso === e.target.value,
                    );
                    setCountry(selected);
                    setCountryCode(selected.dialCode);
                  }}
                  className="bg-transparent text-black outline-none text-sm w-fit"
                >
                  {countries.map((c) => (
                    <option key={c.iso} value={c.iso}>
                      ({c.dialCode})
                    </option>
                  ))}
                </select>
                <CustomInput
                  type="tel"
                  placeholder="Enter Phone Number"
                  className="w-full text-black border-b border-gray-500 focus:border-none"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Gender <span className="text-red-500">*</span>
              </label>

              <CustomSelect
                variant={"full"}
                name="Gender"
                value={usergender}
                options={["Select Gender", "MALE", "FEMALE", "OTHER"]}
                required
                className="w-full text-black border border-gray-500 focus:border-none"
                onChange={(e) => setGender(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <CustomInput
                label="Birth Date"
                type="date"
                className="w-full text-black border-b border-gray-500 focus:border-none"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <CustomInput
                label="Birth Time"
                type="time"
                className="w-full text-black border-b border-gray-500 focus:border-none"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Occupation
              </label>

              <CustomSelect
                variant={"full"}
                name="Occupation"
                value={occupation || "hellllo"}
                // value={formData.day}
                onChange={(e) => setOccupation(e.target.value)}
                options={occupation_list}
                required
                className="w-full text-black border border-gray-500 focus:border-none"
              />
            </div>

            <div className="flex flex-col md:col-span-3">
              <LocationSelector
                placeholder="Your birth place/location"
                onSelect={handleLocationSelect}
              />
            </div>

            <div className="mt-4 text-center md:col-span-3">
              <button
                aria-label="Send Chat Request"
                type="submit"
                className="px-6 py-2 font-semibold text-black transition bg-yellow-400 rounded-full shadow-md hover:bg-yellow-500"
                onClick={sendRequest}
                disabled={disabled}
              >
                Send chat Request to {astrologer?.full_name || ""}
              </button>
            </div>
          </div>
        </div>

        {isClient && intake_data && (
          <div className="flex flex-col text-black recent-container">
            <h2 className="recent-heading">Continue With Recent Profiles</h2>

            {intake_data.map((item, index) => (
              <CustomerRequest
                key={item.id}
                name={item?.name}
                location={item?.birth_place}
                dob={item?.dob}
                time={item?.btime}
                index={index}
                onClick={() => sendRequestcard(item.id)}
                disabled={disabled}
              />
            ))}
          </div>
        )}
      </div>

      <AlertLoading show={astrologerloading} title="Fetch Astrologer..." />
    </div>
  );
}
