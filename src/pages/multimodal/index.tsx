/* V1.0 PR-16 · 多模态输入页（PRD §6.1）
 * 支持文字 / 语音 / 商品截图 / 聊天截图 / 商品链接 / 商品图片 6 种输入
 */
import { View, Text, ScrollView } from '@tarojs/components';
import { useState } from 'react';
import Taro from '@tarojs/taro';
import { multimodalMock } from '../../services/ai/multimodal';
import { recordUsageEvent, tokensFor } from '../../platform/adapter';
import type { InputMode } from '../../services/ai/multimodal';
import './index.scss';

const MODES: Array<{ mode: InputMode; label: string; emoji: string }> = [
  { mode: 'text',       label: '文字',     emoji: '✍️' },
  { mode: 'voice',      label: '语音',     emoji: '🎤' },
  { mode: 'screenshot', label: '商品截图', emoji: '📸' },
  { mode: 'chat',       label: '聊天截图', emoji: '💬' },
  { mode: 'link',       label: '商品链接', emoji: '🔗' },
  { mode: 'image',      label: '商品图片', emoji: '🖼️' }
];

export default function MultimodalPage() {
  const [mode, setMode] = useState<InputMode>('text');
  const [text, setText] = useState('送给妈妈的生日礼物，预算 300 左右，温暖一点');
  const [result, setResult] = useState<{ relation: string; scene: string; tone: string; budget_fen: number; tokens: number } | null>(null);

  const onPickMode = (m: InputMode) => {
    setMode(m);
    Taro.showToast({ title: `切换到${MODES.find((x) => x.mode === m)?.label}输入`, icon: 'none', duration: 800 });
  };

  const onRun = async () => {
    recordUsageEvent({ metric: 'AI_REQUEST_COUNT', quantity: 1, metadata: { feature: 'multimodal.run' } });
    const payload = mode === 'link'
      ? 'https://item.jd.com/7654321.html'
      : mode === 'voice'
        ? 'mock://audio.m4a'
        : mode === 'screenshot' || mode === 'image'
          ? 'mock://screenshot.jpg'
          : text;
    let res = await multimodalMock.parse({ mode, payload });
    if (mode === 'voice') {
      const tr = await multimodalMock.transcribe(payload);
      if (tr.ok && tr.data) res = await multimodalMock.parse({ mode, payload: tr.data as string });
    }
    if (mode === 'screenshot' || mode === 'image') {
      const ocr = await multimodalMock.ocrScreenshot(payload);
      if (ocr.ok && ocr.data) res = await multimodalMock.parse({ mode, payload: ocr.data as string });
    }
    if (mode === 'link') {
      const link = await multimodalMock.resolveLink(payload);
      setResult({
        relation: res.data?.relation ?? 'friend',
        scene: res.data?.scene ?? 'routine',
        tone: res.data?.tone ?? 'warm',
        budget_fen: res.data?.budget_fen ?? 20000,
        tokens: tokensFor(payload)
      });
      Taro.showToast({ title: `✅ 链接解析: ${link.data?.title ?? ''}`, icon: 'none', duration: 1200 });
      return;
    }
    setResult({
      relation: res.data?.relation ?? 'friend',
      scene: res.data?.scene ?? 'routine',
      tone: res.data?.tone ?? 'warm',
      budget_fen: res.data?.budget_fen ?? 20000,
      tokens: tokensFor(payload)
    });
    Taro.showToast({ title: '✅ 已识别', icon: 'success', duration: 1200 });
  };

  return (
    <View className="gp-page">
      <ScrollView scrollY className="gp-page__scroll">
        <View className="gp-page__header">
          <Text className="gp-h1">🎤 多模态输入</Text>
          <Text className="gp-caption">PRD §6.1 · 6 模态识别 → 结构化 GiftQuery</Text>
        </View>

        <View className="gp-page__section">
          <Text className="gp-h2">输入模式</Text>
          <View className="gp-multimodal__grid">
            {MODES.map((m) => (
              <View
                key={m.mode}
                className={`gp-multimodal__chip ${mode === m.mode ? 'gp-multimodal__chip--active' : ''}`}
                onClick={() => onPickMode(m.mode)}
              >
                <Text className="gp-multimodal__emoji">{m.emoji}</Text>
                <Text className="gp-multimodal__label">{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="gp-page__section">
          <Text className="gp-h2">{MODES.find((m) => m.mode === mode)?.label}内容</Text>
          {(mode === 'text') && (
            <View className="gp-multimodal__input-box">
              <textarea
                className="gp-multimodal__textarea"
                value={text}
                onInput={(e) => setText((e.target as HTMLTextAreaElement).value)}
                placeholder="描述你要送谁、什么场景、什么预算"
              />
            </View>
          )}
          {mode !== 'text' && (
            <View className="gp-multimodal__upload">
              <Text className="gp-multimodal__upload-emoji">{MODES.find((m) => m.mode === mode)?.emoji}</Text>
              <Text className="gp-multimodal__upload-hint">点击上传或长按录音（mock 模式）</Text>
            </View>
          )}
        </View>

        <View className="gp-page__cta-row">
          <View className="gp-btn gp-btn--primary gp-btn--block" onClick={onRun}>
            <Text>🔍 AI 识别</Text>
          </View>
        </View>

        {result && (
          <View className="gp-page__section gp-multimodal__result">
            <Text className="gp-h2">✅ 识别结果</Text>
            <View className="gp-multimodal__result-row"><Text className="gp-caption">关系</Text><Text>{result.relation}</Text></View>
            <View className="gp-multimodal__result-row"><Text className="gp-caption">场景</Text><Text>{result.scene}</Text></View>
            <View className="gp-multimodal__result-row"><Text className="gp-caption">语气</Text><Text>{result.tone}</Text></View>
            <View className="gp-multimodal__result-row"><Text className="gp-caption">预算</Text><Text>¥{(result.budget_fen / 100).toFixed(0)}</Text></View>
            <View className="gp-multimodal__result-row"><Text className="gp-caption">token 数</Text><Text>{result.tokens}</Text></View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
