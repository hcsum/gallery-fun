import Link from "next/link";
import { getPersons } from "@/utils/fileSystem";

export default async function Home() {
  const persons = await getPersons();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Photo Gallery</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {persons.map((person) => (
          <Link
            key={person}
            href={`/${encodeURIComponent(person)}`}
            className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold">{person}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}
