import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TrendingUp, Calendar, Users, MessageCircle, Heart, Share2, Clock, CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import MetricCard from '@/components/MetricCard';

export default function Dashboard() {
  const { state } = useApp();
  const router = useRouter();

  // Calculate real-time stats from actual data
  const stats = [
    { 
      label: 'Total Followers', 
      value: formatNumber(state.analytics.totalFollowers), 
      change: '+5.2%', 
      icon: Users, 
      color: '#1DA1F2' 
    },
    { 
      label: 'Engagement Rate', 
      value: `${state.analytics.engagementRate}%`, 
      change: '+0.3%', 
      icon: Heart, 
      color: '#E91E63' 
    },
    { 
      label: 'Posts This Week', 
      value: state.analytics.postsThisWeek.toString(), 
      change: '+2', 
      icon: MessageCircle, 
      color: '#10B981' 
    },
    { 
      label: 'Reach', 
      value: formatNumber(state.analytics.reach), 
      change: '+12%', 
      icon: TrendingUp, 
      color: '#8B5CF6' 
    },
  ];

  // Get today's scheduled posts
  const today = new Date();
  const todaysPosts = state.posts.filter(post => {
    if (!post.scheduledTime || post.status !== 'scheduled') return false;
    const postDate = new Date(post.scheduledTime);
    return postDate.toDateString() === today.toDateString();
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <CheckCircle2 size={16} color="#10B981" />;
      case 'pending':
        return <Clock size={16} color="#F59E0B" />;
      default:
        return <AlertCircle size={16} color="#EF4444" />;
    }
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>Welcome back! Here's your social media overview</Text>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.statCard}
              onPress={() => router.push('/analytics')}
            >
              <MetricCard
                title={stat.label}
                value={stat.value}
                change={stat.change}
                changeType={stat.change.startsWith('+') ? 'positive' : 'negative'}
                icon={stat.icon}
                color={stat.color}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity onPress={() => router.push('/calendar')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {todaysPosts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No posts scheduled for today</Text>
              <TouchableOpacity 
                style={styles.scheduleButton}
                onPress={() => router.push('/compose')}
              >
                <MessageCircle size={16} color="#1DA1F2" />
                <Text style={styles.scheduleButtonText}>Create Post</Text>
              </TouchableOpacity>
            </View>
          ) : (
            todaysPosts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.postPlatform}>
                  <View style={[styles.platformDot, { backgroundColor: '#1DA1F2' }]} />
                  <Text style={styles.platformText}>
                    {post.platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
                  </Text>
                </View>
                <View style={styles.postStatus}>
                  {getStatusIcon(post.status)}
                  <Text style={styles.postTime}>
                    {post.scheduledTime?.toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </Text>
                </View>
              </View>
              <Text style={styles.postContent}>{post.content}</Text>
            </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/compose')}
            >
              <MessageCircle size={20} color="#1DA1F2" />
              <Text style={styles.actionText}>New Post</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/calendar')}
            >
              <Calendar size={20} color="#8B5CF6" />
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/analytics')}
            >
              <TrendingUp size={20} color="#10B981" />
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginRight: '2%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  viewAllText: {
    fontSize: 14,
    color: '#1DA1F2',
    fontWeight: '500',
  },
  postCard: {
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
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  postPlatform: {
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
  postStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postTime: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
  },
  postContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
    padding: 12,
  },
  scheduleButtonText: {
    fontSize: 14,
    color: '#1DA1F2',
    fontWeight: '500',
    marginLeft: 8,
  },
});