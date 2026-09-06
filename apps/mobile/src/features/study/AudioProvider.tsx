import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { Platform, View } from 'react-native';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { chapters } from '../../content/chapters';
import { Button, Notice } from '../../components/Controls';
import { Body, Card } from '../../components/Card';

const tracks: Record<string, number> = {
  convivencia: require('../../../assets/audio/convivencia.wav'), senales: require('../../../assets/audio/senales.wav'),
  velocidad: require('../../../assets/audio/velocidad.wav'), seguridad: require('../../../assets/audio/seguridad.wav'),
  conductor: require('../../../assets/audio/conductor.wav'), normas: require('../../../assets/audio/normas.wav'),
};
function usePlayback() {
  const player = useAudioPlayer(null, { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [rate, setRate] = useState(1);
  useEffect(() => () => { player.pause(); }, [player]);
  async function play(id: string) {
    try {
      setError('');
      await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'doNotMix' });
      if (chapterId !== id) { player.replace(tracks[id]); setChapterId(id); }
      else if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration - 0.2)) await player.seekTo(0);
      if (Platform.OS !== 'web') player.setActiveForLockScreen(true, { title: chapters.find((c) => c.id === id)?.title ?? 'Tu lección', artist: 'Proyecto 3X' });
      player.setPlaybackRate(rate); player.play();
    } catch { setError('No pudimos reproducir el audio. Intenta de nuevo.'); }
  }
  return { player, status, chapterId, error, rate, play,
    changeRate: () => { const next = rate === 1 ? 1.25 : rate === 1.25 ? 1.5 : 1; player.setPlaybackRate(next); setRate(next); },
    seek: (delta: number) => void player.seekTo(Math.max(0, Math.min(status.duration, status.currentTime + delta))).catch(() => setError('No pudimos avanzar el audio.')) };
}
const AudioContext = createContext<ReturnType<typeof usePlayback> | null>(null);
export function AudioProvider({ children }: PropsWithChildren) { const playback = usePlayback(); return <AudioContext.Provider value={playback}>{children}</AudioContext.Provider>; }
export function AudioControls({ id }: { id?: string }) {
  const audio = useContext(AudioContext);
  if (!audio) return null;
  const target = id ?? audio.chapterId;
  if (!target) return null;
  const active = audio.chapterId === target;
  const time = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  return <Card title="Escucha y aprende" description={chapters.find((c) => c.id === target)?.title}>
    <Body>Narración sintetizada en español · Lección de Proyecto 3X</Body>
    <Button label={active && audio.status.playing ? 'Pausar audio' : 'Reproducir audio'} onPress={() => active && audio.status.playing ? audio.player.pause() : void audio.play(target)} />
    {active && <><Body>{time(audio.status.currentTime)} / {time(audio.status.duration)}</Body><View style={{ flexDirection: 'row', gap: 8 }}><View style={{ flex: 1 }}><Button secondary label="−15 s" onPress={() => audio.seek(-15)} /></View><View style={{ flex: 1 }}><Button secondary label="+15 s" onPress={() => audio.seek(15)} /></View></View><Button secondary label={`Velocidad ${audio.rate}×`} onPress={audio.changeRate} /></>}
    <Notice text={audio.error} error />
  </Card>;
}
