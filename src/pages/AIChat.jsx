import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTradeStore } from '@/stores/useTradeStore';
import { useStrategyStore } from '@/stores/useStrategyStore';
import { useAccountStore } from '@/stores/useAccountStore';
import {
  Send, User, Settings2, Eye, EyeOff, Check, Loader2, AlertCircle, Trash2,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import JesseIcon from '@/components/JesseIcon';
import TradeFlowLogo from '@/components/TradeFlowLogo';
import {
  AVAILABLE_MODELS, DEFAULT_MODEL, SYSTEM_PROMPT,
  getApiKey, setApiKey, getModel, setModel, streamChat,
} from '@/lib/openai';
import { buildTradeContext } from '@/lib/trade-context';

const SUGGESTIONS = [
  "Review my recent trades and identify patterns",
  "What are my biggest weaknesses as a trader?",
  "Analyze my risk management across all trades",
  "Which setups should I trade more or less?",
  "Give me a detailed performance review",
  "What would you change about my trading plan?",
];

function SettingsBar({ onConfigured }) {
  const [key, setKey] = useState('');
  const [savedKey, setSavedKey] = useState(null);
  const [model, setModelState] = useState(DEFAULT_MODEL);
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    (async () => {
      const k = await getApiKey();
      const m = await getModel();
      setSavedKey(k);
      setModelState(m);
      if (k) onConfigured?.(true);
    })();
  }, []);

  const handleSave = async () => {
    if (!key.trim()) return;
    setSaving(true);
    await setApiKey(key.trim());
    setSavedKey(key.trim());
    setKey('');
    setSaving(false);
    setExpanded(false);
    onConfigured?.(true);
  };

  const handleModelChange = async (val) => {
    setModelState(val);
    await setModel(val);
  };

  const handleClearKey = async () => {
    await setApiKey('');
    setSavedKey(null);
    setExpanded(true);
    onConfigured?.(false);
  };

  const maskedKey = savedKey ? `sk-...${savedKey.slice(-4)}` : null;
  const currentModelLabel = AVAILABLE_MODELS.find(m => m.id === model)?.label || model;

  if (!expanded && savedKey) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30 text-xs">
        <Check className="h-3.5 w-3.5 text-emerald-400" />
        <span className="text-muted-foreground">
          Connected: <span className="font-mono text-foreground">{maskedKey}</span> | Model: <span className="font-semibold text-foreground">{currentModelLabel}</span>
        </span>
        <Button variant="ghost" size="sm" className="h-6 text-[10px] ml-auto" onClick={() => setExpanded(true)}>
          <Settings2 className="h-3 w-3 mr-1" /> Settings
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-b bg-muted/30 space-y-2">
      <div className="flex items-center gap-2 text-xs">
        <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium">OpenAI Configuration</span>
        {savedKey && (
          <Button variant="ghost" size="sm" className="h-6 text-[10px] ml-auto" onClick={() => setExpanded(false)}>
            Close
          </Button>
        )}
      </div>
      <div className="flex gap-2 items-end">
        <div className="flex-1 space-y-1">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">API Key</label>
          <div className="relative">
            <Input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder={savedKey ? maskedKey : 'sk-...'}
              className="h-8 text-xs pr-8 font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Model</label>
          <Select value={model} onValueChange={handleModelChange}>
            <SelectTrigger className="h-8 text-xs w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {AVAILABLE_MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  <span className="font-medium">{m.label}</span>
                  <span className="text-[10px] text-muted-foreground ml-1">-- {m.description}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSave} disabled={!key.trim() || saving} className="h-8 text-xs px-3 bg-emerald-600 hover:bg-emerald-700">
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
        </Button>
        {savedKey && (
          <Button variant="destructive" size="icon" className="h-8 w-8" onClick={handleClearKey} title="Remove API key">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      {!savedKey && (
        <p className="text-[10px] text-muted-foreground">
          Your API key is stored locally in the browser and never sent anywhere except OpenAI's API.
        </p>
      )}
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
          <JesseIcon className="h-4 w-4" />
        </div>
      )}
      <div className={`rounded-lg px-4 py-3 text-sm max-w-[80%] ${isUser ? 'bg-emerald-600 text-white' : 'bg-muted'}`}>
        {msg.error ? (
          <div className="flex items-start gap-2 text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{msg.content}</span>
          </div>
        ) : isUser ? (
          <div className="whitespace-pre-wrap">{msg.content}</div>
        ) : (
          <div className="jesse-markdown prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            <ReactMarkdown>{msg.content || ' '}</ReactMarkdown>
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <User className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );
}

export default function AIChat() {
  const { trades } = useTradeStore();
  const { strategies } = useStrategyStore();
  const { accounts } = useAccountStore();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hey, I'm **Jesse** -- your AI trading coach. I have full access to your journal data and I'm ready to dig into your trades. Ask me anything -- performance reviews, pattern analysis, risk management, or strategy optimization. What do you want to work on?" },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const scrollRef = useRef(null);
  const abortRef = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = useCallback(async (text) => {
    const msg = text || input;
    if (!msg.trim() || isStreaming) return;

    const userMsg = { role: 'user', content: msg.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);
    abortRef.current = false;

    const tradeContext = buildTradeContext(trades, strategies, accounts);
    const systemMessage = {
      role: 'system',
      content: `${SYSTEM_PROMPT}\n\n${tradeContext}`,
    };

    const chatHistory = [...messages.filter(m => !m.error), userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    const tradeImages = (trades || [])
      .filter(t => t.images && t.images.length > 0)
      .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate))
      .slice(0, 5)
      .flatMap(t => t.images.map(img => ({
        symbol: t.symbol,
        direction: t.direction,
        entryDate: t.entryDate,
        dataUrl: img,
      })));

    const apiMessages = [systemMessage];

    if (tradeImages.length > 0) {
      const imageBlocks = tradeImages.map(img => ({
        type: 'image_url',
        image_url: { url: img.dataUrl, detail: 'low' },
      }));
      const caption = tradeImages.map(img =>
        `${img.symbol} (${img.direction}, ${new Date(img.entryDate).toLocaleDateString()})`
      ).join(', ');
      apiMessages.push({
        role: 'user',
        content: [
          { type: 'text', text: `Here are chart screenshots from my recent trades: ${caption}. Use these to analyze price action when relevant.` },
          ...imageBlocks,
        ],
      });
      apiMessages.push({ role: 'assistant', content: 'Got it -- I can see those charts and will reference the price action in my analysis.' });
    }

    apiMessages.push(...chatHistory);

    const assistantIdx = { current: null };

    setMessages(prev => {
      assistantIdx.current = prev.length;
      return [...prev, { role: 'assistant', content: '' }];
    });

    await streamChat(apiMessages, {
      onToken: (token) => {
        if (abortRef.current) return;
        setMessages(prev => {
          const updated = [...prev];
          const idx = updated.length - 1;
          updated[idx] = { ...updated[idx], content: updated[idx].content + token };
          return updated;
        });
      },
      onDone: () => {
        setIsStreaming(false);
      },
      onError: (err) => {
        setMessages(prev => {
          const updated = [...prev];
          const idx = updated.length - 1;
          if (updated[idx].content === '') {
            updated[idx] = { role: 'assistant', content: err.message, error: true };
          } else {
            updated.push({ role: 'assistant', content: err.message, error: true });
          }
          return updated;
        });
        setIsStreaming(false);
      },
    });
  }, [input, isStreaming, trades, strategies, accounts, messages]);

  const handleClear = () => {
    setMessages([
      { role: 'assistant', content: "Hey, I'm **Jesse** -- your AI trading coach. I have full access to your journal data and I'm ready to dig into your trades. Ask me anything -- performance reviews, pattern analysis, risk management, or strategy optimization. What do you want to work on?" },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
              <JesseIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Jesse <span className="text-muted-foreground font-normal">-- AI Trading Coach</span></h2>
              <p className="text-[10px] text-muted-foreground">
                Powered by OpenAI | {trades.length} trades loaded
              </p>
            </div>
          </div>
          {messages.length > 1 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleClear}>
              <Trash2 className="h-3 w-3 mr-1" /> Clear chat
            </Button>
          )}
        </div>
      </div>

      <SettingsBar onConfigured={setIsConfigured} />

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          {isStreaming && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pl-10">
              <Loader2 className="h-3 w-3 animate-spin" />
              Jesse is thinking...
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {messages.length <= 1 && isConfigured && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-1.5 max-w-3xl mx-auto">
            {SUGGESTIONS.map((s) => (
              <Badge
                key={s}
                variant="outline"
                className="text-[10px] cursor-pointer hover:bg-accent transition-colors"
                onClick={() => handleSend(s)}
              >
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 border-t">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={isConfigured ? "Ask Jesse about your trading..." : "Configure your API key above to start..."}
            className="h-9 text-sm"
            disabled={!isConfigured || isStreaming}
          />
          <Button
            onClick={() => handleSend()}
            className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700"
            disabled={!input.trim() || isStreaming || !isConfigured}
          >
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
