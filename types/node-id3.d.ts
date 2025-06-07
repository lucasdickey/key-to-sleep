declare module "node-id3" {
  export interface ID3Tag {
    title?: string;
    artist?: string;
    album?: string;
    year?: string;
    genre?: string;
    comment?: string;
    trackNumber?: string;
    partOfSet?: string;
    image?: {
      mime: string;
      type: {
        id: number;
        name: string;
      };
      description: string;
      imageBuffer: Buffer;
    };
  }

  export function write(tags: ID3Tag, file: string | Buffer): boolean | Buffer;
  export function read(file: string | Buffer): ID3Tag | null;
  export function update(tags: ID3Tag, file: string | Buffer): boolean | Buffer;
  export function remove(file: string | Buffer): boolean | Buffer;
}
