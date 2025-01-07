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
  { album: string; firstImage: string | null; info: AlbumInfo }[]
> {
  console.log("getAlbums");
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Delimiter: "/",
      MaxKeys: process.env.NODE_ENV === "development" ? 10 : undefined,
    });
    const response = await s3Client.send(command);

    // console.log("response.CommonPrefixes", response.CommonPrefixes);

    const albumInfos =
      response.CommonPrefixes?.map((prefix) =>
        parseAlbumFolderName(prefix.Prefix?.split("/")[0] || ""),
      ) || [];

    // console.log("albums", albums);

    const albumsWithImages = await Promise.all(
      albumInfos.map(async (info) => {
        const { images } = await getAlbumImages(info.albumPrefix, 2); // 即使是live photo，前两张应该会有一张是照片
        return {
          album: info.albumPrefix, // use only the prefix for the album slug to prevent file name too long error when build
          firstImage:
            images.filter((img) => /\.(jpg|jpeg|png)$/i.test(img))[0] || null,
          info,
        };
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
): Promise<{ images: string[]; albumInfo: AlbumInfo }> {
  console.log("getAlbumImages");
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: `${decodeURIComponent(album)}`,
      MaxKeys,
    });
    const response = await s3Client.send(command);

    const fullAlbumName = response.Contents?.[0].Key?.split("/").shift();
    const images =
      response.Contents?.map((item) => getImageFullUrl(item.Key || "")).filter(
        (file) => /\.(jpg|jpeg|png|gif|webp|mp4)$/i.test(file),
      ) || [];

    return {
      images,
      albumInfo: parseAlbumFolderName(decodeURIComponent(fullAlbumName ?? "")), // get back the fullAlbumName from image path to retain album title
    };
  } catch (error) {
    console.error(`Error reading images for ${album}:`, error);
    throw error;
  }
}

export function getImageFullUrl(image: string): string {
  return `https://${process.env.NEXT_PUBLIC_BUCKET_DOMAIN}/${encodeURIComponent(image)}`;
}

export type AlbumInfo = {
  albumPrefix: string;
  date: string;
  time: string;
  author: string;
  authorId: string;
  title: string;
};

export function parseAlbumFolderName(input: string): AlbumInfo {
  const [date, time, author, authorId, ...title] = input.split("_");

  return {
    albumPrefix: `${date}_${time}_${author}`,
    date,
    time,
    author,
    authorId,
    title: title.join(),
  };
}
