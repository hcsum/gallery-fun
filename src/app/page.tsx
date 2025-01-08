import AlbumList from "@/components/AlbumList";
import { fetchAlbums } from "./actions";

export const runtime = "edge";

export default async function Home() {
  const initialData = await fetchAlbums(undefined, 10);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 capitalize text-center">Albums</h1>
      <AlbumList
        getAlbums={fetchAlbums}
        initialAlbums={initialData.albums}
        initialNextToken={initialData.nextToken}
      />
    </div>
  );
}
