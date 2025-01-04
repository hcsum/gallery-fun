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

export async function getPersons(): Promise<string[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Delimiter: "/",
    });
    const response = await s3Client.send(command);
    return (
      response.CommonPrefixes?.map(
        (prefix) => prefix.Prefix?.slice(0, -1) || "",
      ) || []
    );
  } catch (error) {
    console.error("Error reading persons:", error);
    return [];
  }
}

export async function getAlbums(person: string): Promise<string[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: `${decodeURIComponent(person)}/`,
      Delimiter: "/",
    });
    const response = await s3Client.send(command);
    return (
      response.CommonPrefixes?.map(
        (prefix) => prefix.Prefix?.split("/")[1] || "",
      ) || []
    );
  } catch (error) {
    console.error(`Error reading albums for ${person}:`, error);
    return [];
  }
}

export async function getAlbumImages(
  person: string,
  album: string,
): Promise<string[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: `${decodeURIComponent(person)}/${decodeURIComponent(album)}/`,
    });
    const response = await s3Client.send(command);
    return (
      response.Contents?.map((item) => item.Key?.split("/").pop() || "").filter(
        (file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file),
      ) || []
    );
  } catch (error) {
    console.error(`Error reading images for ${person}/${album}:`, error);
    return [];
  }
}

export function getImagePath(
  person: string,
  album: string,
  image: string,
): string {
  return `https://${process.env.BUCKET_DOMAIN}/${encodeURIComponent(person)}/${encodeURIComponent(album)}/${encodeURIComponent(image)}`;
}
