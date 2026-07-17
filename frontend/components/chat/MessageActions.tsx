import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Share, Clipboard, Alert } from 'react-native';
import { Copy, Share2, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react-native';

interface MessageActionsProps {
  messageText: string;
  onRegenerate?: () => void;
}

export default function MessageActions({
  messageText,
  onRegenerate
}: MessageActionsProps) {
  const [liked, setLiked] = useState<boolean | null>(null);

  const handleCopy = () => {
    Clipboard.setString(messageText);
    Alert.alert('Copied', 'Message copied to clipboard.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: messageText,
      });
    } catch {
      // no-op
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleCopy} style={styles.btn} activeOpacity={0.7}>
        <Copy size={13} color="#64748B" />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleShare} style={styles.btn} activeOpacity={0.7}>
        <Share2 size={13} color="#64748B" />
      </TouchableOpacity>
      {onRegenerate && (
        <TouchableOpacity onPress={onRegenerate} style={styles.btn} activeOpacity={0.7}>
          <RotateCcw size={13} color="#64748B" />
        </TouchableOpacity>
      )}
      <TouchableOpacity 
        onPress={() => setLiked(liked === true ? null : true)} 
        style={[styles.btn, liked === true && styles.liked]} 
        activeOpacity={0.7}
      >
        <ThumbsUp size={13} color={liked === true ? '#10B981' : '#64748B'} fill={liked === true ? '#10B98120' : 'transparent'} />
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => setLiked(liked === false ? null : false)} 
        style={[styles.btn, liked === false && styles.disliked]} 
        activeOpacity={0.7}
      >
        <ThumbsDown size={13} color={liked === false ? '#EF4444' : '#64748B'} fill={liked === false ? '#EF444420' : 'transparent'} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    paddingLeft: 4,
  },
  btn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liked: {
    backgroundColor: '#E6F4EA',
  },
  disliked: {
    backgroundColor: '#FCE8E6',
  },
});
