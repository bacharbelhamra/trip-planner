import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function generateTrip(prompt) {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const text = response.choices[0].message.content;

    console.log("RAW AI:", text); // normal

    // Extract JSON safely
    const match = text.match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error("No JSON found in AI response");
    }

    let jsonString = match[0];

    // Clean trailing commas
    jsonString = jsonString
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]");

    const parsed = JSON.parse(jsonString);

    console.log("PARSED:", parsed); // important debug

    return parsed;

  } catch (error) {
    console.error("AI ERROR:", error);
    return null;
  }
}