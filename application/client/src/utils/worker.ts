import Bluebird from "bluebird";
import kuromoji, { type Tokenizer, type IpadicFeatures } from "kuromoji";
import analyze from "negaposi-analyzer-ja";
import { load, ImageIFD } from "piexifjs";

let tokenizer: Tokenizer<IpadicFeatures> | null = null;

async function getTokenizer(): Promise<Tokenizer<IpadicFeatures>> {
  if (tokenizer) return tokenizer;
  // @ts-ignore
  const builder = Bluebird.promisifyAll(kuromoji.builder({ dicPath: "/dicts" }));
  tokenizer = (await builder.buildAsync()) as Tokenizer<IpadicFeatures>;
  return tokenizer;
}

self.onmessage = async (e: MessageEvent) => {
  const { type, payload, id } = e.data;

  try {
    if (type === "analyzeSentiment") {
      const t = await getTokenizer();
      const tokens = t.tokenize(payload);
      const score = analyze(tokens);
      let label: "positive" | "negative" | "neutral" = "neutral";
      if (score > 0.1) label = "positive";
      else if (score < -0.1) label = "negative";
      
      self.postMessage({ id, result: { score, label } });
    } else if (type === "extractExif") {
      // payload は Uint8Array または ArrayBuffer を想定
      const binary = Array.from(new Uint8Array(payload))
        .map((b) => String.fromCharCode(b))
        .join("");
      const exif = load(binary);
      const raw = exif?.["0th"]?.[ImageIFD.ImageDescription];
      const alt = raw != null ? new TextDecoder().decode(Uint8Array.from(raw.split("").map((c: string) => c.charCodeAt(0)))) : "";
      
      self.postMessage({ id, result: alt });
    }
  } catch (error) {
    self.postMessage({ id, error: String(error) });
  }
};
