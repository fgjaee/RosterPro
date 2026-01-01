
import { GoogleGenAI } from "@google/genai";
import { ScheduleData, TaskRule } from "../types";

const getApiKey = () => {
  // Support both GEMINI_API_KEY (production) and VITE_GEMINI_API_KEY (Vite dev)
  return import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
    };
    reader.readAsDataURL(file);
  });
  
  return {
    inlineData: { 
        data: await base64EncodedDataPromise, 
        mimeType: file.type 
    },
  };
};

const cleanJsonString = (str: string) => {
    if (!str) return "";
    let clean = str.trim();
    if (clean.startsWith('```json')) {
        clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
        clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return clean;
};

export const AIService = {
  // 1. Complex Vision Task: Schedule OCR
  // Using Gemini 2.5 Pro for maximum accuracy on complex tables
  parseSchedule: async (file: File): Promise<ScheduleData> => {
     const filePart = await fileToGenerativePart(file);
     const prompt = `
        You are an expert OCR system for reading employee work schedules. Analyze this schedule image with EXTREME PRECISION.

        Return a JSON object with:
        1. 'week_period': The exact date range shown in the header (e.g., "12/07 - 12/13" or "Dec 7 - Dec 13")
        2. 'shifts': An array of objects for EACH employee row in the exact order they appear

        CRITICAL INSTRUCTIONS FOR ACCURACY:

        EMPLOYEE NAMES:
        - Read the FULL name EXACTLY as written (Last, First Middle)
        - DO NOT skip any employees, even if they have all OFF days
        - Preserve exact spelling, capitalization, and punctuation

        JOB ROLES:
        - Look for role/title in the "Extra" or secondary column
        - Common roles: "wr_Lead", "wr_Produce_Overnight", "wr_Produce_Stock", "wr_Supervisor"
        - If role contains "Lead" -> use "Lead"
        - If role contains "Overnight" -> use "Produce_Overnight"
        - If role contains "Supervisor" -> use "Supervisor"
        - If role contains "Stock" or just "Produce" -> use "Produce_Stock"
        - If unclear or empty -> use "Stock"

        TIME PARSING RULES (VERY IMPORTANT):
        - Read times EXACTLY as shown in each cell
        - Format: "HH:MM(AM/PM)-HH:MM(AM/PM)" (e.g., "10:00AM-6:00AM", "7:15AM-2:00PM")
        - For times crossing midnight (e.g., "10:00PM-6:00AM"), keep exactly as shown
        - If cell shows "OFF", blank, empty, "X", "Loan", or similar -> use "OFF"
        - DO NOT infer or assume times - only use what you can clearly read
        - Watch for similar-looking characters: "0" vs "O", "1" vs "I", "5" vs "S"
        - Common patterns: "12:00PM-8:00PM", "6:00AM-2:00PM", "1:00AM-9:00AM"

        MULTI-LINE CELLS:
        - Some cells may have multiple shifts or additional info (like "Tot: 7.50" or "230 GM Stock/")
        - ONLY extract the PRIMARY time range (usually the first or most prominent time)
        - Ignore "Tot:", "GM Stock", "Night_GM_Stock" metadata

        JSON Schema for 'shifts':
        {
          "name": "Last, First M",
          "role": "Job_Role",
          "sun": "HH:MMAM-HH:MMPM or OFF",
          "mon": "HH:MMAM-HH:MMPM or OFF",
          "tue": "HH:MMAM-HH:MMPM or OFF",
          "wed": "HH:MMAM-HH:MMPM or OFF",
          "thu": "HH:MMAM-HH:MMPM or OFF",
          "fri": "HH:MMAM-HH:MMPM or OFF",
          "sat": "HH:MMAM-HH:MMPM or OFF"
        }

        VERIFICATION CHECKLIST:
        ✓ Did I include ALL employees shown in the table?
        ✓ Are names spelled EXACTLY as shown?
        ✓ Did I check each day column carefully for each employee?
        ✓ Are AM/PM designations correct?
        ✓ Did I avoid confusing "0" with "O" or "1" with "I"?

        Return ONLY the JSON object, no additional text or formatting.
     `;

     try {
         const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: { parts: [filePart, { text: prompt }] },
            config: { responseMimeType: "application/json" }
         });
         
         const cleanJson = cleanJsonString(response.text || "{}");
         const data = JSON.parse(cleanJson) as ScheduleData;
         
         // Data hydration
         if (!data.shifts) data.shifts = [];
         data.shifts = data.shifts.map((s, i) => ({
             ...s,
             id: String(Date.now() + i),
             role: s.role || "Stock",
             sun: s.sun || "OFF", mon: s.mon || "OFF", tue: s.tue || "OFF",
             wed: s.wed || "OFF", thu: s.thu || "OFF", fri: s.fri || "OFF", sat: s.sat || "OFF",
         }));
         
         return data;
     } catch (err: any) {
         console.error("AI Schedule Error:", err);
         throw new Error("Failed to parse schedule. Ensure image is clear.");
     }
  },

  // 2. Complex Vision Task: Workplace Analysis
  // Uses gemini-3-pro-preview to identify tasks from a photo
  analyzeWorkplaceImage: async (file: File): Promise<TaskRule[]> => {
      const filePart = await fileToGenerativePart(file);
      const prompt = `
        You are a retail operations expert. Analyze this image of a store environment.
        Identify 3-5 specific, actionable tasks to improve the area (stocking, cleaning, safety, organizing).
        
        Return a JSON array of objects with this schema:
        {
            "code": "Short Code (e.g., CLN, STK)",
            "name": "Actionable Task Name",
            "type": "general",
            "effort": Estimated minutes (integer)
        }
        
        Do not include generic advice. Be specific to what you see in the photo.
      `;

      try {
          const response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: { parts: [filePart, { text: prompt }] },
              config: { responseMimeType: "application/json" }
          });

          const cleanJson = cleanJsonString(response.text || "[]");
          const tasks = JSON.parse(cleanJson);
          
          return tasks.map((t: any, i: number) => ({
              ...t,
              id: 8000 + Math.floor(Math.random() * 1000),
              fallbackChain: [], // No specific person assigned yet
          }));
      } catch (err: any) {
          console.error("AI Vision Error:", err);
          throw new Error("Could not analyze image.");
      }
  },

  // 3. Fast Text Task: Daily Huddle
  // Uses gemini-2.5-flash-lite for low latency response
  generateDailyHuddle: async (day: string, shiftCount: number, focusAreas: string[]): Promise<string> => {
      const prompt = `
        Write a high-energy, 30-second pre-shift huddle speech for a retail team.
        Day: ${day}
        Staff Count: ${shiftCount}
        Focus Areas: ${focusAreas.join(', ') || "General Service & Speed"}
        
        Keep it professional but motivating. Do not use markdown. Just plain text.
      `;

      try {
          const response = await ai.models.generateContent({
              model: "gemini-2.0-flash-exp",
              contents: { parts: [{ text: prompt }] },
          });
          return response.text || "Let's have a great shift team!";
      } catch (err) {
          console.error("AI Huddle Error:", err);
          return "Team, let's focus on safety and customers today! (AI Offline)";
      }
  }
};
