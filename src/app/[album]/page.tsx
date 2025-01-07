import { getAlbumImages, getAlbums } from "@/utils/fileSystem";
import AlbumGallery from "./AlbumGallery"; // Import the client component

export async function generateStaticParams() {
  const albums = await getAlbums();

  return albums.map((al) => ({ album: encodeURIComponent(al.album) })); // Encode here as well
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ album: string }>;
}) {
  const { album } = await params;
  const images = await getAlbumImages(album, undefined);
  const decodedAlbum = decodeURIComponent(album);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8  break-words">{decodedAlbum}</h1>
      <AlbumGallery album={decodedAlbum} images={images} />
    </div>
  );
}
