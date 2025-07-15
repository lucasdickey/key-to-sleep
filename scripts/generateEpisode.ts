/**
 * generateEpisode.ts
 *
 * Parent script to generate a Key To Sleep podcast episode (story, metadata, artwork prompt)
 * using OpenAI and modular stochastic prompts. Outputs are timestamped for uniqueness.
 * Lint-clean for CI/CD.
 *
 * This script runs the entire episode generation workflow, not just story generation.
 */

(async () => {
  const fs = require('fs/promises');
  const path = require('path');
  const { config } = require('dotenv');
  const { OpenAI } = require('openai');

  // Load environment variables
  config({ path: path.resolve(__dirname, '../.env.local') });

  const STORY_PROMPT_FILE = path.resolve(__dirname, '../prompts/story.txt');
  const METADATA_PROMPT_FILE = path.resolve(__dirname, '../prompts/metadata.txt');
  const ARTWORK_PROMPT_FILE = path.resolve(__dirname, '../prompts/artwork.txt');
  const OUTPUT_DIR = path.resolve(__dirname, '../output');

// Generate a unique episodeId using full ISO timestamp
function getEpisodeId(): string {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '').replace('T', 'T').replace('Z', 'Z');
}

// Helper to read individual prompt files
async function readPrompt(filePath: string): Promise<string> {
  return (await fs.readFile(filePath, 'utf8')).trim();
}

async function encodeImageToDataUrl(imagePath: string): Promise<string> {
  const ext = path.extname(imagePath).slice(1).toLowerCase();
  // Fix for: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type ... (lint ID: 80dc7687-32b1-403a-bcf3-d8619b5586dc)
  const mimeTypes: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif'
  };
  const mimeType = mimeTypes[ext] || 'application/octet-stream';
  const buffer = await fs.readFile(imagePath);
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}

async function callOpenAI(prompt: string, userInput = '', systemMsg = 'You are a peaceful sleep story narrator for a podcast.'): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || 'gpt-4o';
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: systemMsg },
    { role: 'user', content: prompt + (userInput ? '\n' + userInput : '') }
  ];
  const completion = await openai.chat.completions.create({
    model,
    messages,
    temperature: 0.8,
    max_tokens: 4500,
  });
  return completion.choices[0]?.message.content?.trim() || '';
}

// Multimodal artwork generation using GPT-4o
async function callOpenAIMultimodalArtwork({
  prompt,
  userInput = '',
  systemMsg = 'You are a creative visual artist for a podcast.',
  imagePaths = []
}: {
  prompt: string;
  userInput?: string;
  systemMsg?: string;
  imagePaths: string[];
}): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || 'gpt-4o';
  const messages: any[] = [
    { role: 'system', content: systemMsg },
    // Images as separate user messages
    ...(
      await Promise.all(
        imagePaths.map(async (imgPath) => ({
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: await encodeImageToDataUrl(imgPath) }
            }
          ]
        }))
      )
    ),
    // The text prompt and user input as a user message
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt + (userInput ? '\n' + userInput : '') }
      ]
    }
  ];
  const completion = await openai.chat.completions.create({
    model,
    messages,
    temperature: 0.8,
    max_tokens: 4500,
  });
  return completion.choices[0]?.message.content?.trim() || '';
}


async function main(): Promise<void> {
  try {
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    // Read prompts from separate files
    const storyPrompt = await readPrompt(STORY_PROMPT_FILE);
    // Dynamically read all reference scripts in prompts/reference_scripts
    const referenceDir = path.resolve(__dirname, '../prompts/reference_scripts');
    const referenceFiles = (await fs.readdir(referenceDir)).filter((f: string) => f.endsWith('.txt'));
    let referencesContent = '';
    for (const file of referenceFiles) {
      const refContent = await fs.readFile(path.join(referenceDir, file), 'utf8');
      referencesContent += `--- Reference Script: ${file} ---\n${refContent}\n\n`;
    }
    const combinedPrompt = `Here are reference scripts for inspiration (do not copy directly):\n\n${referencesContent}${storyPrompt}`;
    const metadataPrompt = await readPrompt(METADATA_PROMPT_FILE);
    const artworkPrompt = await readPrompt(ARTWORK_PROMPT_FILE);
    // Dynamically read all reference artwork images in prompts/reference_artwork
    const artworkReferenceDir = path.resolve(__dirname, '../prompts/reference_artwork');
    // Only filenames are referenced in the prompt for now. For true multimodal support, images should be sent directly to the model if supported.
    // TODO: When using a multimodal API, send the actual images as part of the input to the model.
    // Fix for: Parameter 'f' implicitly has an 'any' type. (lint ID: b17a5ad5-d2d6-4872-9e54-3c37b4db88f7)
    const artworkReferenceFiles = (await fs.readdir(artworkReferenceDir)).filter((f: string) => f.match(/\.(png|jpg|jpeg|webp|gif)$/i));
    let artworkReferencesContent = '';
    if (artworkReferenceFiles.length > 0) {
      artworkReferencesContent = 'Here are reference artwork images for inspiration (do not copy directly):\n' +
        artworkReferenceFiles.map((f: string) => `- prompts/reference_artwork/${f}`).join('\n') + '\n\n';
    }
    const combinedArtworkPrompt = `${artworkReferencesContent}${artworkPrompt}`;
    const episodeId = getEpisodeId();

    // 1. Generate story
    console.log('Generating sleep story...');
    const story = await callOpenAI(combinedPrompt);
    // Remove any lines or inline text in square brackets (e.g., [music], [Sound of ...])
    const storyFiltered = story
      .split('\n')
      .map(line => line.replace(/\[[^\]]*\]/g, '').trim())
      .filter(line => line.length > 0)
      .join('\n');
    await fs.writeFile(path.join(OUTPUT_DIR, `${episodeId}-story.txt`), storyFiltered, 'utf8');
    console.log(`Story saved to output/${episodeId}-story.txt`);

    // 2. Generate metadata
    console.log('Generating episode metadata...');
    const metadata = await callOpenAI(metadataPrompt, story);
    await fs.writeFile(path.join(OUTPUT_DIR, `${episodeId}-metadata.json`), metadata, 'utf8');
    console.log(`Metadata saved to output/${episodeId}-metadata.json`);

    // 3. Generate artwork prompt (multimodal)
    console.log('Generating artwork prompt...');
    const artworkInput = `${story}\n\n${metadata}`;
    // Build absolute paths for artwork images
    const artworkImagePaths = artworkReferenceFiles.map((f: string) => path.join(artworkReferenceDir, f));
    const artworkPromptText = await callOpenAIMultimodalArtwork({
      prompt: combinedArtworkPrompt,
      userInput: artworkInput,
      systemMsg: 'You are a creative visual artist for a podcast.',
      imagePaths: artworkImagePaths
    });
    await fs.writeFile(path.join(OUTPUT_DIR, `${episodeId}-artwork-prompt.txt`), artworkPromptText, 'utf8');
    console.log(`Artwork prompt saved to output/${episodeId}-artwork-prompt.txt`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error in story generation pipeline:', err);
    process.exit(1);
  }
}

await main();
})();
