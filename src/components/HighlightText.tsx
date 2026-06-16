import { useMemo } from 'react';
import type { RiskLevel } from '@/types';
import { cn } from '@/lib/utils';

interface HighlightWord {
  word: string;
  level?: RiskLevel;
  category?: string;
}

interface HighlightTextProps {
  text: string;
  words: (string | HighlightWord)[];
  caseSensitive?: boolean;
  size?: 'sm' | 'base' | 'lg';
  className?: string;
}

const levelHighlightConfig = {
  high: {
    bg: 'bg-danger-100',
    text: 'text-danger-800',
    border: 'border-danger-300',
    underline: 'decoration-danger-400',
  },
  medium: {
    bg: 'bg-warning-100',
    text: 'text-warning-800',
    border: 'border-warning-300',
    underline: 'decoration-warning-400',
  },
  low: {
    bg: 'bg-info-100',
    text: 'text-info-800',
    border: 'border-info-300',
    underline: 'decoration-info-400',
  },
  safe: {
    bg: 'bg-success-100',
    text: 'text-success-800',
    border: 'border-success-300',
    underline: 'decoration-success-400',
  },
};

const sizeConfig = {
  sm: 'text-xs',
  base: 'text-sm',
  lg: 'text-base',
};

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeWord(w: string | HighlightWord): HighlightWord {
  if (typeof w === 'string') {
    return { word: w, level: 'high' };
  }
  return w;
}

interface Segment {
  text: string;
  highlight?: HighlightWord;
}

export function HighlightText({
  text,
  words,
  caseSensitive = false,
  size = 'base',
  className,
}: HighlightTextProps) {
  const segments = useMemo<Segment[]>(() => {
    if (!text) return [];
    if (!words || words.length === 0) return [{ text }];

    const normalizedWords = words.map(normalizeWord);
    const sortedWords = [...normalizedWords].sort((a, b) => b.word.length - a.word.length);

    const flags = caseSensitive ? 'g' : 'gi';
    const pattern = sortedWords
      .map((w) => escapeRegExp(w.word))
      .join('|');

    if (!pattern) return [{ text }];

    const regex = new RegExp(`(${pattern})`, flags);
    const parts = text.split(regex);

    const wordMap = new Map<string, HighlightWord>();
    normalizedWords.forEach((w) => {
      const key = caseSensitive ? w.word : w.word.toLowerCase();
      wordMap.set(key, w);
    });

    return parts.map((part) => {
      if (!part) return null;

      const lookupKey = caseSensitive ? part : part.toLowerCase();
      const matched = wordMap.get(lookupKey);

      if (matched) {
        return { text: part, highlight: matched };
      }
      return { text: part };
    }).filter(Boolean) as Segment[];
  }, [text, words, caseSensitive]);

  if (!text) {
    return <span className={cn(sizeConfig[size], className)}>-</span>;
  }

  return (
    <span className={cn(sizeConfig[size], 'text-primary-700 leading-relaxed', className)}>
      {segments.map((segment, index) => {
        if (!segment.highlight) {
          return <span key={index}>{segment.text}</span>;
        }

        const level = segment.highlight.level || 'high';
        const config = levelHighlightConfig[level];

        return (
          <mark
            key={index}
            title={segment.highlight.category ? `分类：${segment.highlight.category}` : undefined}
            className={cn(
              'px-0.5 rounded border font-semibold',
              'underline underline-offset-2 decoration-wavy',
              config.bg,
              config.text,
              config.border,
              config.underline,
            )}
          >
            {segment.text}
          </mark>
        );
      })}
    </span>
  );
}
