const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running!' });
});

app.post('/api/prioritize', async (req, res) => {
  try {
    const { tasks } = req.body;
    if (!tasks || tasks.length === 0) {
      return res.status(400).json({ error: 'No tasks provided' });
    }
    const taskDescriptions = tasks
      .map((task, i) => `${i + 1}. "${task.title}" - Deadline: ${task.deadline}`)
      .join('\n');

    const prompt = `You are a smart productivity assistant. Analyze these tasks and provide prioritization.

TASKS:
${taskDescriptions}

For EACH task, respond with ONLY valid JSON (no markdown, no extra text):
{
  "taskIndex": 1,
  "title": "task name",
  "priority": 9,
  "riskLevel": "HIGH",
  "reason": "deadline is in 2 hours",
  "recommendedAction": "Start immediately - focus on this first",
  "estimatedMinutes": 45
}

Then a final summary line:
SUMMARY: "What's the single most important task right now?"

Respond with PURE JSON only.`;

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          key: process.env.GEMINI_API_KEY,
        },
      }
    );

    const aiResponse = response.data.candidates[0].content.parts[0].text;

    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/g);
    const parsedTasks = jsonMatch ? jsonMatch.map(json => JSON.parse(json)) : [];
    const summary = aiResponse.match(/SUMMARY: "(.*?)"/)?.[1] || 'Focus on urgent tasks';

    res.json({
      prioritizedTasks: parsedTasks,
      summary: summary,
      rawAiResponse: aiResponse,
    });
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to prioritize tasks',
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Gemini API connected`);
});