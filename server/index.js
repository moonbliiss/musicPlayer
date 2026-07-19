import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import cors from "cors";
import express from "express";
import { parseFile } from "music-metadata";
import { AUDIO_EXTENSIONS, HOST, MUSIC_ROOT, PORT } from "./config.js";

const app = express();
const trackMap = new Map();

app.use(cors({ origin: true }));

const createTrackId = (filePath) =>
  crypto.createHash("sha1").update(filePath).digest("hex");

const isInsideMusicRoot = (filePath) => {
  const relativePath = path.relative(MUSIC_ROOT, filePath);
  return (
    relativePath &&
    !relativePath.startsWith("..") &&
    !path.isAbsolute(relativePath)
  );
};

const walkMusicRoot = async (dir) => {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkMusicRoot(fullPath)));
      continue;
    }

    if (
      entry.isFile() &&
      AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
    ) {
      files.push(fullPath);
    }
  }

  return files;
};

const readTrackMetadata = async (filePath) => {
  const id = createTrackId(filePath);
  const stat = await fs.promises.stat(filePath);
  let metadata;

  try {
    metadata = await parseFile(filePath, { duration: true });
  } catch {
    metadata = undefined;
  }

  const common = metadata?.common;
  const format = metadata?.format;
  const fallbackName = path.basename(filePath, path.extname(filePath));

  trackMap.set(id, filePath);

  return {
    id,
    name: common?.title || fallbackName,
    artist: common?.artist || "",
    album: common?.album || "",
    duration: Number.isFinite(format?.duration) ? format.duration : 0,
    path: path.relative(MUSIC_ROOT, filePath),
    size: stat.size,
    url: `http://${HOST}:${PORT}/media/${id}`,
  };
};

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    musicRoot: MUSIC_ROOT,
  });
});

app.get("/api/tracks", async (_req, res) => {
  try {
    const rootStat = await fs.promises.stat(MUSIC_ROOT);

    if (!rootStat.isDirectory()) {
      res.status(500).json({
        error: "Music root is not a directory",
        musicRoot: MUSIC_ROOT,
      });
      return;
    }

    trackMap.clear();

    const filePaths = await walkMusicRoot(MUSIC_ROOT);
    const tracks = await Promise.all(filePaths.sort().map(readTrackMetadata));

    res.json(tracks);
  } catch {
    res.status(500).json({
      error: "Failed to scan music folder",
      musicRoot: MUSIC_ROOT,
    });
  }
});

app.get("/media/:id", async (req, res) => {
  const filePath = trackMap.get(req.params.id);

  if (!filePath || !isInsideMusicRoot(filePath)) {
    res.sendStatus(404);
    return;
  }

  try {
    const stat = await fs.promises.stat(filePath);
    const range = req.headers.range;

    if (!range) {
      res.writeHead(200, {
        "Accept-Ranges": "bytes",
        "Content-Length": stat.size,
        "Content-Type": "audio/mpeg",
      });

      fs.createReadStream(filePath).pipe(res);
      return;
    }

    const [startRaw, endRaw] = range.replace("bytes=", "").split("-");
    const start = Number(startRaw);
    const end = endRaw ? Number(endRaw) : stat.size - 1;

    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      start > end ||
      end >= stat.size
    ) {
      res.status(416).set("Content-Range", `bytes */${stat.size}`).end();
      return;
    }

    res.writeHead(206, {
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Range": `bytes ${start}-${end}/${stat.size}`,
      "Content-Type": "audio/mpeg",
    });

    fs.createReadStream(filePath, { start, end }).pipe(res);
  } catch {
    res.sendStatus(404);
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Music server: http://${HOST}:${PORT}`);
  console.log(`Music root: ${MUSIC_ROOT}`);
});
