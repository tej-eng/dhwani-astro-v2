const res = await fetch("http://localhost:5000/api/ai-analysis", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    ...userData,
    place: input,
  }),
});

if (!res.ok) {
  throw new Error("AI API failed");
}

const data = await res.json();