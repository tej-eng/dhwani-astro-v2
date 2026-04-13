export const generateAstroSnapshot = (panchang) => {
  const hour = new Date().getHours();

  // 🔥 Energy logic
  let energy = 60;
  if (panchang.tithi?.toLowerCase().includes("amavasya")) energy -= 10;
  if (panchang.nakshatra?.toLowerCase().includes("pushya")) energy += 10;

  // 🔥 Mood logic
  let mood = energy > 65 ? "Positive 😊" : "Stable 🙂";

  // 🔥 Focus logic
  let focus = "Career 💼";
  if (hour < 12) focus = "Productivity 🚀";
  if (hour > 18) focus = "Relationships ❤️";

  // 🔥 Risk logic
  let risk = "Avoid arguments ⚠️";
  if (panchang.rahuKaal) risk = "Be cautious during Rahu Kaal ⏳";

  // 🔥 Lucky time
  let luckyTime = "3PM–5PM";
  if (hour < 12) luckyTime = "10AM–12PM";

  return {
    energy,
    mood,
    focus,
    risk,
    luckyTime,
  };
};