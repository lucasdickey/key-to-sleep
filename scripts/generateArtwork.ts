/**
 * generateArtwork.ts
 *
 * Script to generate episode artwork prompt using OpenAI (multimodal if supported).
 * Uses the most recent story and metadata files in the output directory for input and outputs artwork prompt as <episodeId>-artwork-prompt.txt.
 * Requires OPENAI_API_KEY and OPENAI_MODEL in .env.local.
 */

(async () => {
  const fs = require("fs/promises");
  const path = require("path");
  const dotenv = require("dotenv");
  const { OpenAI } = require("openai");

  dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

  const OUTPUT_DIR = path.resolve(__dirname, "../output");
  const ARTWORK_PROMPT_FILE = path.resolve(__dirname, "../prompts/artwork.txt");
  const ARTWORK_REFERENCE_DIR = path.resolve(
    __dirname,
    "../prompts/reference_artwork"
  );

  async function getLatestEpisodeId(): Promise<string> {
    const files = await fs.readdir(OUTPUT_DIR);
    const storyFiles = files.filter((f: string) => f.endsWith("-story.txt"));
    if (storyFiles.length === 0)
      throw new Error("No story files found in output directory.");
    storyFiles.sort((a: string, b: string) => b.localeCompare(a));
    return storyFiles[0].replace("-story.txt", "");
  }

  async function readPrompt(filePath: string): Promise<string> {
    return (await fs.readFile(filePath, "utf8")).trim();
  }

  async function generateArtworkPrompt() {
    try {
      const episodeId = await getLatestEpisodeId();
      const storyText = await fs.readFile(
        path.join(OUTPUT_DIR, `${episodeId}-story.txt`),
        "utf8"
      );
      const metadataText = await fs.readFile(
        path.join(OUTPUT_DIR, `${episodeId}-metadata.json`),
        "utf8"
      );
      const artworkPrompt = await readPrompt(ARTWORK_PROMPT_FILE);
      // Reference artwork images
      const artworkReferenceFiles = (
        await fs.readdir(ARTWORK_REFERENCE_DIR)
      ).filter((f: string) => f.match(/\.(png|jpg|jpeg|webp|gif)$/i));
      let artworkReferencesContent = "";
      if (artworkReferenceFiles.length > 0) {
        artworkReferencesContent =
          "Here are reference artwork images for inspiration (do not copy directly):\n" +
          artworkReferenceFiles
            .map((f: string) => `- prompts/reference_artwork/${f}`)
            .join("\n") +
          "\n\n";
      }
      const combinedArtworkPrompt = `${artworkReferencesContent}${artworkPrompt}`;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const model = process.env.OPENAI_MODEL || "gpt-4o";

      // First, generate the artwork description using GPT
      const messages = [
        {
          role: "system",
          content:
            'You are a creative visual artist. Generate a detailed image description. The main character and companion from the story should be the central focal points, ideally positioned in the lower two-thirds of the image. Ensure the artwork does not contain any text.',
        },
        {
          role: "user",
          content:
            combinedArtworkPrompt +
            "\n\nSTORY:\n" +
            storyText +
            "\n\nMETADATA:\n" +
            metadataText,
        },
      ];
      const completion = await openai.chat.completions.create({
        model,
        messages,
        max_tokens: 900,
        temperature: 0.8,
      });
      const artworkPromptText =
        completion.choices[0]?.message.content?.trim() || "";
      const outputArtworkFile = path.join(
        OUTPUT_DIR,
        `${episodeId}-artwork-prompt.txt`
      );
      await fs.writeFile(outputArtworkFile, artworkPromptText, "utf8");
      console.log(`Artwork prompt saved to ${outputArtworkFile}`);

      // Generate artwork image using OpenAI's image API (GPT-Image-1)
      try {
        // Prepare prompt for PT-Image-1
        const imagePromptPrefix =
          'Vintage poster with main character and companion in the lower 2/3 of the image. Ensure the artwork does not contain any text. ';

        // Clean and truncate the prompt
        const cleanedPrompt = artworkPromptText
          .replace(/\s+/g, " ")
          .replace(/prompts\/reference_artwork\/[^\s]+/g, "") // Remove file references
          .trim();

        // Combine prefix with cleaned prompt, ensuring we stay under 1000 chars
        const fullPrompt = imagePromptPrefix + cleanedPrompt;
        const promptForImage = fullPrompt.slice(0, 1000);

        console.log(
          `Generating image with prompt (${promptForImage.length} chars)...`
        );

        const imageResponse = await openai.images.generate({
          model: "gpt-image-1",
          prompt: promptForImage,
          n: 1,
          size: "1024x1024",
        });

        const b64 = imageResponse.data[0]?.b64_json;
        if (b64) {
          const buffer = Buffer.from(b64, "base64");
          const outputImageFile = path.join(
            OUTPUT_DIR,
            `${episodeId}-artwork.png`
          );
          await fs.writeFile(outputImageFile, buffer);
          console.log(`Artwork image saved to ${outputImageFile}`);
        } else {
          console.error("No image returned from OpenAI image API.");
        }
      } catch (err) {
        console.error("Error generating or saving artwork image:", err);
      }
    } catch (err) {
      console.error("Error generating artwork prompt:", err);
      process.exit(1);
    }
  }

  generateArtworkPrompt();
})();
