"use server";
import { cache } from "react";
import { getAlbumImages, getAlbums } from "@/utils/fileSystem";

export const fetchAlbums = cache(
  async (nextToken?: string, maxKeys: number = 10) => {
    return getAlbums(nextToken, maxKeys);
  },
);

export const fetchAlbumImages = cache(
  async (album: string, MaxKeys?: number) => {
    return getAlbumImages(album, MaxKeys);
  },
);
