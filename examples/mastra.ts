import { MastraEditor } from '@mastra/editor';
import { HappyHorseToolProvider } from '../src/index.js';

// Pass editor into your existing new Mastra({ ..., editor, storage }) configuration.
// Its API key belongs to the server owner; it is not a per-user OAuth connection.
export function createHappyHorseEditor(apiKey: string) {
  const happyhorse = new HappyHorseToolProvider({ apiKey });
  const editor = new MastraEditor({ toolProviders: { happyhorse } });
  return { happyhorse, editor };
}

// Code-configured agents can use the same provider without stored-agent editing.
export async function createHappyHorseTools(apiKey: string) {
  const happyhorse = new HappyHorseToolProvider({ apiKey });
  const tools = await happyhorse.resolveTools(['happyhorse_generate_video', 'happyhorse_get_task']);
  return { happyhorse, tools };
}
