import magickWasm from "@imagemagick/magick-wasm/magick.wasm?binary";

interface Options {
  extension: any; // MagickFormat
}

let isMagickInitialized = false;
let magickInitPromise: Promise<void> | null = null;

export async function convertImage(file: File, options: Options): Promise<Blob> {
  const { initializeImageMagick, ImageMagick } = await import("@imagemagick/magick-wasm");

  if (!isMagickInitialized) {
    if (!magickInitPromise) {
      magickInitPromise = (async () => {
        const response = await fetch(magickWasm as unknown as string);
        const bytes = new Uint8Array(await response.arrayBuffer());
        await initializeImageMagick(bytes);
        isMagickInitialized = true;
      })();
    }
    await magickInitPromise;
  }

  const byteArray = new Uint8Array(await file.arrayBuffer());

  return new Promise((resolve) => {
    ImageMagick.read(byteArray, async (img) => {
      img.format = options.extension;

      const comment = img.comment;

      await img.write(async (output) => {
        if (comment == null) {
          resolve(new Blob([output as Uint8Array<ArrayBuffer>]));
          return;
        }

        const piexif = await import("piexifjs");
        const { dump, insert, ImageIFD } = (piexif as any).default || piexif;
        // ImageMagick では EXIF の ImageDescription フィールドに保存されているデータが
        // 非標準の Comment フィールドに移されてしまうため
        // piexifjs を使って ImageDescription フィールドに書き込む
        if (options.extension === "JPG" || options.extension === "JPEG") {
          const binary = Array.from(output as Uint8Array<ArrayBuffer>)
            .map((b) => String.fromCharCode(b))
            .join("");
          const descriptionBinary = Array.from(new TextEncoder().encode(comment))
            .map((b) => String.fromCharCode(b))
            .join("");
          const exifStr = dump({ "0th": { [ImageIFD.ImageDescription]: descriptionBinary } });
          const outputWithExif = insert(exifStr, binary);
          const bytes = Uint8Array.from(outputWithExif.split("").map((c: string) => c.charCodeAt(0)));
          resolve(new Blob([bytes]));
        } else {
          resolve(new Blob([output as Uint8Array<ArrayBuffer>]));
        }
      });
    });
  });
}
