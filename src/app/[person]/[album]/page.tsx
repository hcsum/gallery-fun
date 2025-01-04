import Image from "next/image";
import {
  getAlbumImages,
  getPersons,
  getAlbums,
  getImagePath,
} from "@/utils/fileSystem";

export async function generateStaticParams() {
  const persons = await getPersons();
  const paths = [];

  for (const person of persons) {
    const albums = await getAlbums(person);
    for (const album of albums) {
      paths.push({
        person: encodeURIComponent(person),
        album: encodeURIComponent(album),
      });
    }
  }

  return paths;
}

export default async function AlbumPage({
  params: { person, album },
}: {
  params: { person: string; album: string };
}) {
  const images = await getAlbumImages(person, album);
  const decodedPerson = decodeURIComponent(person);
  const decodedAlbum = decodeURIComponent(album);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">
        {decodedPerson}&apos;s {decodedAlbum} Album
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div
            key={image}
            className="aspect-square relative rounded-lg overflow-hidden"
          >
            <Image
              src={getImagePath(decodedPerson, decodedAlbum, image)}
              alt={decodeURIComponent(image)}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
