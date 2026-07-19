import { useCallback, useEffect, useRef, useState } from "react";
import { loadTracksFromServer, revokeTrackUrls } from "./utils/audioFiles";
import type { RepeatMode, Track, Playlist } from "./models/types";
import "./index.css";

import FavoriteMusicPage from "./components/FavoriteMusicPage";
import Sidebar from "./components/Sidebar";
import PlayerControl from "./components/PlayerControl";
import AddPlaylists from "./components/AddPlaylists";

import AllMusicPage from "./components/AllMusicPage";

type Page = "allMusic" | "favoriteMusic" | `playlist:${string}`;

export type View =
  | { type: "allMusic" }
  | { type: "favoriteMusic" }
  | { type: "playlist"; playlistId: string };

export default function App() {
  //const [currentView, setCurrentView] = useState<View>({ type: 'allMusic' });

  const [page, setPage] = useState<Page>("allMusic");

  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const tracksRef = useRef<Track[]>([]);
  const playbackTracksRef = useRef<Track[]>([]);
  const activeIndexRef = useRef<number | null>(null);
  const errorTimeoutRef = useRef<number | undefined>(undefined);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [playbackTracks, setPlaybackTracks] = useState<Track[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [shuffle, setShuffle] = useState(false);
  const [error, setError] = useState("");
  const [isPlaylistFormOpen, setIsPlaylistFormOpen] = useState(false);

  

  const [favoriteTrackIds, setFavoriteTrackIds] = useState<string[]>(() => {
    const savedValue = localStorage.getItem("favoriteTrackIds");
    return savedValue ? JSON.parse(savedValue) : [];
  });

  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const savedValue = localStorage.getItem("playlists");
    return savedValue ? JSON.parse(savedValue) : [];
  });

  const activeTrack =
    activeIndex === null ? undefined : playbackTracks[activeIndex];

  /* плелисты -------------------------------------------------------------------- */

  useEffect(() => {
    localStorage.setItem("favoriteTrackIds", JSON.stringify(favoriteTrackIds));
  }, [favoriteTrackIds]);

  useEffect(() => {
    localStorage.setItem("playlists", JSON.stringify(playlists));
  }, [playlists]);

  const selectedPlaylistId = page.startsWith("playlist:")
    ? page.replace("playlist:", "")
    : null;
  const selectedPlaylist = playlists.find(
    (playlist) => playlist.id === selectedPlaylistId,
  );
  const selectedPlaylistTracks = selectedPlaylist
    ? tracks.filter((track) => selectedPlaylist.trackIds.includes(track.id))
    : [];
  const favoriteTracks = tracks.filter((track) =>
    favoriteTrackIds.includes(track.id),
  );
  const currentPageTracks =
    page === "favoriteMusic"
      ? favoriteTracks
      : selectedPlaylist
        ? selectedPlaylistTracks
        : tracks;

  /* функция избранного */

  const toggleFavorite = (trackId: string): void => {
    setFavoriteTrackIds((currentIds) =>
      currentIds.includes(trackId)
        ? currentIds.filter((id) => id !== trackId)
        : [...currentIds, trackId],
    );
  };

  /* функция создания плейлиста */

  const createPlaylist = (name: string, trackIds: string[]): void => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    setPlaylists((currentPlaylists) => [
      ...currentPlaylists,
      {
        id: crypto.randomUUID(),
        name: trimmedName,
        trackIds,
      },
    ]);
  };

  const deletePlaylist = (playlistId: string): void => {
    setPlaylists((currentPlaylists) =>
      currentPlaylists.filter((playlist) => playlist.id !== playlistId),
    );

    if (page === `playlist:${playlistId}`) {
      setPage("allMusic");
    }
  };

  /* функциюядобавления одного трека в плейлист */

  const addTrackToPlaylist = (playlistId: string, trackId: string): void => {
    setPlaylists((currentPlaylists) =>
      currentPlaylists.map((playlist) => {
        if (playlist.id !== playlistId || playlist.trackIds.includes(trackId)) {
          return playlist;
        }

        return {
          ...playlist,
          trackIds: [...playlist.trackIds, trackId],
        };
      }),
    );
  };

  /* конец плелистов --------------------------------------------------------------- */

  const clearError = useCallback((): void => {
    if (errorTimeoutRef.current) {
      window.clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = undefined;
    }

    setError("");
  }, []);

  const showError = useCallback((message: string): void => {
    if (errorTimeoutRef.current) {
      window.clearTimeout(errorTimeoutRef.current);
    }

    setError(message);
    errorTimeoutRef.current = window.setTimeout(() => {
      setError("");
      errorTimeoutRef.current = undefined;
    }, 3000);
  }, []);

  useEffect(() => {
    tracksRef.current = tracks;
  }, [tracks]);

  useEffect(() => {
    playbackTracksRef.current = playbackTracks;
  }, [playbackTracks]);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);

  useEffect(() => {
    audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  const playAudio = useCallback(async (): Promise<void> => {
    try {
      await audioRef.current.play();
      setIsPlaying(true);
      clearError();
    } catch {
      setIsPlaying(false);
      showError(
        "Не удалось запустить аудио. Проверьте файл или попробуйте другой трек.",
      );
    }
  }, [clearError, showError]);

  const loadTrack = useCallback(
    (index: number, shouldPlay: boolean): void => {
      const track = playbackTracksRef.current[index];

      if (!track) {
        return;
      }

      const audio = audioRef.current;
      audio.pause();
      audio.src = track.url;
      audio.currentTime = 0;
      audio.playbackRate = playbackRate;
      audio.load();

      setActiveIndex(index);
      setCurrentTime(0);
      setDuration(track.duration);
      setIsPlaying(false);
      clearError();

      if (shouldPlay) {
        void playAudio();
      }
    },
    [clearError, playAudio, playbackRate],
  );

  const getRandomNextIndex = useCallback(
    (currentIndex: number, length: number): number => {
      if (length <= 1) {
        return currentIndex;
      }

      let nextIndex = currentIndex;

      while (nextIndex === currentIndex) {
        nextIndex = Math.floor(Math.random() * length);
      }

      return nextIndex;
    },
    [],
  );

  const goToNext = useCallback(
    (shouldPlay = isPlaying): void => {
      const library = playbackTracksRef.current;
      const currentIndex = activeIndexRef.current;

      if (library.length === 0) {
        return;
      }

      if (currentIndex === null) {
        loadTrack(0, shouldPlay);
        return;
      }

      if (repeatMode === "one") {
        loadTrack(currentIndex, shouldPlay);
        return;
      }

      const nextIndex = shuffle
        ? getRandomNextIndex(currentIndex, library.length)
        : (currentIndex + 1) % library.length;

      if (
        repeatMode === "off" &&
        currentIndex === library.length - 1 &&
        !shuffle
      ) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
        setIsPlaying(false);
        return;
      }

      loadTrack(nextIndex, shouldPlay);
    },
    [getRandomNextIndex, isPlaying, loadTrack, repeatMode, shuffle],
  );

  const goToPrevious = useCallback((): void => {
    const library = playbackTracksRef.current;
    const currentIndex = activeIndexRef.current;

    if (library.length === 0) {
      return;
    }

    if (currentIndex === null) {
      loadTrack(0, isPlaying);
      return;
    }

    const previousIndex =
      currentIndex === 0 ? library.length - 1 : currentIndex - 1;
    loadTrack(previousIndex, isPlaying);
  }, [isPlaying, loadTrack]);

  const handleTracksLoaded = useCallback(
    (nextTracks: Track[]): void => {
      const audio = audioRef.current;
      activeIndexRef.current = null;
      audio.pause();
      audio.src = "";

      revokeTrackUrls(tracksRef.current);
      setTracks(nextTracks);
      playbackTracksRef.current = nextTracks;
      setPlaybackTracks(nextTracks);
      setActiveIndex(null);
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);

      if (nextTracks.length > 0) {
        clearError();
      }
    },
    [clearError],
  );

  useEffect(() => {
    let ignore = false;

    const loadLibrary = async (): Promise<void> => {
      try {
        const serverTracks = await loadTracksFromServer();

        if (!ignore) {
          handleTracksLoaded(serverTracks);
        }
      } catch {
        if (!ignore) {
          showError("Не удалось загрузить музыку с локального сервера.");
        }
      }
    };

    void loadLibrary();

    return () => {
      ignore = true;
    };
  }, [handleTracksLoaded, showError]);

  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = (): void => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = (): void => {
      const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      setDuration(nextDuration);

      const index = activeIndexRef.current;
      if (index !== null) {
        const activeTrackId = playbackTracksRef.current[index]?.id;

        if (!activeTrackId) {
          return;
        }

        setTracks((currentTracks) =>
          currentTracks.map((track) =>
            track.id === activeTrackId
              ? { ...track, duration: nextDuration }
              : track,
          ),
        );
      }
    };

    const handleEnded = (): void => {
      goToNext(true);
    };

    const handleError = (): void => {
      if (!audio.currentSrc || activeIndexRef.current === null) {
        return;
      }

      setIsPlaying(false);
      showError(
        "Не удалось загрузить трек. Возможно, файл поврежден или формат не поддерживается.",
      );
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [goToNext, showError]);

  useEffect(() => {
    const audio = audioRef.current;

    return () => {
      if (errorTimeoutRef.current) {
        window.clearTimeout(errorTimeoutRef.current);
      }

      audio.pause();
      audio.src = "";
      revokeTrackUrls(tracksRef.current);
    };
  }, []);

  const handlePlayPause = (): void => {
    if (currentPageTracks.length === 0) {
      return;
    }

    if (activeIndex === null) {
      playbackTracksRef.current = currentPageTracks;
      setPlaybackTracks(currentPageTracks);
      loadTrack(0, true);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    void playAudio();
  };

  const handleSeek = (time: number): void => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleSelectTrack = (trackId: string): void => {
    const nextPlaybackTracks = currentPageTracks;
    const index = nextPlaybackTracks.findIndex((track) => track.id === trackId);

    if (index === -1) {
      return;
    }

    playbackTracksRef.current = nextPlaybackTracks;
    setPlaybackTracks(nextPlaybackTracks);
    loadTrack(index, true);
  };

  const handleRepeatChange = (): void => {
    setRepeatMode((mode) => {
      if (mode === "off") {
        return "one";
      }

      if (mode === "one") {
        return "all";
      }

      return "off";
    });
  };

  const handleVolumeChange = (nextVolume: number): void => {
    setVolume(nextVolume);
    if (nextVolume > 0 && muted) {
      setMuted(false);
    }
  };





  

  return (
    <div className="app">
      <Sidebar
        page={page}
        onNavigate={setPage}
        playlists={playlists}
        onDeletePlaylist={deletePlaylist}
        onCreatePlaylistClick={() => setIsPlaylistFormOpen(true)}

        onTracksLoaded={handleTracksLoaded}
        onError={showError}
      />

      <main className="main-content">
        {error ? <div className="error-banner">{error}</div> : null}

        {page === "allMusic" ? (
          <AllMusicPage
            tracks={tracks}
            activeTrackId={activeTrack?.id}
            favoriteTrackIds={favoriteTrackIds}
            playlists={playlists}
            onSelectTrack={handleSelectTrack}
            onToggleFavorite={toggleFavorite}
            onAddTrackToPlaylist={addTrackToPlaylist}
          />
        ) : page === "favoriteMusic" ? (
          <FavoriteMusicPage
            tracks={tracks}
            activeTrackId={activeTrack?.id}
            favoriteTrackIds={favoriteTrackIds}
            playlists={playlists}
            onSelectTrack={handleSelectTrack}
            onToggleFavorite={toggleFavorite}
            onAddTrackToPlaylist={addTrackToPlaylist}
          />
        ) : selectedPlaylist ? (
          <AllMusicPage
            tracks={selectedPlaylistTracks}
            activeTrackId={activeTrack?.id}
            favoriteTrackIds={favoriteTrackIds}
            playlists={playlists}
            onSelectTrack={handleSelectTrack}
            onToggleFavorite={toggleFavorite}
            onAddTrackToPlaylist={addTrackToPlaylist}
          />
        ) : (
          <section className="empty-state">
            <h2>РџР»РµР№Р»РёСЃС‚ РЅРµ РЅР°Р№РґРµРЅ</h2>
            <p>РћРЅ Р±С‹Р» СѓРґР°Р»РµРЅ РёР»Рё РµС‰Рµ РЅРµ Р·Р°РіСЂСѓР·РёР»СЃСЏ.</p>
          </section>
        )}
      </main>

      <footer className="player">
        <PlayerControl
          tracks={tracks}
          activeTrackId={activeTrack?.id}
          isPlaying={isPlaying}
          hasTracks={playbackTracks.length > 0 || currentPageTracks.length > 0}
          repeatMode={repeatMode}
          shuffle={shuffle}
          onPlayPause={handlePlayPause}
          onPrevious={goToPrevious}
          onNext={() => goToNext(isPlaying)}
          onRepeatChange={handleRepeatChange}
          onShuffleToggle={() => setShuffle((value) => !value)}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          volume={volume}
          muted={muted}
          onVolumeChange={handleVolumeChange}
          onMuteToggle={() => setMuted((value) => !value)}
          playbackRate={playbackRate}
          onPlaybackRateChange={setPlaybackRate}
        />
      </footer>

      {isPlaylistFormOpen ? (
        <AddPlaylists
          tracks={tracks}
          onCreatePlaylist={createPlaylist}
          onClose={() => setIsPlaylistFormOpen(false)}
        />
      ) : null}
    </div>
  );
}
