import { fetchAdvPanchang } from "@/app/api/astroFetch";

// 🔥 helper
const getCurrentParams = (coords) => {
    const now = new Date();

    return {
        day: now.getDate(),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
        lat: coords.lat,
        lon: coords.lon,
        tzone: 5.5,
        hour: now.getHours(),
        min: now.getMinutes(),
    };
};

export const getPanchang = async () => {
    try {
        // ✅ default fallback (Delhi)
        let coords = { lat: 28.6139, lon: 77.209 };

        // 🔥 Try geolocation
        if (typeof window !== "undefined" && navigator.geolocation) {
            coords = await new Promise((resolve) => {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        resolve({
                            lat: pos.coords.latitude,
                            lon: pos.coords.longitude,
                        });
                    },
                    () => resolve(coords) // fallback
                );
            });
        }

        const params = getCurrentParams(coords);

        const res = await fetchAdvPanchang(params);
        const data = res?.data || res;

        // 🔥 Extract only what chat needs
        return {
            tithi: data?.tithi?.details?.tithi_name || data?.tithi?.name,
            nakshatra: data?.nakshatra?.details?.nakshatra_name || data?.nakshatra?.name,
            rahuKaal:
                data?.rahukaal
                    ? `${data.rahukaal.start || ""} - ${data.rahukaal.end || ""}`
                    : "N/A",
        };
    } catch (err) {
        console.error("Panchang API Error:", err);

        // fallback
        return {
            tithi: data?.tithi?.details?.tithi_name,
            nakshatra: data?.nakshatra?.details?.nakshatra_name,
            rahuKaal: `${data?.rahukaal?.start} - ${data?.rahukaal?.end}`,
            sunrise: data?.sunrise,
            sunset: data?.sunset,
            day: data?.day,
        };
    }
};