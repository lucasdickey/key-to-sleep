import NodeID3 from "node-id3";
import { uploadBinaryToS3 } from "./s3";

// Embed artwork into MP3 file
export async function embedArtworkIntoMP3(
  audioBuffer: Buffer,
  artworkBuffer: Buffer,
  metadata: {
    title: string;
    artist?: string;
    album?: string;
    genre?: string;
    year?: string;
  }
): Promise<Buffer> {
  try {
    // Prepare ID3 tags with artwork
    const tags = {
      title: metadata.title,
      artist: metadata.artist || "Key To Sleep",
      album: metadata.album || "Custom Sleep Stories",
      genre: metadata.genre || "Spoken Word",
      year: metadata.year || new Date().getFullYear().toString(),
      image: {
        mime: "image/png",
        type: {
          id: 3, // Cover (front) image
          name: "front cover",
        },
        description: "Custom Story Artwork",
        imageBuffer: artworkBuffer,
      },
    };

    // Write tags to MP3 buffer
    const success = NodeID3.write(tags, audioBuffer);

    if (!success) {
      throw new Error("Failed to embed artwork into MP3");
    }

    return success as Buffer;
  } catch (error) {
    console.error("Error embedding artwork into MP3:", error);
    throw error;
  }
}

// Process and upload enhanced MP3 with artwork
export async function createEnhancedMP3(
  jobToken: string,
  audioBuffer: Buffer,
  artworkBuffer: Buffer,
  storyTitle: string
): Promise<string> {
  try {
    // Embed artwork into MP3
    const enhancedAudioBuffer = await embedArtworkIntoMP3(
      audioBuffer,
      artworkBuffer,
      {
        title: storyTitle,
        artist: "Key To Sleep",
        album: "Custom Sleep Stories",
        genre: "Sleep Story",
        year: new Date().getFullYear().toString(),
      }
    );

    // Upload enhanced MP3 to S3
    const s3Url = await uploadBinaryToS3(
      jobToken,
      "audio",
      enhancedAudioBuffer,
      "audio/mpeg",
      "mp3"
    );

    return s3Url;
  } catch (error) {
    console.error("Error creating enhanced MP3:", error);
    throw error;
  }
}

// Extract metadata from story content for MP3 tags
export function extractStoryMetadata(storyContent: string): {
  title: string;
  description: string;
} {
  // Try to extract title from first line or first sentence
  const lines = storyContent.split("\n").filter((line) => line.trim());
  const firstLine = lines[0] || "";

  // Simple title extraction (can be enhanced)
  let title = "Custom Sleep Story";
  if (firstLine.length > 0 && firstLine.length < 100) {
    // If first line looks like a title (short and doesn't end with period)
    if (!firstLine.endsWith(".") && firstLine.length < 50) {
      title = firstLine.trim();
    } else {
      // Extract from first sentence
      const firstSentence = storyContent.split(".")[0];
      if (firstSentence.length < 50) {
        title = firstSentence.trim();
      }
    }
  }

  // Create description from first paragraph
  const firstParagraph =
    storyContent.split("\n\n")[0] || storyContent.substring(0, 200);
  const description =
    firstParagraph.length > 200
      ? firstParagraph.substring(0, 197) + "..."
      : firstParagraph;

  return { title, description };
}
