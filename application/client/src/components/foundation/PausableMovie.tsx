import { Animator, Decoder } from "gifler";
import { GifReader } from "omggif";
import { RefCallback, useCallback, useRef, useState } from "react";

import { AspectRatioBox } from "@web-speed-hackathon-2026/client/src/components/foundation/AspectRatioBox";
import { FontAwesomeIcon } from "@web-speed-hackathon-2026/client/src/components/foundation/FontAwesomeIcon";
import { useFetch } from "@web-speed-hackathon-2026/client/src/hooks/use_fetch";
import { fetchBinary } from "@web-speed-hackathon-2026/client/src/utils/fetchers";

interface Props {
  src: string;
}

/**
 * クリックすると再生・一時停止を切り替えます。
 */
export const PausableMovie = ({ src }: Props) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const { data, isLoading } = useFetch(shouldLoad ? src : "", fetchBinary);

  const animatorRef = useRef<Animator>(null);
  const canvasCallbackRef = useCallback<RefCallback<HTMLCanvasElement>>(
    (el) => {
      animatorRef.current?.stop();

      if (el === null || data === null) {
        return;
      }

      // GIF を解析する
      const reader = new GifReader(new Uint8Array(data));
      const frames = Decoder.decodeFramesSync(reader);
      const animator = new Animator(reader, frames);

      animator.animateInCanvas(el);
      animator.onFrame(frames[0]!);

      // 再生開始
      animator.start();
      setIsPlaying(true);

      animatorRef.current = animator;
    },
    [data],
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const handleClick = useCallback(() => {
    if (!shouldLoad) {
      setShouldLoad(true);
      return;
    }

    setIsPlaying((isPlaying) => {
      if (isPlaying) {
        animatorRef.current?.stop();
      } else {
        animatorRef.current?.start();
      }
      return !isPlaying;
    });
  }, [shouldLoad]);

  const isActuallyLoading = shouldLoad && (isLoading || data === null);

  return (
    <AspectRatioBox aspectHeight={1} aspectWidth={1}>
      <button
        aria-label="動画プレイヤー"
        className="group relative block h-full w-full bg-cax-surface-subtle"
        onClick={handleClick}
        type="button"
      >
        {isActuallyLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-cax-brand border-t-transparent" />
            </div>
        ) : data ? (
            <canvas ref={canvasCallbackRef} className="w-full" />
        ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-stone-200">
                <div className="flex items-center justify-center w-16 h-16 text-cax-surface-raised text-3xl bg-cax-overlay/50 rounded-full">
                    <FontAwesomeIcon iconType="play" styleType="solid" />
                </div>
            </div>
        )}
        {data && (
            <div
            className={`absolute left-1/2 top-1/2 flex items-center justify-center w-16 h-16 text-cax-surface-raised text-3xl bg-cax-overlay/50 rounded-full -translate-x-1/2 -translate-y-1/2 ${isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"}`}
            >
                <FontAwesomeIcon iconType={isPlaying ? "pause" : "play"} styleType="solid" />
            </div>
        )}
      </button>
    </AspectRatioBox>
  );
};
