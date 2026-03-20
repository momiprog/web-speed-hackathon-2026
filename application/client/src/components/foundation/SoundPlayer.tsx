import { ReactEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AspectRatioBox } from "@web-speed-hackathon-2026/client/src/components/foundation/AspectRatioBox";
import { FontAwesomeIcon } from "@web-speed-hackathon-2026/client/src/components/foundation/FontAwesomeIcon";
import { SoundWaveSVG } from "@web-speed-hackathon-2026/client/src/components/foundation/SoundWaveSVG";
import { useFetch } from "@web-speed-hackathon-2026/client/src/hooks/use_fetch";
import { fetchBinary } from "@web-speed-hackathon-2026/client/src/utils/fetchers";
import { getSoundPath } from "@web-speed-hackathon-2026/client/src/utils/get_path";

interface Props {
  sound: Models.Sound;
}

export const SoundPlayer = ({ sound }: Props) => {
  const [shouldLoad, setShouldLoad] = useState(false);
  const { data, isLoading } = useFetch(shouldLoad ? getSoundPath(sound.id) : "", fetchBinary);

  const blobUrl = useMemo(() => {
    return data !== null ? URL.createObjectURL(new Blob([data])) : null;
  }, [data]);

  const [currentTimeRatio, setCurrentTimeRatio] = useState(0);
  const handleTimeUpdate = useCallback<ReactEventHandler<HTMLAudioElement>>((ev) => {
    const el = ev.currentTarget;
    setCurrentTimeRatio(el.currentTime / el.duration);
  }, []);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const handleTogglePlaying = useCallback(() => {
    if (!shouldLoad) {
      setShouldLoad(true);
      return;
    }

    setIsPlaying((isPlaying) => {
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play();
      }
      return !isPlaying;
    });
  }, [shouldLoad]);

  const isActuallyLoading = shouldLoad && (isLoading || data === null || blobUrl === null);

  // 初回ロード完了時に自動再生されるように useEffect を追加
  useEffect(() => {
    if (data && shouldLoad && audioRef.current && !isPlaying) {
      void audioRef.current.play();
      setIsPlaying(true);
    }
  }, [data, shouldLoad]);

  return (
    <div className="bg-cax-surface-subtle flex h-full w-full items-center justify-center min-h-[100px]">
      {blobUrl && (
        <audio ref={audioRef} loop={true} onTimeUpdate={handleTimeUpdate} src={blobUrl} />
      )}
      <div className="p-2">
        <button
          className="bg-cax-accent text-cax-surface-raised flex h-8 w-8 items-center justify-center rounded-full text-sm hover:opacity-75 relative focus:outline-none"
          onClick={handleTogglePlaying}
          type="button"
          disabled={isActuallyLoading}
        >
          {isActuallyLoading ? (
             <div className="absolute inset-0 flex items-center justify-center animate-spin">
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent" />
             </div>
          ) : (
            <FontAwesomeIcon iconType={isPlaying ? "pause" : "play"} styleType="solid" />
          )}
        </button>
      </div>
      <div className="flex h-full min-w-0 shrink grow flex-col pt-2">
        <p className="overflow-hidden text-sm font-bold text-ellipsis whitespace-nowrap">
          {sound.title}
        </p>
        <p className="text-cax-text-muted overflow-hidden text-sm text-ellipsis whitespace-nowrap">
          {sound.artist}
        </p>
        <div className="pt-2 pb-2 pr-2">
          <AspectRatioBox aspectHeight={1} aspectWidth={10}>
            <div className="relative h-full w-full">
              <div className="absolute inset-0 h-full w-full">
                {data ? (
                    <SoundWaveSVG soundData={data} />
                ) : (
                    <div className="h-full w-full bg-stone-300 animate-pulse rounded" />
                )}
              </div>
              <div
                className="bg-cax-surface-subtle absolute inset-0 h-full w-full opacity-75"
                style={{ left: `${currentTimeRatio * 100}%` }}
              ></div>
            </div>
          </AspectRatioBox>
        </div>
      </div>
    </div>
  );
};
