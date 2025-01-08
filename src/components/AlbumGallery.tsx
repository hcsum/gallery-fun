"use client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import LivePhotoIcon from "@/components/LivePhotoIcon";
import { AlbumInfo } from "@/utils/fileSystem";
import { fetchAlbumImages } from "@/app/actions";

export default function AlbumGallery({
  album,
  onClose,
}: {
  album: AlbumInfo | undefined;
  onClose: () => void;
}) {
  const [images, setImages] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState<string>();
  const [startX, setStartX] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchImages = useCallback(async () => {
    setIsLoading(true);

    try {
      const { images } = await fetchAlbumImages(album!.albumId, undefined);
      // setImages((prev) => [...prev, ...images]);
      setImages(images);
      setFeaturedImage(images[0]);
      // setNextToken(newNextToken);
    } catch (error) {
      console.error("Failed to fetch album images:", error);
    } finally {
      setIsLoading(false);
    }
  }, [album]);

  useEffect(() => {
    if (album) fetchImages();
  }, [album, fetchImages]);

  const handleNextImage = useCallback(() => {
    if (!featuredImage) return;
    const currentIndex = images.indexOf(featuredImage);
    const nextIndex = (currentIndex + 1) % images.length;
    setFeaturedImage(images[nextIndex]);
  }, [featuredImage, images]);

  const handlePrevImage = useCallback(() => {
    if (!featuredImage) return;
    const currentIndex = images.indexOf(featuredImage);
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setFeaturedImage(images[prevIndex]);
  }, [featuredImage, images]);

  const handleTouchStart = (event: React.TouchEvent) => {
    setStartX(event.touches[0].clientX);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!startX) return;

    const endX = event.touches[0].clientX;
    const diffX = startX - endX;

    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
      setStartX(null);
    }
  };

  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      e.preventDefault();
    };

    document.addEventListener("touchmove", preventScroll, { passive: false });
    return () => {
      document.removeEventListener("touchmove", preventScroll);
    };
  }, []);

  const close = useCallback(() => {
    setFeaturedImage(undefined);
    setImages([]);
    onClose();
  }, [onClose]);

  const isVideo = (fileName = "") => {
    return fileName.endsWith(".mp4");
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowRight":
          handleNextImage();
          break;
        case "ArrowLeft":
          handlePrevImage();
          break;
        case "Escape":
          close();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [close, featuredImage, handleNextImage, handlePrevImage]);

  if (!album) return null;

  return (
    <div className="grid gap-4">
      {
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl"
            onClick={close}
          >
            &times;
          </button>

          <div className="relative w-full">
            {images.length > 0 && (
              <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl z-1"
                onClick={handlePrevImage}
              >
                &#8249;
              </button>
            )}
            {!featuredImage || isLoading ? (
              <div className="animate-pulse flex items-center justify-center w-full h-80 bg-gray-300 rounded sm:w-96 dark:bg-gray-700">
                <svg
                  className="w-10 h-10 text-gray-200 dark:text-gray-600"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 18"
                >
                  <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                </svg>
              </div>
            ) : isVideo(featuredImage) ? (
              <div className="relative w-full h-full">
                <LivePhotoIcon />
                <video
                  className="rounded-lg"
                  src={featuredImage}
                  width={800}
                  height={500}
                  autoPlay
                  loop
                  muted
                />
              </div>
            ) : (
              <Image
                className="rounded-lg"
                src={featuredImage}
                alt={featuredImage}
                width={800}
                height={500}
                loading="lazy" // Lazy load modal image
                placeholder="empty" // Add placeholder blur effect
              />
            )}
            {images.length > 0 && (
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl"
                onClick={handleNextImage}
              >
                &#8250;
              </button>
            )}
          </div>
        </div>
      }
    </div>
  );
}
