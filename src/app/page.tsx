import Link from "next/link";
import Image from "next/image";
import { getAlbums, getImagePath } from "@/utils/fileSystem";

export default async function Home() {
  const albums = await getAlbums();

  console.log("albums", albums);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 capitalize text-center">Albums</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map(({ album, firstImage }) => (
          <Link
            key={album}
            href={`${encodeURIComponent(album)}`}
            className="group block"
          >
            <div className="relative w-full overflow-hidden rounded-lg shadow-md bg-gray-100 dark:bg-gray-800 hover:shadow-lg transition-shadow">
              {firstImage?.endsWith(".mp4") ? (
                <video
                  src={`${getImagePath(album, firstImage)}`}
                  width={500}
                  height={500}
                  className="h-48 w-full object-cover group-hover:scale-105 transition-transform"
                  controls
                  muted
                  loop
                />
              ) : (
                <Image
                  src={`${getImagePath(album, firstImage ?? "")}`}
                  alt={`${album} cover`}
                  width={500}
                  height={500}
                  className="h-48 w-full object-cover group-hover:scale-105 transition-transform"
                  priority={true} // Optimizes above-the-fold images
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
                <h2 className="text-xl font-semibold text-white">{album}</h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
