import { AstrologerCard } from "./AstrologerCard";
import OptionsButtons from "./OptionsButtons";
import { PanchangCard } from "./PanchangCard";
import { RemedyCards } from "./RemedyCards";
import { SnapshotCard } from "./SnapShot";

export default function MessageBubble({ msg, handleUserInput }) {
  return (
    <div className={`flex w-full ${msg.type === "user" ? "justify-end" : "justify-start"}`}>

      {/* USER MESSAGE */}
      {msg.type === "user" && (
        <div className="bg-purple-500 text-white p-2 rounded-md max-w-[75%] text-[13px]">
          {msg.text}
        </div>
      )}

      {/* BOT TEXT */}
      {msg.type === "bot" && (
        <div className="bg-purple-200 text-black p-2 rounded-md max-w-[75%] text-[13px] whitespace-pre-line">
          {msg.text}
        </div>
      )}

      {/* PANCHANG */}
      {msg.type === "panchang" && <PanchangCard data={msg.data} />}

      {/* SNAPSHOT */}
      {msg.type === "snapshot" && <SnapshotCard data={msg.data} />}

      {/* OPTIONS */}
      {msg.type === "options" && (
        <OptionsButtons
          options={msg.options}
          handleUserInput={handleUserInput}
        />
      )}


      {msg.type === "remedyCards" && <RemedyCards data={msg.data} />}

      {msg.type === "astroCard" && <AstrologerCard data={msg.data} />}
    </div>
  );
}