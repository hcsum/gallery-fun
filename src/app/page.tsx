import Link from "next/link";
import Image from "next/image";
import { getAlbums } from "@/utils/fileSystem";

export default async function Home() {
  const albums = await getAlbums();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 capitalize text-center">Albums</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map(({ album, firstImage, info }) => (
          <Link
            key={album}
            href={`${encodeURIComponent(album)}`}
            className="group block"
          >
            <div className="relative w-full overflow-hidden rounded-lg shadow-md bg-gray-100 dark:bg-gray-800 hover:shadow-lg transition-shadow">
              {firstImage?.endsWith(".mp4") ? (
                <video
                  src={firstImage}
                  width={500}
                  height={800}
                  className="w-full object-cover group-hover:scale-105 transition-transform"
                  muted
                />
              ) : (
                <Image
                  src={firstImage ?? ""}
                  alt={`${album} cover`}
                  width={500}
                  height={500}
                  className="w-full object-cover group-hover:scale-105 transition-transform"
                  priority={true} // Optimizes above-the-fold images
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
                <h2 className="text-xl font-semibold text-white">
                  {info.title}
                </h2>
                <h2 className="text-xl font-semibold text-white">
                  {info.author}
                </h2>
                <p className="text-white">{info.date}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
