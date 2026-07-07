import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { CheckCheck } from 'lucide-react-native';
import MessageActions from './MessageActions';

interface MessageBubbleProps {
  message: {
    id: string;
    text: string;
    sender: 'ai' | 'user';
    timestamp: Date;
  };
  onRegenerate?: () => void;
}

export default function MessageBubble({
  message,
  onRegenerate
}: MessageBubbleProps) {
  const isAI = message.sender === 'ai';

  return (
    <View style={[styles.bubbleWrap, isAI ? styles.aiWrap : styles.userWrap]}>
      <View style={[styles.bubble, isAI ? styles.aiBubble : styles.userBubble]}>
        {isAI ? (
          parseMarkdown(message.text)
        ) : (
          <Text style={styles.userText}>{message.text}</Text>
        )}
        <View style={styles.metaRow}>
          <Text style={[styles.timeText, !isAI && { color: 'rgba(255,255,255,0.6)' }]}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {!isAI && (
            <CheckCheck size={13} color="rgba(255,255,255,0.7)" style={styles.ticks} />
          )}
        </View>
      </View>
      {isAI && (
        <MessageActions messageText={message.text} onRegenerate={onRegenerate} />
      )}
    </View>
  );
}

// Markdown parser
function parseMarkdown(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];

    // Code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <View key={`code-${idx}`} style={mdStyles.codeBlock}>
            <Text style={mdStyles.codeBlockText}>{codeBlockContent.join('\n')}</Text>
          </View>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(
        <Text key={`h1-${idx}`} style={mdStyles.h1}>
          {parseInline(line.substring(2))}
        </Text>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <Text key={`h2-${idx}`} style={mdStyles.h2}>
          {parseInline(line.substring(3))}
        </Text>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <Text key={`h3-${idx}`} style={mdStyles.h3}>
          {parseInline(line.substring(4))}
        </Text>
      );
      continue;
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      elements.push(
        <View key={`bq-${idx}`} style={mdStyles.blockquote}>
          <Text style={mdStyles.blockquoteText}>{parseInline(line.substring(2))}</Text>
        </View>
      );
      continue;
    }

    // Tables
    if (line.startsWith('|') && idx + 1 < lines.length && lines[idx + 1].includes('|--')) {
      const headers = line.split('|').map(s => s.trim()).filter(s => s);
      const rows: string[][] = [];
      let rowIdx = idx + 2;
      while (rowIdx < lines.length && lines[rowIdx].startsWith('|')) {
        const columns = lines[rowIdx].split('|').map(s => s.trim()).filter(s => s);
        rows.push(columns);
        rowIdx++;
      }
      idx = rowIdx - 1; // skip parsed rows
      
      elements.push(
        <View key={`table-${idx}`} style={mdStyles.table}>
          <View style={mdStyles.tableHeaderRow}>
            {headers.map((h, i) => (
              <Text key={`th-${i}`} style={mdStyles.tableHeaderText}>{h}</Text>
            ))}
          </View>
          {rows.map((row, rIdx) => (
            <View key={`tr-${rIdx}`} style={[mdStyles.tableRow, rIdx % 2 === 1 && { backgroundColor: '#F8FAFC' }]}>
              {row.map((col, cIdx) => (
                <Text key={`tc-${cIdx}`} style={mdStyles.tableRowText}>{parseInline(col)}</Text>
              ))}
            </View>
          ))}
        </View>
      );
      continue;
    }

    // Lists
    if (line.startsWith('* ') || line.startsWith('- ')) {
      elements.push(
        <View key={`bullet-${idx}`} style={mdStyles.listItem}>
          <Text style={mdStyles.bullet}>•</Text>
          <Text style={mdStyles.listItemText}>{parseInline(line.substring(2))}</Text>
        </View>
      );
      continue;
    }

    const numListMatch = line.match(/^(\d+)\.\s(.*)/);
    if (numListMatch) {
      elements.push(
        <View key={`num-${idx}`} style={mdStyles.listItem}>
          <Text style={mdStyles.bullet}>{numListMatch[1]}.</Text>
          <Text style={mdStyles.listItemText}>{parseInline(numListMatch[2])}</Text>
        </View>
      );
      continue;
    }

    // Standard paragraph
    if (line.trim() !== '') {
      elements.push(
        <Text key={`p-${idx}`} style={mdStyles.paragraph}>
          {parseInline(line)}
        </Text>
      );
    }
  }

  return <View style={styles.markdownContainer}>{elements}</View>;
}

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let keyIdx = 0;

  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|[^\*`]+)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <Text key={`b-${keyIdx}`} style={{ fontWeight: '800', color: '#0F172A' }}>
          {token.slice(2, -2)}
        </Text>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <Text key={`i-${keyIdx}`} style={{ fontStyle: 'italic' }}>
          {token.slice(1, -1)}
        </Text>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <Text key={`code-${keyIdx}`} style={mdStyles.inlineCode}>
          {token.slice(1, -1)}
        </Text>
      );
    } else {
      parts.push(
        <Text key={`text-${keyIdx}`} style={{ color: '#334155' }}>{token}</Text>
      );
    }
    keyIdx++;
  }

  return parts;
}

const mdStyles = StyleSheet.create({
  h1: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 14,
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  h2: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 4,
  },
  h3: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 2,
  },
  paragraph: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 8,
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: '#7C4DFF',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginVertical: 6,
  },
  blockquoteText: {
    color: '#475569',
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  codeBlock: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
  },
  codeBlockText: {
    color: '#38BDF8',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
  },
  inlineCode: {
    backgroundColor: '#F1F5F9',
    color: '#EF4444',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 10,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableHeaderText: {
    flex: 1,
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableRowText: {
    flex: 1,
    color: '#475569',
    fontSize: 11,
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  bullet: {
    color: '#7C4DFF',
    fontSize: 13,
    fontWeight: '800',
  },
  listItemText: {
    flex: 1,
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
});

const styles = StyleSheet.create({
  bubbleWrap: {
    marginBottom: 16,
    width: '100%',
  },
  aiWrap: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    paddingRight: 40,
    paddingLeft: 12,
  },
  userWrap: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    paddingLeft: 40,
    paddingRight: 12,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderRadius: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  userBubble: {
    backgroundColor: '#7C4DFF',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
    gap: 4,
  },
  timeText: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
  },
  ticks: {
    opacity: 0.8,
  },
  markdownContainer: {
    width: '100%',
  },
});
