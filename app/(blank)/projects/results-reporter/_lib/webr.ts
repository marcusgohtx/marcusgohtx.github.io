const WEBR_MODULE_URL = "https://webr.r-wasm.org/latest/webr.mjs";

type CapturedMessage = {
  type: string;
  data: unknown;
};

type CaptureResult = {
  images?: ImageBitmap[];
  output?: CapturedMessage[];
};

type Shelter = {
  captureR(
    code: string,
    options?: {
      captureGraphics?: boolean | { capture?: true; width: number; height: number; bg?: string };
      captureStreams?: boolean;
      withAutoprint?: boolean;
      throwJsException?: boolean;
    },
  ): Promise<CaptureResult>;
  purge(): Promise<void>;
};

type WebRInstance = {
  init(): Promise<void>;
  installPackages(
    packages: string[],
    options?: {
      quiet?: boolean;
      mount?: boolean;
    },
  ): Promise<void>;
  FS: {
    writeFile(path: string, data: string): Promise<void> | void;
  };
  Shelter: new () => Promise<Shelter>;
};

let webRPromise: Promise<WebRInstance> | null = null;
let ggplotInstallPromise: Promise<void> | null = null;

async function loadWebRModule() {
  return import(/* webpackIgnore: true */ WEBR_MODULE_URL);
}

export async function getWebR() {
  if (!webRPromise) {
    webRPromise = (async () => {
      const webRModule = (await loadWebRModule()) as { WebR: new () => WebRInstance };
      const webR = new webRModule.WebR();
      await webR.init();
      return webR;
    })();
  }

  return webRPromise;
}

export async function ensureGgplot2(webR: WebRInstance) {
  if (!ggplotInstallPromise) {
    ggplotInstallPromise = webR.installPackages(["ggplot2"], {
      quiet: true,
      mount: true,
    });
  }

  return ggplotInstallPromise;
}

export async function runCapturedR(options: {
  code: string;
  files?: Array<{ path: string; content: string }>;
}) {
  const webR = await getWebR();

  await ensureGgplot2(webR);

  for (const file of options.files ?? []) {
    await webR.FS.writeFile(file.path, file.content);
  }

  const shelter = await new webR.Shelter();

  try {
    const capture = await shelter.captureR(options.code, {
      captureStreams: true,
      withAutoprint: false,
      throwJsException: true,
      captureGraphics: {
        capture: true,
        width: 720,
        height: 440,
        bg: "white",
      },
    });

    const output = (capture.output ?? [])
      .map((entry) => {
        if (typeof entry.data === "string") {
          return entry.data;
        }

        if (typeof entry.data === "number" || typeof entry.data === "boolean") {
          return String(entry.data);
        }

        if (Array.isArray(entry.data)) {
          return entry.data.join("");
        }

        if (entry.type === "error") {
          return "An R error occurred.";
        }

        return "";
      })
      .join("");

    return {
      images: capture.images ?? [],
      output,
    };
  } finally {
    await shelter.purge();
  }
}
