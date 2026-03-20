export function getImagePath(imageId: string, width?: number): string {
  const suffix = width ? `_w${width}` : "";
  return `/images/${imageId}${suffix}.avif`;
}

export function getMoviePath(movieId: string): string {
  return `/movies/${movieId}.mp4`;
}

export const getSoundPath = (soundId: string) => {
  return `/sounds/${soundId}.opus`;
};

export function getProfileImagePath(profileImageId: string, width?: number): string {
  const suffix = width ? `_w${width}` : "";
  return `/images/profiles/${profileImageId}${suffix}.avif`;
}
