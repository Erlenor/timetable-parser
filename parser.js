const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function parseTimetableImage(base64Image, mimeType) {
  const prompt = `You are looking at an image. First decide: is this a school or university timetable/schedule?

If it is NOT a timetable, respond with exactly this JSON:
{"is_timetable": false}

If it IS a timetable, extract every event and respond with this JSON:
{
  "is_timetable": true,
  "events": [
    {
      "title": "Subject or class name",
      "day": "Monday",
      "start_time": "09:00",
      "end_time": "10:30",
      "location": "Room 101 or empty string if not shown",
      "notes": "teacher name or any extra info, or empty string"
    }
  ]
}

Use 24h time. If no explicit dates are given, use the weekday name for day. Return only the JSON, nothing else.`;

  const body = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Image
            }
          },
          { text: prompt }
        ]
      }
    ],
    // Tell Gemini not to wrap the response in markdown or add extra text
    generationConfig: {
      responseMimeType: 'application/json'
    }
  };

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gemini API request failed');
  }

  const data = await response.json();

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error('Empty response from Gemini. Try again.');

  const clean = raw.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '').trim();

  try {
    return JSON.parse(clean);
  } catch {
    throw new Error('Could not parse the response. Try a clearer photo.');
  }
}