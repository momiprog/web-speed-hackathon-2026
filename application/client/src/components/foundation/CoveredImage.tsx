import classNames from "classnames";
import { MouseEvent, RefCallback, useCallback, useEffect, useId, useState } from "react";

import { Button } from "@web-speed-hackathon-2026/client/src/components/foundation/Button";
import { Modal } from "@web-speed-hackathon-2026/client/src/components/modal/Modal";
import { useFetch } from "@web-speed-hackathon-2026/client/src/hooks/use_fetch";
import { fetchBinary } from "@web-speed-hackathon-2026/client/src/utils/fetchers";

interface Props {
  src: string;
}

/**
 * アスペクト比を維持したまま、要素のコンテンツボックス全体を埋めるように画像を拡大縮小します
 */
export const CoveredImage = ({ src }: Props) => {
  const dialogId = useId();
  // ダイアログの背景をクリックしたときに投稿詳細ページに遷移しないようにする
  const handleDialogClick = useCallback((ev: MouseEvent<HTMLDialogElement>) => {
    ev.stopPropagation();
  }, []);

  const { data, isLoading } = useFetch(src, fetchBinary);

  const [imageSize, setImageSize] = useState({ height: 0, width: 0, type: undefined as string | undefined });
  const [alt, setAlt] = useState("");
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    
    const url = URL.createObjectURL(new Blob([data]));
    setBlobUrl(url);

    import("../../utils/worker_manager").then(async ({ WorkerManager }) => {
      try {
        // 画像サイズを Worker で取得
        const size = await WorkerManager.request<any>("getImageSize", data.slice(0));
        setImageSize(size);

        // EXIF 解析
        if (size.type && ["jpg", "jpeg"].includes(size.type)) {
          const exifAlt = await WorkerManager.request<string>("extractExif", data.slice(0));
          setAlt(exifAlt);
        }
      } catch (err) {
        console.error("Worker error:", err);
      }
    });

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [data]);

  const [containerSize, setContainerSize] = useState({ height: 0, width: 0 });
  const callbackRef = useCallback<RefCallback<HTMLDivElement>>((el) => {
    if (!el) return;
    setContainerSize({
      height: el.clientHeight,
      width: el.clientWidth,
    });
  }, []);

  if (isLoading || data === null || blobUrl === null) {
    return <div className="bg-cax-surface-subtle h-full w-full animate-pulse rounded-lg" />;
  }

  const containerRatio = containerSize.height / containerSize.width;
  const imageRatio = imageSize?.height / imageSize?.width;

  return (
    <div ref={callbackRef} className="relative h-full w-full overflow-hidden">
      <img
        alt={alt}
        className={classNames(
          "absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2",
          {
            "w-auto h-full": containerRatio > imageRatio,
            "w-full h-auto": containerRatio <= imageRatio,
          },
        )}
        src={blobUrl}
      />

      <button
        className="border-cax-border bg-cax-surface-raised/90 text-cax-text-muted hover:bg-cax-surface absolute right-1 bottom-1 rounded-full border px-2 py-1 text-center text-xs"
        type="button"
        command="show-modal"
        commandfor={dialogId}
      >
        ALT を表示する
      </button>

      <Modal id={dialogId} closedby="any" onClick={handleDialogClick}>
        <div className="grid gap-y-6">
          <h1 className="text-center text-2xl font-bold">画像の説明</h1>

          <p className="text-sm">{alt}</p>

          <Button variant="secondary" command="close" commandfor={dialogId}>
            閉じる
          </Button>
        </div>
      </Modal>
    </div>
  );
};
