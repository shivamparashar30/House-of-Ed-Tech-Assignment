import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  WebView,
  type WebViewMessageEvent,
  type WebViewProps,
} from 'react-native-webview';

import { vidkingEmbedUrl, vidkingTvEmbedUrl } from '@/api/client';
import { ErrorState } from '@/components/error-state';
import { Colors } from '@/constants/theme';
import { useMovieDetail } from '@/hooks/use-movies';
import { useTvDetail } from '@/hooks/use-tv';
import {
  type ContinueWatchingInput,
  getContinueItem,
  useContinueWatchingStore,
} from '@/stores/continue-watching-store';

const ALLOWED_HOSTS = ['vidking.net', 'www.vidking.net'];
const TIMEUPDATE_SAVE_INTERVAL = 5000;

function isAllowedNavigation(request: { url: string; isTopFrame?: boolean }): boolean {
  if (request.isTopFrame === false) return true;

  const { url } = request;
  if (url === 'about:blank' || url.startsWith('about:') || url.startsWith('data:')) return true;

  try {
    return ALLOWED_HOSTS.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

function buildPlayerHtml(embedUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>html,body{margin:0;padding:0;height:100%;background:#000;overflow:hidden}iframe{border:0;width:100%;height:100%}</style>
</head>
<body>
<iframe src="${embedUrl}" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>
<script>
  window.addEventListener('message', function (e) {
    try {
      var d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (d && d.type === 'PLAYER_EVENT' && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(d));
      }
    } catch (err) {}
  });
  true;
</script>
</body>
</html>`;
}

export default function PlayerScreen() {
  const { id, type, season, episode } = useLocalSearchParams<{
    id: string;
    type?: string;
    season?: string;
    episode?: string;
  }>();
  const mediaId = Number(id);
  const isTv = type === 'tv';
  const seasonNumber = Number(season) || 1;
  const episodeNumber = Number(episode) || 1;

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const { data: movie } = useMovieDetail(isTv ? 0 : mediaId);
  const { data: show } = useTvDetail(isTv ? mediaId : 0);
  const upsert = useContinueWatchingStore((state) => state.upsert);

  const media: ContinueWatchingInput | null = useMemo(() => {
    if (isTv && show) {
      return {
        id: show.id,
        media_type: 'tv',
        title: show.name,
        poster_path: show.poster_path,
        backdrop_path: show.backdrop_path,
        vote_average: show.vote_average,
        release_date: show.first_air_date,
        season: seasonNumber,
        episode: episodeNumber,
      };
    }
    if (!isTv && movie) {
      return {
        id: movie.id,
        media_type: 'movie',
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
      };
    }
    return null;
  }, [isTv, show, movie, seasonNumber, episodeNumber]);

  const mediaRef = useRef(media);
  mediaRef.current = media;
  const lastSavedAt = useRef(0);

  const [resumeSeconds] = useState(() => {
    const item = getContinueItem(mediaId);
    if (!item) return 0;
    if (isTv) {
      return item.season === seasonNumber && item.episode === episodeNumber ? item.currentTime : 0;
    }
    return item.currentTime;
  });

  const embedUrl = useMemo(
    () =>
      isTv
        ? vidkingTvEmbedUrl(mediaId, seasonNumber, episodeNumber, resumeSeconds)
        : vidkingEmbedUrl(mediaId, resumeSeconds),
    [isTv, mediaId, seasonNumber, episodeNumber, resumeSeconds],
  );
  const html = useMemo(() => buildPlayerHtml(embedUrl), [embedUrl]);

  const handleShouldStartLoad: WebViewProps['onShouldStartLoadWithRequest'] = (request) =>
    isAllowedNavigation(request);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 12000);
    return () => clearTimeout(timer);
  }, []);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data);
      if (payload?.type !== 'PLAYER_EVENT') return;

      const data = payload.data ?? {};
      const currentTime = Number(data.currentTime) || 0;
      const duration = Number(data.duration) || 0;
      const progress = duration > 0 ? currentTime / duration : (Number(data.progress) || 0) / 100;

      if (data.event === 'play' || (data.event === 'timeupdate' && currentTime > 0)) {
        setLoading(false);
      }

      if (!mediaRef.current) return;

      if (data.event === 'timeupdate') {
        const now = Date.now();
        if (now - lastSavedAt.current < TIMEUPDATE_SAVE_INTERVAL) return;
        lastSavedAt.current = now;
      }

      upsert(mediaRef.current, { currentTime, duration, progress });
    } catch {
      return;
    }
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" hidden />

      {failed ? (
        <ErrorState
          message="This title could not be played right now."
          onRetry={() => {
            setFailed(false);
            setLoading(true);
          }}
        />
      ) : (
        <WebView
          source={{ html, baseUrl: 'https://www.vidking.net' }}
          style={{ flex: 1, backgroundColor: '#000' }}
          allowsInlineMediaPlayback
          allowsFullscreenVideo
          mediaPlaybackRequiresUserAction={false}
          onMessage={handleMessage}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          setSupportMultipleWindows={false}
          javaScriptCanOpenWindowsAutomatically={false}
          onOpenWindow={() => undefined}
          onError={() => {
            setLoading(false);
            setFailed(true);
          }}
        />
      )}

      {loading && !failed && (
        <View className="absolute inset-0 items-center justify-center bg-black">
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      )}

      <Pressable
        onPress={() => router.back()}
        className="absolute right-4 h-10 w-10 items-center justify-center rounded-full bg-black/70 active:opacity-70"
        style={{ top: insets.top + 8 }}>
        <Ionicons name="close" size={22} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
