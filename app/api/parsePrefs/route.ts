import { Ollama } from 'ollama';

const ollama = new Ollama();

export async function POST(req: Request) {
  try {
    const { input } = await req.json();
    
    // Use a locally running model
    const response = await ollama.generate({
      model: 'mistral', // or any other base model
      prompt: input,
      format: 'json'
    });

    return Response.json(response);
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ error: "Failed to parse preferences" }, { status: 500 });
  }
}
