import { Audio, ResizeMode, Video } from "expo-av";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ContentType } from "@shared/types";
import {
  formatMediaTime,
  isAudioType,
  isImageUrl,
  isVideoType,
  resolveMediaUrl,
} from "@/lib/media";
import { colors } from "@/lib/theme";

interface ContentMediaPlayerProps {
  mediaUrl: string;
  contentType: ContentType;
}

export function ContentMediaPlayer({
  mediaUrl,
  contentType,
}: ContentMediaPlayerProps) {
  const uri = resolveMediaUrl(mediaUrl) ?? mediaUrl;
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [barWidth, setBarWidth] = useState(0);

  const showAudio = isAudioType(contentType, mediaUrl);
  const showVideo = isVideoType(contentType, mediaUrl);
  const showImage = !showAudio && !showVideo && isImageUrl(mediaUrl);

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

    const prepare = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        await soundRef.current?.unloadAsync();
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false },
          (status) => {
            if (!status.isLoaded) {
              return;
            }
            setPositionMs(status.positionMillis);
            setDurationMs(status.durationMillis ?? 0);
            setIsPlaying(status.isPlaying);
          },
        );

        if (cancelled) {
          await sound.unloadAsync();
          return;
        }

        soundRef.current = sound;
      } catch {
        if (!cancelled) {
          setError("Não foi possível carregar o áudio.");
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
      return;
    }

    try {
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) {
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

  if (showImage) {
    return (
      <View>
        <Text style={styles.label}>Imagem</Text>
        <Image source={{ uri }} style={styles.image} contentFit="cover" />
      </View>
    );
  }

  if (showVideo) {
    return (
      <View>
        <Text style={styles.label}>Vídeo</Text>
        <Video
          style={styles.video}
          source={{ uri }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          onError={() => setError("Não foi possível carregar o vídeo.")}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  }

  if (showAudio) {
    const progress = durationMs > 0 ? positionMs / durationMs : 0;

    return (
      <View>
        <Text style={styles.label}>Áudio</Text>
        <Pressable
          onPress={() => void toggleAudio()}
          style={({ pressed }) => [
            styles.audioButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.audioButtonText}>
            {isPlaying ? "Pausar" : "Reproduzir"}
          </Text>
        </Pressable>

        <Pressable
          onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
          onPress={(event) => void seekAudio(event.nativeEvent.locationX)}
          style={styles.seekTrack}
        >
          <View style={[styles.seekFill, { width: `${progress * 100}%` }]} />
        </Pressable>

        <Text style={styles.time}>
          {formatMediaTime(positionMs / 1000)} /{" "}
          {formatMediaTime(durationMs / 1000)}
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.label}>Multimédia</Text>
      <Text style={styles.link} onPress={() => void Linking.openURL(uri)}>
        Abrir ficheiro externo
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.contentTertiary,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: colors.bordeauxMuted,
  },
  video: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: colors.surfaceDark,
  },
  audioButton: {
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: colors.bordeaux,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  audioButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  pressed: { opacity: 0.88 },
  seekTrack: {
    marginTop: 12,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: "hidden",
  },
  seekFill: {
    height: "100%",
    backgroundColor: colors.bordeaux,
  },
  time: {
    marginTop: 10,
    fontSize: 13,
    color: colors.contentSecondary,
    fontVariant: ["tabular-nums"],
  },
  link: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.bordeaux,
  },
  error: {
    marginTop: 8,
    color: colors.error,
    fontSize: 13,
  },
});
