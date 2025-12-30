import { GoogleGenAI, Type } from "@google/genai";
import { ScheduleData } from "../types";

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const result = reader.result as string;
        // Handle standard base64 data URI (remove "data:image/jpeg;base64," prefix)
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

// Helper to strip markdown code blocks if present
const cleanJsonString = (str: string) => {
    if (!str) return "";
    let clean = str.trim();
    // Remove ```json and ``` wrapping
    if (clean.startsWith('```json')) {
        clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
        clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return clean;
};

const getApiKey = () => {
  // Support both GEMINI_API_KEY (production) and VITE_GEMINI_API_KEY (Vite dev)
  return import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
};

export const OCRService = {
  parseSchedule: async (file: File): Promise<ScheduleData> => {
     const ai = new GoogleGenAI({ apiKey: getApiKey() });
     const filePart = await fileToGenerativePart(file);

     // Define Prompt with enhanced accuracy instructions
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
            model: "gemini-2.5-flash",
            contents: {
                parts: [filePart, { text: prompt }]
            },
            config: {
                responseMimeType: "application/json",
                // Using loose schema to allow model flexibility, manual validation below
            }
         });
         
         if (!response.text) throw new Error("AI returned empty response.");
         
         const cleanJson = cleanJsonString(response.text);
         let data: ScheduleData;
         
         try {
             data = JSON.parse(cleanJson) as ScheduleData;
         } catch (e) {
             console.error("JSON Parse Error", e);
             throw new Error("Failed to parse AI response. Try a clearer image.");
         }
         
         // Validation & Defaulting
         if (!data.shifts || !Array.isArray(data.shifts)) {
             data.shifts = [];
         }
         
         data.shifts = data.shifts.map((s, i) => ({
             ...s,
             id: String(Date.now() + i),
             role: s.role || "Stock",
             sun: s.sun || "OFF",
             mon: s.mon || "OFF",
             tue: s.tue || "OFF",
             wed: s.wed || "OFF",
             thu: s.thu || "OFF",
             fri: s.fri || "OFF",
             sat: s.sat || "OFF",
         }));
         
         if (!data.week_period) data.week_period = "New Schedule";
         
         return data;

     } catch (err: any) {
         console.error("OCR Service Error:", err);
         throw new Error(err.message || "Unknown OCR error");
     }
  }
};