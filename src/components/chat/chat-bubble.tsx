import { View, Text, Input } from '@tarojs/components';
import './chat-bubble.scss';

export interface ChatBubbleProps {
  role: 'user' | 'assistant';
  text: string;
  avatar?: string;
}

export function ChatBubble({ role, text, avatar }: ChatBubbleProps) {
  return (
    <View className={`gp-chat gp-chat--${role}`}>
      <View className="gp-chat__avatar">
        <Text>{role === 'assistant' ? '小礼' : (avatar ?? '你')}</Text>
      </View>
      <View className="gp-chat__bubble">
        <Text>{text}</Text>
      </View>
    </View>
  );
}

export interface ChatInputProps {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onVoice?: () => void;
}

export function ChatInput({ placeholder, value, onChange, onSend, onVoice }: ChatInputProps) {
  return (
    <View className="gp-chat-input">
      <View className="gp-chat-input__field">
        <Input
          className="gp-chat-input__input"
          placeholder={placeholder}
          value={value}
          onInput={(e) => onChange((e.detail as { value: string }).value)}
          onConfirm={onSend}
          confirmType="send"
        />
      </View>
      <View className="gp-chat-input__voice" onClick={onVoice}>
        <Text>🎙</Text>
      </View>
      <View className="gp-chat-input__send" onClick={onSend}>
        <Text>发送</Text>
      </View>
    </View>
  );
}
