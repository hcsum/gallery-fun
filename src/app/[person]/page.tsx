import Link from "next/link";
import { getAlbums, getPersons } from "@/utils/fileSystem";

export async function generateStaticParams() {
  const persons = await getPersons();
  return persons.map((person) => ({ person: encodeURIComponent(person) }));
}

export default async function PersonPage({
  params: { person },
}: {
  params: { person: string };
}) {
  const albums = await getAlbums(person);
  const decodedPerson = decodeURIComponent(person);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 capitalize">
        {decodedPerson}&apos;s Albums
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {albums.map((album) => (
          <Link
            key={album}
            href={`/${person}/${encodeURIComponent(album)}`}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold">{album}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
