import Image from "next/image";

export default function LivePhotoIcon({ small }: { small?: boolean }) {
  if (small) {
    return (
      <div className="live-photo-small flex justify-center items-center absolute top-1 left-1 rounded-full p-1 bg-gray-500 bg-opacity-50">
        <Image
          className="w-5 h-5"
          src="/live-photos-100.png"
          alt="live photo icon"
          width={100}
          height={100}
        />
      </div>
    );
  }

  return (
    <div className="live-photo flex flex-row items-center absolute top-1 left-1 rounded-full p-1 bg-gray-500 bg-opacity-50">
      <Image
        className="mr-1 w-5 h-5"
        src="/live-photos-100.png"
        alt="live photo icon"
        width={100}
        height={100}
      />
      <span className="text-white text-xs">LIVE</span>
    </div>
  );
}
