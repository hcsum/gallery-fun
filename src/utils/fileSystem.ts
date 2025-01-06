import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const bucketName = process.env.R2_BUCKET_NAME;

export async function getAlbums(): Promise<
  { album: string; firstImage: string | null }[]
> {
  console.log("getAlbums");
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Delimiter: "/",
      MaxKeys: process.env.NODE_ENV === "development" ? 10 : undefined,
    });
    const response = await s3Client.send(command);

    const albums =
      response.CommonPrefixes?.map(
        (prefix) => prefix.Prefix?.split("/")[0] || "",
      ) || [];

    const albumsWithImages = await Promise.all(
      albums.map(async (album) => {
        const images = await getAlbumImages(album, 1); // Get the first image
        return { album, firstImage: images[0] || null }; // Return album name and first image
      }),
    );

    return albumsWithImages;
  } catch (error) {
    console.error("Error reading albums:", error);
    return [];
  }
}

export async function getAlbumImages(
  album: string,
  MaxKeys: number | undefined,
): Promise<string[]> {
  console.log("getAlbumImages", album);
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: `${decodeURIComponent(album)}/`,
      MaxKeys,
    });
    const response = await s3Client.send(command);
    return (
      response.Contents?.map((item) => item.Key?.split("/").pop() || "").filter(
        (file) => /\.(jpg|jpeg|png|gif|webp|mp4)$/i.test(file),
      ) || []
    );
  } catch (error) {
    console.error(`Error reading images for ${album}:`, error);
    return [];
  }
}

export function getImagePath(album: string, image: string): string {
  return `https://${process.env.NEXT_PUBLIC_BUCKET_DOMAIN}/${encodeURIComponent(album)}/${encodeURIComponent(image)}`;
}
