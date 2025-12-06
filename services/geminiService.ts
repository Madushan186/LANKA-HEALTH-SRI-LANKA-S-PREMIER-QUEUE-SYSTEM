import { GoogleGenAI, Type } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found via process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

export const suggestDiagnosisAndTreatment = async (symptoms: string, age: number, gender: string) => {
  try {
    const ai = getClient();
    const prompt = `
      Act as an expert medical assistant.
      Patient Details: Age ${age}, Gender ${gender}.
      Reported Symptoms: ${symptoms}.
      
      Please provide:
      1. A list of 3 potential diagnoses (most likely first).
      2. A recommended treatment plan for the most likely diagnosis.
      3. A list of 3 suggested medications with standard dosage.
      
      Format the output as a JSON object with keys: "diagnoses" (array of strings), "treatmentPlan" (string), "suggestedMedications" (array of strings).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnoses: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            treatmentPlan: { type: Type.STRING },
            suggestedMedications: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return null;
  }
};

export const summarizeMedicalHistory = async (historyNotes: string[]) => {
   try {
    const ai = getClient();
    const prompt = `Summarize the following medical history notes into a concise overview for a doctor:\n\n${historyNotes.join('\n')}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Unable to generate summary at this time.";
  }
}