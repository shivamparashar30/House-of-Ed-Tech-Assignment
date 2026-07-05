import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  WebView,
  type WebViewMessageEvent,
  type WebViewProps,
} from 'react-native-webview';

import { vidkingEmbedUrl, vidkingTvEmbedUrl } from '@/api/client';
import { ErrorState } from '@/components/error-state';
import { ERROR } from '@/constants/strings';
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

function PlayerLoadingOverlay() {
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);
  const ringScale = useSharedValue(0.8);
  const ringOpacity = useSharedValue(0.5);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(withTiming(1.15, { duration: 800 }), withTiming(1, { duration: 800 })),
      -1,
    );
    pulseOpacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 800 }), withTiming(0.6, { duration: 800 })),
      -1,
    );
    ringScale.value = withRepeat(
      withSequence(withTiming(1.6, { duration: 1200 }), withTiming(0.8, { duration: 0 })),
      -1,
    );
    ringOpacity.value = withRepeat(
      withSequence(withTiming(0, { duration: 1200 }), withTiming(0.5, { duration: 0 })),
      -1,
    );
  }, [pulseScale, pulseOpacity, ringScale, ringOpacity]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <View className="absolute inset-0 items-center justify-center bg-black">
      <View className="items-center justify-center">
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: 80,
              height: 80,
              borderRadius: 40,
              borderWidth: 2,
              borderColor: Colors.primary,
            },
            ringStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: `${Colors.primary}33`,
              alignItems: 'center',
              justifyContent: 'center',
            },
            iconStyle,
          ]}>
          <Ionicons name="play" size={28} color={Colors.primary} />
        </Animated.View>
      </View>
      <Text className="mt-6 text-sm font-semibold text-[#9CA3AF]">Loading player…</Text>
      <ActivityIndicator color={Colors.primary} style={{ marginTop: 12 }} />
    </View>
  );
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
  useEffect(() => {
    mediaRef.current = media;
  }, [media]);
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
          message={ERROR.playerFailed}
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

      {loading && !failed && <PlayerLoadingOverlay />}

      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        accessibilityLabel="Close player"
        accessibilityRole="button"
        className="absolute right-4 h-10 w-10 items-center justify-center rounded-full bg-black/70 active:opacity-70"
        style={{ top: insets.top + 8 }}>
        <Ionicons name="close" size={22} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
