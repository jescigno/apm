export const TRACK_THUMBNAILS = [
  '/AlbumArt-Placeholders/ANEW_ANEW_0023.jpg',
  '/AlbumArt-Placeholders/BRU_HKD_0062.jpg',
  '/AlbumArt-Placeholders/JCM_JM_0411.jpg',
  '/AlbumArt-Placeholders/KOS_KOA_4026.jpg',
  '/AlbumArt-Placeholders/MYMA_JUST_0381.jpg',
  '/AlbumArt-Placeholders/MYMA_JUST_0392.jpg',
  '/AlbumArt-Placeholders/SON_SCDV_1498.jpg',
  '/AlbumArt-Placeholders/SON_SCDV_1501.jpg',
  '/AlbumArt-Placeholders/SON_SURE_0171.jpg',
  '/AlbumArt-Placeholders/placeholder.jpeg',
  '/AlbumArt-Placeholders/placeholder2.jpeg',
  '/AlbumArt-Placeholders/placeholder3.jpeg',
  '/AlbumArt-Placeholders/placeholder4.jpeg',
  '/AlbumArt-Placeholders/placeholder5.jpeg',
  '/AlbumArt-Placeholders/placeholder6.jpeg',
  '/AlbumArt-Placeholders/placeholder7.jpeg',
  '/AlbumArt-Placeholders/placeholder8.jpeg',
  '/AlbumArt-Placeholders/placeholder9.jpeg',
  '/AlbumArt-Placeholders/placeholder10.jpeg',
  '/AlbumArt-Placeholders/placeholder11.jpeg',
  '/AlbumArt-Placeholders/placeholder12.jpeg',
];

const ALBUM_THUMB_ORDER = Array.from(
  { length: TRACK_THUMBNAILS.length },
  (_, index) => (index * 5) % TRACK_THUMBNAILS.length
);

export function getTrackThumbStyle(trackOrAlbum, isAlbum = false) {
  const thumbIndex = isAlbum
    ? ALBUM_THUMB_ORDER[(trackOrAlbum.num - 1) % ALBUM_THUMB_ORDER.length]
    : (trackOrAlbum.num - 1) % TRACK_THUMBNAILS.length;
  const thumbSrc = TRACK_THUMBNAILS[thumbIndex];
  return {
    backgroundImage: `url('${thumbSrc}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
}

export function getTrackThumbSrc(trackOrAlbum, isAlbum = false) {
  const thumbIndex = isAlbum
    ? ALBUM_THUMB_ORDER[(trackOrAlbum.num - 1) % ALBUM_THUMB_ORDER.length]
    : (trackOrAlbum.num - 1) % TRACK_THUMBNAILS.length;
  return TRACK_THUMBNAILS[thumbIndex];
}
