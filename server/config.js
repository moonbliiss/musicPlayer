import os from "node:os";
import path from "node:path";

export const PORT = Number(process.env.MUSIC_SERVER_PORT || 3123);
export const HOST = "127.0.0.1";

// Change this path to the only folder your Qt/WebEngine app is allowed to expose.
export const MUSIC_ROOT = "/home/adminuser/Музыка";

export const AUDIO_EXTENSIONS = new Set([
  ".mp3",
  ".opus",
  ".wav",
  ".ogg",
  ".flac",
  ".m4a",
]);

