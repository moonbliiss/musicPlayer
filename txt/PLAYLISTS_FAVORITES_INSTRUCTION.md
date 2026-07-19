# Инструкция: плейлисты, избранное и меню по ПКМ

Эта инструкция не меняет текущий проект автоматически. Она описывает, как добавить:

- создание плейлистов;
- выбор песен при создании плейлиста;
- добавление трека в избранное;
- контекстное меню по правой кнопке мыши на странице "Все песни";
- подменю "Добавить в плейлист" со списком созданных плейлистов.

Проект сейчас выглядит так: основное состояние треков находится в `src/App.tsx`, список песен рисуется через `src/components/AllMusicPage.tsx` и `src/components/TrackList.tsx`, а страницы `LikeMusicPage`, `AddPlaylists`, `MyPlaylist` пока почти пустые.

## 1. Добавить типы

Открой `src/models/types.ts` и добавь тип плейлиста:

```ts
export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
}
```

Лучше хранить в плейлисте не сами треки, а `trackIds`. Так один и тот же трек не дублируется в разных местах.

## 2. Хранить избранное и плейлисты в App

В `src/App.tsx` добавь импорт типа:

```ts
import type { Playlist, RepeatMode, Track } from "./models/types";
```

Потом рядом с остальными `useState` добавь:

```ts
const [favoriteTrackIds, setFavoriteTrackIds] = useState<string[]>([]);
const [playlists, setPlaylists] = useState<Playlist[]>([]);
```

Добавь функции для избранного:

```ts
const toggleFavorite = (trackId: string): void => {
  setFavoriteTrackIds((currentIds) =>
    currentIds.includes(trackId)
      ? currentIds.filter((id) => id !== trackId)
      : [...currentIds, trackId],
  );
};
```

Добавь функцию создания плейлиста:

```ts
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
```

Добавь функцию добавления одного трека в плейлист:

```ts
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
```

## 3. Передать действия в AllMusicPage

В `App.tsx` место с `AllMusicPage` сделай таким:

```tsx
<AllMusicPage
  tracks={tracks}
  activeTrackId={activeTrack?.id}
  favoriteTrackIds={favoriteTrackIds}
  playlists={playlists}
  onSelectTrack={handleSelectTrack}
  onToggleFavorite={toggleFavorite}
  onAddTrackToPlaylist={addTrackToPlaylist}
/>
```

В `src/components/AllMusicPage.tsx` обнови props:

```ts
import type { Playlist, Track } from "../models/types";
import TrackList from "./TrackList";

interface Props {
  tracks: Track[];
  activeTrackId?: string;
  favoriteTrackIds: string[];
  playlists: Playlist[];
  onSelectTrack: (index: number) => void;
  onToggleFavorite: (trackId: string) => void;
  onAddTrackToPlaylist: (playlistId: string, trackId: string) => void;
}
```

И передай их в `TrackList`:

```tsx
export default function AllMusicPage({
  tracks,
  activeTrackId,
  favoriteTrackIds,
  playlists,
  onSelectTrack,
  onToggleFavorite,
  onAddTrackToPlaylist,
}: Props) {
  return (
    <div>
      <TrackList
        tracks={tracks}
        activeTrackId={activeTrackId}
        favoriteTrackIds={favoriteTrackIds}
        playlists={playlists}
        onSelectTrack={onSelectTrack}
        onToggleFavorite={onToggleFavorite}
        onAddTrackToPlaylist={onAddTrackToPlaylist}
      />
    </div>
  );
}
```

## 4. Сделать меню по ПКМ в TrackList

В `src/components/TrackList.tsx` добавь `useEffect` и `useState`:

```ts
import { useEffect, useState } from "react";
import type { Playlist, Track } from "../models/types";
import { formatTime } from "./ProgressBar";
```

Обнови props:

```ts
interface TrackListProps {
  tracks: Track[];
  activeTrackId?: string;
  favoriteTrackIds: string[];
  playlists: Playlist[];
  onSelectTrack: (index: number) => void;
  onToggleFavorite: (trackId: string) => void;
  onAddTrackToPlaylist: (playlistId: string, trackId: string) => void;
}
```

Добавь тип состояния меню:

```ts
interface ContextMenuState {
  x: number;
  y: number;
  track: Track;
}
```

Внутри `TrackList` добавь состояние:

```ts
const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
```

Добавь закрытие меню по клику вне его и по Escape:

```ts
useEffect(() => {
  if (!contextMenu) {
    return;
  }

  const closeMenu = (): void => setContextMenu(null);
  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      closeMenu();
    }
  };

  window.addEventListener("click", closeMenu);
  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("click", closeMenu);
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [contextMenu]);
```

На кнопку трека добавь `onContextMenu`:

```tsx
onContextMenu={(event) => {
  event.preventDefault();
  setContextMenu({
    x: event.clientX,
    y: event.clientY,
    track,
  });
}}
```

После блока `{tracks.map(...)}` отрисуй само меню:

```tsx
{
  contextMenu ? (
    <div
      className="track-context-menu"
      style={{ left: contextMenu.x, top: contextMenu.y }}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="track-context-menu-item"
        onClick={() => {
          onToggleFavorite(contextMenu.track.id);
          setContextMenu(null);
        }}
      >
        {favoriteTrackIds.includes(contextMenu.track.id)
          ? "Убрать из избранного"
          : "Добавить в избранное"}
      </button>

      <div className="track-context-menu-group">
        <button type="button" className="track-context-menu-item">
          Добавить в плейлист
        </button>

        <div className="track-context-submenu">
          {playlists.length === 0 ? (
            <div className="track-context-empty">Нет плейлистов</div>
          ) : (
            playlists.map((playlist) => (
              <button
                key={playlist.id}
                type="button"
                className="track-context-menu-item"
                disabled={playlist.trackIds.includes(contextMenu.track.id)}
                onClick={() => {
                  onAddTrackToPlaylist(playlist.id, contextMenu.track.id);
                  setContextMenu(null);
                }}
              >
                {playlist.name}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  ) : null;
}
```

Важно: если `TrackList` возвращает только `<section>`, меню можно оставить внутри этой секции. Если появятся проблемы с обрезанием меню из-за `overflow: auto`, лучше обернуть `section` и меню во фрагмент:

```tsx
return (
  <>
    <section className="track-list" aria-label="Список треков">
      ...
    </section>
    {contextMenu ? ... : null}
  </>
);
```

## 5. Добавить стили для ПКМ-меню

В `src/index.css` добавь:

```css
.track-context-menu {
  position: fixed;
  z-index: 20;
  width: 220px;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  background: #181818;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45);
}

.track-context-menu-item {
  width: 100%;
  min-height: 36px;
  padding: 0 10px;
  border-radius: 6px;
  background: transparent;
  color: #f4f7fb;
  text-align: left;
  cursor: pointer;
}

.track-context-menu-item:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
}

.track-context-menu-item:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.track-context-menu-group {
  position: relative;
}

.track-context-submenu {
  display: none;
  position: absolute;
  top: 0;
  left: calc(100% + 6px);
  width: 220px;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  background: #181818;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45);
}

.track-context-menu-group:hover .track-context-submenu {
  display: block;
}

.track-context-empty {
  padding: 10px;
  color: #8c8c8c;
  font-size: 13px;
}
```

## 6. Сделать страницу избранного

Сейчас `LikeMusicPage.tsx` просто выводит текст. Лучше сделать ее похожей на `AllMusicPage`.

Props:

```ts
import type { Track } from "../models/types";
import TrackList from "./TrackList";

interface Props {
  tracks: Track[];
  activeTrackId?: string;
  favoriteTrackIds: string[];
  onSelectTrack: (index: number) => void;
}
```

Но есть нюанс: `TrackList` сейчас вызывает `onSelectTrack(index)`, где `index` берется из переданного массива. Если в избранном передать отфильтрованные треки, индекс уже не будет совпадать с индексом в основном массиве `tracks`.

Самый простой надежный вариант: изменить `TrackList`, чтобы он отдавал не индекс, а `track.id`:

```ts
onSelectTrack: (trackId: string) => void;
```

Тогда в `App.tsx`:

```ts
const handleSelectTrack = (trackId: string): void => {
  const index = tracksRef.current.findIndex((track) => track.id === trackId);

  if (index === -1) {
    return;
  }

  loadTrack(index, true);
};
```

И в `TrackList`:

```tsx
onClick={() => onSelectTrack(track.id)}
```

После этого избранное можно рисовать так:

```tsx
export default function LikeMusicPage({
  tracks,
  activeTrackId,
  favoriteTrackIds,
  onSelectTrack,
}: Props) {
  const favoriteTracks = tracks.filter((track) =>
    favoriteTrackIds.includes(track.id),
  );

  return (
    <TrackList
      tracks={favoriteTracks}
      activeTrackId={activeTrackId}
      favoriteTrackIds={favoriteTrackIds}
      playlists={[]}
      onSelectTrack={onSelectTrack}
      onToggleFavorite={() => {}}
      onAddTrackToPlaylist={() => {}}
    />
  );
}
```

Лучше не оставлять пустые функции надолго. Аккуратнее передать в `LikeMusicPage` настоящие `playlists`, `onToggleFavorite` и `onAddTrackToPlaylist`, чтобы ПКМ-меню работало и в избранном тоже.

## 7. Создание плейлиста с выбором песен

Файл `src/components/AddPlaylists.tsx` сейчас пустой. Его можно превратить в модальное окно или отдельный блок.

Минимальная логика:

```tsx
import { useState } from "react";
import type { Track } from "../models/types";

interface Props {
  tracks: Track[];
  onCreatePlaylist: (name: string, trackIds: string[]) => void;
  onClose: () => void;
}

export default function AddPlaylists({
  tracks,
  onCreatePlaylist,
  onClose,
}: Props) {
  const [name, setName] = useState("");
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);

  const toggleTrack = (trackId: string): void => {
    setSelectedTrackIds((currentIds) =>
      currentIds.includes(trackId)
        ? currentIds.filter((id) => id !== trackId)
        : [...currentIds, trackId],
    );
  };

  return (
    <div className="playlist-modal">
      <div className="playlist-modal-content">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Название плейлиста"
        />

        <div className="playlist-track-picker">
          {tracks.map((track) => (
            <label key={track.id} className="playlist-track-option">
              <input
                type="checkbox"
                checked={selectedTrackIds.includes(track.id)}
                onChange={() => toggleTrack(track.id)}
              />
              <span>{track.name}</span>
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            onCreatePlaylist(name, selectedTrackIds);
            onClose();
          }}
        >
          Создать
        </button>

        <button type="button" onClick={onClose}>
          Отмена
        </button>
      </div>
    </div>
  );
}
```

В `App.tsx` понадобится состояние открытия формы:

```ts
const [isPlaylistFormOpen, setIsPlaylistFormOpen] = useState(false);
```

И рендер:

```tsx
{
  isPlaylistFormOpen ? (
    <AddPlaylists
      tracks={tracks}
      onCreatePlaylist={createPlaylist}
      onClose={() => setIsPlaylistFormOpen(false)}
    />
  ) : null;
}
```

Кнопку "Новый плейлист" сейчас рисует `Sidebar`, значит в `Sidebar` надо добавить prop:

```ts
onCreatePlaylistClick: () => void;
```

И повесить его на кнопку:

```tsx
<button className="add-playlist-btn" onClick={onCreatePlaylistClick}>
  Новый плейлист
</button>
```

В `App.tsx`:

```tsx
<Sidebar
  page={page}
  onNavigate={setPage}
  playlists={playlists}
  onCreatePlaylistClick={() => setIsPlaylistFormOpen(true)}
/>
```

## 8. Показать плейлисты в сайдбаре

В `Sidebar.tsx` добавь `playlists` в props:

```ts
import type { Playlist } from "../models/types";

interface Props {
  page: "allMusic" | "likeMusic";
  playlists: Playlist[];
  onNavigate: (page: "allMusic" | "likeMusic") => void;
  onCreatePlaylistClick: () => void;
}
```

И вместо текста-заглушки:

```tsx
<div className="my-playlist-list">
  {playlists.length === 0 ? (
    <span className="playlist-empty">Плейлистов пока нет</span>
  ) : (
    playlists.map((playlist) => (
      <button key={playlist.id} type="button" className="playlist-item">
        {playlist.name}
      </button>
    ))
  )}
</div>
```

Для полноценной страницы плейлиста нужно расширить тип `Page`, например:

```ts
type Page = "allMusic" | "likeMusic" | `playlist:${string}`;
```

Тогда при клике по плейлисту:

```tsx
onNavigate(`playlist:${playlist.id}`);
```

А в `App.tsx` можно найти выбранный плейлист:

```ts
const selectedPlaylistId = page.startsWith("playlist:")
  ? page.replace("playlist:", "")
  : null;
const selectedPlaylist = playlists.find(
  (playlist) => playlist.id === selectedPlaylistId,
);
const selectedPlaylistTracks = selectedPlaylist
  ? tracks.filter((track) => selectedPlaylist.trackIds.includes(track.id))
  : [];
```

И отрисовать `TrackList` для `selectedPlaylistTracks`.

## 9. Сохранение после перезагрузки страницы

Если нужно, чтобы плейлисты и избранное не пропадали после обновления страницы, добавь `localStorage`.

Загрузка начального состояния:

```ts
const [favoriteTrackIds, setFavoriteTrackIds] = useState<string[]>(() => {
  const savedValue = localStorage.getItem("favoriteTrackIds");
  return savedValue ? JSON.parse(savedValue) : [];
});

const [playlists, setPlaylists] = useState<Playlist[]>(() => {
  const savedValue = localStorage.getItem("playlists");
  return savedValue ? JSON.parse(savedValue) : [];
});
```

Сохранение:

```ts
useEffect(() => {
  localStorage.setItem("favoriteTrackIds", JSON.stringify(favoriteTrackIds));
}, [favoriteTrackIds]);

useEffect(() => {
  localStorage.setItem("playlists", JSON.stringify(playlists));
}, [playlists]);
```

## 10. Рекомендуемый порядок внедрения

1. Добавить тип `Playlist`.
2. Добавить `favoriteTrackIds`, `playlists` и функции в `App.tsx`.
3. Изменить выбор трека с `index` на `trackId`, чтобы избранное и плейлисты играли правильные треки.
4. Прокинуть props в `AllMusicPage` и `TrackList`.
5. Добавить ПКМ-меню в `TrackList`.
6. Добавить стили меню в `index.css`.
7. Сделать `LikeMusicPage` на основе `TrackList`.
8. Сделать `AddPlaylists` для создания плейлиста с чекбоксами песен.
9. Передать список плейлистов в `Sidebar`.
10. Добавить `localStorage`, если нужно сохранение между перезапусками.

Главный момент: сначала лучше перевести `TrackList` с выбора по индексу на выбор по `track.id`. Это избавит от ошибки, когда в избранном или плейлисте отображается отфильтрованный список, а проигрыватель пытается включить трек по неправильному индексу из полного списка.
