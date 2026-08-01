'use client'

import { useState } from "react";
import Basic from "./Basic";
import Planets from "./Planets";
import Divcharts from "./Divcharts";

const btabs = [
  { id: "basic", label: "Basic" },
  { id: "planets", label: "Planets" },
  { id: "divcharts", label: "Divisional Charts" },
];

export default function Basicdetail() {
    const [basicTab, setBasicTab] = useState("basic");

    return (
        <section className="basic-ul-main w-full">
            <div className="basic-list bg-[#2f1254] px-9 py-2 rounded-lg">
                <ul className="basic-li flex items-center gap-5 justify-center self-center">
                    {btabs.map((btab) => (
                        <li
                            key={btab.id}
                            onClick={() => setBasicTab(btab.id)}
                            className={`cursor-pointer lg:px-5 text-xs px-2 py-1 md:text-base lg:py-1 rounded-full ${basicTab === btab.id ? "bg-purple-500 text-white" : " text-white"
                                }`}     >
                            {btab.label}
                        </li>
                    ))}
                </ul>
            </div>

           <div className="basic-down py-5">
    <div className={basicTab === "basic" ? "block" : "hidden"}>
        <Basic />
    </div>

    <div className={basicTab === "planets" ? "block" : "hidden"}>
        <Planets />
    </div>

    <div className={basicTab === "divcharts" ? "block" : "hidden"}>
        <Divcharts />
    </div>
</div>


        </section>
    );




}