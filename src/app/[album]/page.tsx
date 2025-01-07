import { getAlbumImages, getAlbums } from "@/utils/fileSystem";
import AlbumGallery from "./AlbumGallery"; // Import the client component

export async function generateStaticParams() {
  const albums = await getAlbums();

  return albums.map((al) => ({ album: encodeURIComponent(al.album) })); // tofix: really necessary to encode??
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ album: string }>;
}) {
  const { album } = await params;
  const decodedAlbum = decodeURIComponent(album);
  const { images, albumInfo } = await getAlbumImages(decodedAlbum, undefined);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold break-words">{albumInfo.title}</h1>
      <h3 className="text-2xl font-bold break-words">{albumInfo.author}</h3>
      <p className="text-md break-words">{albumInfo.date}</p>
      <p className="text-md break-words mb-8">{albumInfo.time}</p>
      <AlbumGallery images={images} />
    </div>
  );
}
