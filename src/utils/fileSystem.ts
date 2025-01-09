import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { notFound } from "next/navigation";

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const bucketName = process.env.R2_BUCKET_NAME;
const Prefix = "my-albums/";

export const getAlbums = async (
  nextToken?: string,
  maxKeys: number = 10,
): Promise<{
  albums: { firstImage: string | null; info: AlbumInfo }[];
  nextToken: string | undefined;
}> => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Delimiter: "/",
      MaxKeys: maxKeys,
      Prefix,
      ContinuationToken: nextToken,
    });
    const response = await s3Client.send(command);

    // console.log("response.CommonPrefixes", response.CommonPrefixes);

    const albumInfos =
      response.CommonPrefixes?.map(
        (prefix) => parseAlbumFolderName(prefix.Prefix?.split("/")[1] || ""), // tofix: change 1 back to 0 for normal albums
      ) || [];

    // console.log("albums", albumInfos);

    const albumsWithImages = await Promise.all(
      albumInfos.map(async (info) => {
        const { images } = await getAlbumImages(info.albumId, 2); // 即使是live photo，前两张应该会有一张是照片
        return {
          firstImage:
            images.filter((img) => /\.(jpg|jpeg|png)$/i.test(img))[0] || null,
          info,
        };
      }),
    );

    return {
      albums: albumsWithImages,
      nextToken: response.NextContinuationToken,
    };
  } catch (error) {
    console.error("Error reading albums:", error);
    notFound();
  }
};

export const getAlbumImages = async (
  album: string,
  MaxKeys: number | undefined,
): Promise<{ images: string[]; albumInfo: AlbumInfo }> => {
  console.log("getAlbumImages");
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: `${Prefix}${decodeURIComponent(album)}`,
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
      albumInfo: parseAlbumFolderName(decodeURIComponent(fullAlbumName ?? "")),
    };
  } catch (error) {
    console.error(`Error reading images for ${album}:`, error);
    notFound();
  }
};

function getImageFullUrl(image: string): string {
  return `https://${process.env.NEXT_PUBLIC_BUCKET_DOMAIN}/${encodeURIComponent(image)}`;
}

export type AlbumInfo = {
  albumId: string;
  date: string;
  time: string;
  author: string;
  authorId: string;
  title: string;
};

function parseAlbumFolderName(input: string): AlbumInfo {
  const [albumId, date, time, author, authorId, ...title] = input.split("_");

  return {
    albumId,
    date,
    time,
    author,
    authorId,
    title: title.join(),
  };
}
