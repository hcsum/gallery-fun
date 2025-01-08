"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { AlbumInfo } from "@/utils/fileSystem";
import { throttle } from "lodash";
import AlbumGallery from "./AlbumGallery";

export default function AlbumList({
  initialAlbums,
  initialNextToken,
  getAlbums,
}: {
  initialAlbums: { firstImage: string | null; info: AlbumInfo }[];
  initialNextToken: string | undefined;
  getAlbums: (
    nextToken?: string,
    maxKeys?: number,
  ) => Promise<{
    albums: { firstImage: string | null; info: AlbumInfo }[];
    nextToken: string | undefined;
  }>;
}) {
  const [albums, setAlbums] = useState(initialAlbums);
  const [clickedAlbum, setClickedAlbum] = useState<AlbumInfo>();
  const [nextToken, setNextToken] = useState(initialNextToken);
  const [isLoading, setIsLoading] = useState(false);
  const { ref, inView } = useInView({ threshold: 1 });

  const fetchMoreAlbums = useCallback(
    throttle(async () => {
      if (isLoading || nextToken === undefined) return;

      setIsLoading(true);

      try {
        const { albums: newAlbums, nextToken: newNextToken } = await getAlbums(
          nextToken,
          10,
        );
        setAlbums((prev) => [...prev, ...newAlbums]);
        setNextToken(newNextToken);
      } catch (error) {
        console.error("Failed to fetch more albums:", error);
      } finally {
        setIsLoading(false);
      }
    }, 1000),
    [isLoading, nextToken, getAlbums],
  );

  useEffect(() => {
    if (inView) {
      fetchMoreAlbums();
    }
  }, [inView, fetchMoreAlbums]);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map(({ firstImage, info }) => (
          <a
            key={info.albumId}
            className="group block"
            onClick={() => setClickedAlbum(info)}
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
                  alt={`${info.title} cover`}
                  width={500}
                  height={500}
                  className="w-full object-cover group-hover:scale-105 transition-transform"
                  priority={true}
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
          </a>
        ))}
      </div>
      <div ref={ref} className="h-10" />
      {isLoading && <p className="text-center mt-4">Loading...</p>}
      {nextToken === undefined && !isLoading && (
        <p className="text-center mt-4">All.</p>
      )}
      <AlbumGallery
        onClose={() => setClickedAlbum(undefined)}
        album={clickedAlbum}
      />
    </div>
  );
}
