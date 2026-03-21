export function getImagePath(imageId: string, _width?: number): string {
  // src の末尾に _w200.avif を付ける処理を一旦停止し、元のURLで画像が表示されるか確認
  return `/images/${imageId}.avif`;
}

export function getMoviePath(movieId: string): string {
  return `/movies/${movieId}.mp4`;
}

export const getSoundPath = (soundId: string) => {
  return `/sounds/${soundId}.opus`;
};

export function getProfileImagePath(profileImageId: string, _width?: number): string {
  return `/images/profiles/${profileImageId}.avif`;
}
