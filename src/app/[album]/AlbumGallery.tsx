"use client"; // Mark this as a client component
import Image from "next/image";
import { useEffect, useState } from "react";
import { getImagePath } from "@/utils/fileSystem";
import LivePhotoIcon from "@/components/LivePhotoIcon";

export default function AlbumGallery({
  album,
  images,
}: {
  album: string;
  images: string[];
}) {
  const [featuredImage, setFeaturedImage] = useState(images[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startX, setStartX] = useState<number | null>(null);

  const handleNextImage = () => {
    const currentIndex = images.indexOf(featuredImage);
    const nextIndex = (currentIndex + 1) % images.length;
    setFeaturedImage(images[nextIndex]);
  };

  const handlePrevImage = () => {
    const currentIndex = images.indexOf(featuredImage);
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setFeaturedImage(images[prevIndex]);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isModalOpen) return;

      switch (event.key) {
        case "ArrowRight":
          handleNextImage();
          break;
        case "ArrowLeft":
          handlePrevImage();
          break;
        case "Escape":
          closeModal();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, featuredImage, handleNextImage, handlePrevImage]);

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
      if (isModalOpen) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchmove", preventScroll, { passive: false });
    return () => {
      document.removeEventListener("touchmove", preventScroll);
    };
  }, [isModalOpen]);

  const isVideo = (fileName: string) => {
    return fileName.endsWith(".mp4");
  };

  return (
    <div className="grid gap-4">
      {/* Featured Image or Video */}
      <div className="flex justify-center">
        {isVideo(featuredImage) ? (
          <div className="relative">
            <LivePhotoIcon />
            <video
              className="h-auto max-w-full rounded-lg cursor-pointer"
              src={getImagePath(album, featuredImage)}
              width={500}
              height={800}
              onClick={() => setIsModalOpen(true)}
              autoPlay
              loop
              muted
            />
          </div>
        ) : (
          <Image
            className="h-auto max-w-full rounded-lg cursor-pointer"
            src={getImagePath(album, featuredImage)}
            alt={featuredImage}
            width={500}
            height={800}
            onClick={() => setIsModalOpen(true)}
            loading="lazy" // Lazy load featured image
            placeholder="empty" // Add placeholder blur effect
          />
        )}
      </div>

      {/* Thumbnail Gallery */}
      <div className="grid grid-cols-5 gap-4">
        {images.map((image) => (
          <div
            key={image}
            onClick={() => setFeaturedImage(image)}
            className="cursor-pointer"
          >
            {isVideo(image) ? (
              <div className="relative">
                <LivePhotoIcon small />
                <video
                  className="h-auto max-w-full rounded-lg"
                  src={getImagePath(album, image)}
                  width={200}
                  height={200}
                />
              </div>
            ) : (
              <Image
                className="h-auto max-w-full rounded-lg"
                src={getImagePath(album, image)}
                alt={image}
                width={200}
                height={200}
                loading="lazy" // Lazy load thumbnails
                placeholder="empty" // Add placeholder blur effect
              />
            )}
          </div>
        ))}
      </div>

      {/* Modal for Fullscreen Image or Video */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl"
            onClick={closeModal}
          >
            &times;
          </button>

          <div className="relative">
            <button
              className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white text-3xl"
              onClick={handlePrevImage}
            >
              &#8249;
            </button>
            {isVideo(featuredImage) ? (
              <video
                className="rounded-lg"
                src={getImagePath(album, featuredImage)}
                width={800}
                height={500}
                autoPlay
                loop
                muted
              />
            ) : (
              <Image
                className="rounded-lg"
                src={getImagePath(album, featuredImage)}
                alt={featuredImage}
                width={800}
                height={500}
                loading="lazy" // Lazy load modal image
                placeholder="empty" // Add placeholder blur effect
              />
            )}
            <button
              className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white text-3xl"
              onClick={handleNextImage}
            >
              &#8250;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
