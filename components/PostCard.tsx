import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Heart, MessageCircle, Share2, MoveVertical as MoreVertical, Clock, CircleCheck as CheckCircle2 } from 'lucide-react-native';

interface PostCardProps {
  content: string;
  platform: string;
  scheduledTime?: string;
  status: 'scheduled' | 'published' | 'draft';
  metrics?: {
    likes?: number;
    comments?: number;
    shares?: number;
  };
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PostCard({
  content,
  platform,
  scheduledTime,
  status,
  metrics,
  onEdit,
  onDelete
}: PostCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'published':
        return <CheckCircle2 size={16} color="#10B981" />;
      case 'scheduled':
        return <Clock size={16} color="#F59E0B" />;
      default:
        return <Clock size={16} color="#64748B" />;
    }
  };
  
  const getPlatformColor = (platformName: string) => {
    switch (platformName.toLowerCase()) {
      case 'twitter':
        return '#1DA1F2';
      case 'instagram':
        return '#E4405F';
      case 'facebook':
        return '#1877F2';
      case 'linkedin':
        return '#0A66C2';
      default:
        return '#64748B';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'published':
        return '#10B981';
      case 'scheduled':
        return '#F59E0B';
      default:
        return '#64748B';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.platformInfo}>
          <View style={[styles.platformDot, { backgroundColor: getPlatformColor(platform) }]} />
          <Text style={styles.platformText}>{platform}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.statusContainer}>
            {getStatusIcon()}
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {status}
            </Text>
          </View>
          <TouchableOpacity style={styles.menuButton}>
            <MoreVertical size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.content}>{content}</Text>

      {scheduledTime && (
        <Text style={styles.scheduledTime}>
          Scheduled for {scheduledTime}
        </Text>
      )}

      {metrics && status === 'published' && (
        <View style={styles.metrics}>
          <View style={styles.metricItem}>
            <Heart size={16} color="#E91E63" />
            <Text style={styles.metricText}>{metrics.likes}</Text>
          </View>
          <View style={styles.metricItem}>
            <MessageCircle size={16} color="#1DA1F2" />
            <Text style={styles.metricText}>{metrics.comments}</Text>
          </View>
          <View style={styles.metricItem}>
            <Share2 size={16} color="#10B981" />
            <Text style={styles.metricText}>{metrics.shares}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  platformText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  menuButton: {
    padding: 4,
  },
  content: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  scheduledTime: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
    fontWeight: '500',
  },
});