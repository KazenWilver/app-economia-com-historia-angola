import { Audio, ResizeMode, Video } from "expo-av";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ContentType } from "@shared/types";
import { useThemeColors } from "@/contexts/ThemeContext";
import {
  formatMediaTime,
  isAudioType,
  isImageUrl,
  isVideoType,
  resolveMediaUrl,
} from "@/lib/media";

interface ContentMediaPlayerProps {
  mediaUrl: string;
  contentType: ContentType;
}

export function ContentMediaPlayer({
  mediaUrl,
  contentType,
}: ContentMediaPlayerProps) {
  const colors = useThemeColors();
  const uri = resolveMediaUrl(mediaUrl) ?? mediaUrl;
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [barWidth, setBarWidth] = useState(0);

  // Tipo manda (paridade web): áudio/podcast nunca caem no ramo vídeo.
  const showAudio = isAudioType(contentType, mediaUrl);
  const showVideo = !showAudio && isVideoType(contentType, mediaUrl);
  const showImage =
    !showAudio && !showVideo && isImageUrl(mediaUrl);

  useEffect(() => {
    return () => {
      void soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!showAudio) {
      return;
    }

    let cancelled = false;
    setIsReady(false);
    setIsLoading(true);
    setError(null);

    const prepare = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        await soundRef.current?.unloadAsync();
        soundRef.current = null;

        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false, progressUpdateIntervalMillis: 250 },
          (status) => {
            if (!status.isLoaded) {
              if (status.error) {
                setError("Não foi possível carregar o áudio.");
                setIsReady(false);
              }
              return;
            }
            setPositionMs(status.positionMillis);
            setDurationMs(status.durationMillis ?? 0);
            setIsPlaying(status.isPlaying);
            setIsReady(true);
          },
        );

        if (cancelled) {
          await sound.unloadAsync();
          return;
        }

        soundRef.current = sound;
        setIsReady(true);
      } catch {
        if (!cancelled) {
          setError("Não foi possível carregar o áudio.");
          setIsReady(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void prepare();

    return () => {
      cancelled = true;
    };
  }, [showAudio, uri]);

  const toggleAudio = async () => {
    const sound = soundRef.current;
    if (!sound) {
      setError("Áudio ainda a carregar. Tenta novamente.");
      return;
    }

    try {
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) {
        setError("Áudio ainda a carregar. Tenta novamente.");
        return;
      }

      if (status.isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch {
      setError("Não foi possível reproduzir o áudio.");
    }
  };

  const seekAudio = async (locationX: number) => {
    const sound = soundRef.current;
    if (!sound || durationMs <= 0 || barWidth <= 0) {
      return;
    }

    const ratio = Math.min(1, Math.max(0, locationX / barWidth));
    const nextPosition = Math.round(durationMs * ratio);

    try {
      await sound.setPositionAsync(nextPosition);
      setPositionMs(nextPosition);
    } catch {
      setError("Não foi possível avançar no áudio.");
    }
  };

  if (showAudio) {
    const progress = durationMs > 0 ? positionMs / durationMs : 0;

    return (
      <View style={styles.wrap}>
        <Text style={[styles.label, { color: colors.contentTertiary }]}>
          Áudio
        </Text>
        <Pressable
          onPress={() => void toggleAudio()}
          disabled={isLoading && !isReady}
          style={({ pressed }) => [
            styles.audioButton,
            { backgroundColor: colors.bordeaux },
            (isLoading && !isReady) && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          {isLoading && !isReady ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={[styles.audioButtonText, { color: colors.white }]}>
              {isPlaying ? "Pausar" : "Reproduzir"}
            </Text>
          )}
        </Pressable>

        <Pressable
          onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
          onPress={(event) => void seekAudio(event.nativeEvent.locationX)}
          style={[styles.seekTrack, { backgroundColor: colors.border }]}
        >
          <View
            style={[
              styles.seekFill,
              {
                width: `${progress * 100}%`,
                backgroundColor: colors.bordeaux,
              },
            ]}
          />
        </Pressable>

        <Text style={[styles.time, { color: colors.contentSecondary }]}>
          {formatMediaTime(positionMs / 1000)} /{" "}
          {formatMediaTime(durationMs / 1000)}
        </Text>
        {error ? (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        ) : null}
      </View>
    );
  }

  if (showVideo) {
    return (
      <View style={styles.wrap}>
        <Text style={[styles.label, { color: colors.contentTertiary }]}>
          Vídeo
        </Text>
        <Video
          style={[styles.video, { backgroundColor: colors.surfaceDark }]}
          source={{ uri }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          onError={() => setError("Não foi possível carregar o vídeo.")}
        />
        {error ? (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        ) : null}
      </View>
    );
  }

  if (showImage) {
    return (
      <View style={styles.wrap}>
        <Text style={[styles.label, { color: colors.contentTertiary }]}>
          Imagem
        </Text>
        <Image
          source={{ uri }}
          style={[styles.image, { backgroundColor: colors.bordeauxMuted }]}
          contentFit="cover"
        />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.contentTertiary }]}>
        Multimédia
      </Text>
      <Pressable
        onPress={() => void Linking.openURL(uri)}
        style={[styles.audioButton, { backgroundColor: colors.bordeaux }]}
      >
        <Text style={[styles.audioButtonText, { color: colors.white }]}>
          Abrir ficheiro
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  video: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  audioButton: {
    minHeight: 52,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  audioButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  disabled: { opacity: 0.7 },
  pressed: { opacity: 0.88 },
  seekTrack: {
    marginTop: 14,
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
  },
  seekFill: {
    height: "100%",
  },
  time: {
    marginTop: 10,
    fontSize: 13,
    fontVariant: ["tabular-nums"],
  },
  error: {
    marginTop: 8,
    fontSize: 13,
  },
});
