import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, Users, Heart, MessageCircle, Share2, Eye, ChartBar as BarChart3, Calendar, Filter } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import MetricCard from '@/components/MetricCard';

export default function Analytics() {
  const { state } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const periods = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
  ];

  // Calculate real analytics from actual data
  const calculateAnalytics = () => {
    const publishedPosts = state.posts.filter(post => post.status === 'published');
    const totalLikes = publishedPosts.reduce((sum, post) => sum + (post.metrics?.likes || 0), 0);
    const totalComments = publishedPosts.reduce((sum, post) => sum + (post.metrics?.comments || 0), 0);
    const totalShares = publishedPosts.reduce((sum, post) => sum + (post.metrics?.shares || 0), 0);
    const totalReach = publishedPosts.reduce((sum, post) => sum + (post.metrics?.reach || 0), 0);
    
    return {
      totalReach,
      totalEngagement: totalLikes + totalComments + totalShares,
      newFollowers: Math.floor(totalReach * 0.005), // Estimate based on reach
      totalShares,
    };
  };
  
  const analytics = calculateAnalytics();
  
  const overviewStats = [
    { 
      label: 'Total Reach', 
      value: analytics.totalReach > 1000 ? `${(analytics.totalReach / 1000).toFixed(1)}K` : analytics.totalReach.toString(), 
      change: '+12.5%', 
      trend: 'up', 
      icon: Eye, 
      color: '#1DA1F2' 
    },
    { 
      label: 'Engagement', 
      value: analytics.totalEngagement > 1000 ? `${(analytics.totalEngagement / 1000).toFixed(1)}K` : analytics.totalEngagement.toString(), 
      change: '+8.3%', 
      trend: 'up', 
      icon: Heart, 
      color: '#E91E63' 
    },
    { 
      label: 'New Followers', 
      value: analytics.newFollowers.toLocaleString(), 
      change: '+5.1%', 
      trend: 'up', 
      icon: Users, 
      color: '#10B981' 
    },
    { 
      label: 'Shares', 
      value: analytics.totalShares > 1000 ? `${(analytics.totalShares / 1000).toFixed(1)}K` : analytics.totalShares.toString(), 
      change: '-2.1%', 
      trend: 'down', 
      icon: Share2, 
      color: '#8B5CF6' 
    },
  ];

  // Get top performing posts from actual data
  const topPosts = state.posts
    .filter(post => post.status === 'published' && post.metrics)
    .sort((a, b) => {
      const aEngagement = (a.metrics?.likes || 0) + (a.metrics?.comments || 0) + (a.metrics?.shares || 0);
      const bEngagement = (b.metrics?.likes || 0) + (b.metrics?.comments || 0) + (b.metrics?.shares || 0);
      return bEngagement - aEngagement;
    })
    .slice(0, 3);

  const engagementData = state.analytics.weeklyEngagement;

  const maxEngagement = Math.max(...engagementData.map(d => d.value));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Track your social media performance</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.periodSelector}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.selectedPeriod
                ]}
                onPress={() => setSelectedPeriod(period.key)}
              >
                <Text style={[
                  styles.periodText,
                  selectedPeriod === period.key && styles.selectedPeriodText
                ]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {overviewStats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <MetricCard
                  title={stat.label}
                  value={stat.value}
                  change={stat.change}
                  changeType={stat.trend === 'up' ? 'positive' : 'negative'}
                  icon={stat.icon}
                  color={stat.color}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Engagement Over Time</Text>
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Daily Engagement Rate</Text>
              <TouchableOpacity style={styles.filterButton}>
                <Filter size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
            <View style={styles.chart}>
              {engagementData.map((item, index) => (
                <View key={index} style={styles.chartItem}>
                  <View 
                    style={[
                      styles.chartBar,
                      { height: (item.value / maxEngagement) * 100 }
                    ]} 
                  />
                  <Text style={styles.chartLabel}>{item.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Performing Posts</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {topPosts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.postPlatform}>
                  <View style={[styles.platformDot, { backgroundColor: '#1DA1F2' }]} />
                  <Text style={styles.platformText}>
                    {post.platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
                  </Text>
                </View>
                <View style={styles.postMetrics}>
                  <Text style={styles.metricText}>
                    {(post.metrics?.reach || 0) > 1000 
                      ? `${((post.metrics?.reach || 0) / 1000).toFixed(1)}K reach`
                      : `${post.metrics?.reach || 0} reach`
                    }
                  </Text>
                </View>
              </View>
              
              <Text style={styles.postContent}>{post.content}</Text>
              
              <View style={styles.postStats}>
                <View style={styles.statItem}>
                  <Heart size={16} color="#E91E63" />
                  <Text style={styles.statText}>
                    {(post.metrics?.likes || 0) > 1000 
                      ? `${((post.metrics?.likes || 0) / 1000).toFixed(1)}K`
                      : (post.metrics?.likes || 0).toString()
                    }
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <MessageCircle size={16} color="#1DA1F2" />
                  <Text style={styles.statText}>{post.metrics?.comments || 0}</Text>
                </View>
                <View style={styles.statItem}>
                  <Share2 size={16} color="#10B981" />
                  <Text style={styles.statText}>{post.metrics?.shares || 0}</Text>
                </View>
                <View style={styles.statItem}>
                  <BarChart3 size={16} color="#8B5CF6" />
                  <Text style={styles.statText}>
                    {((post.metrics?.likes || 0) + (post.metrics?.comments || 0) + (post.metrics?.shares || 0)) > 1000
                      ? `${(((post.metrics?.likes || 0) + (post.metrics?.comments || 0) + (post.metrics?.shares || 0)) / 1000).toFixed(1)}K`
                      : ((post.metrics?.likes || 0) + (post.metrics?.comments || 0) + (post.metrics?.shares || 0)).toString()
                    }
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights & Recommendations</Text>
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <TrendingUp size={20} color="#10B981" />
              <Text style={styles.insightTitle}>Best Posting Time</Text>
            </View>
            <Text style={styles.insightText}>
              Your audience is most active between 2-4 PM. Consider scheduling more posts during this time.
            </Text>
          </View>
          
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Heart size={20} color="#E91E63" />
              <Text style={styles.insightTitle}>Content Performance</Text>
            </View>
            <Text style={styles.insightText}>
              Posts with images get 45% more engagement. Try adding visuals to your text posts.
            </Text>
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
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: '#1DA1F2',
    fontWeight: '500',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedPeriod: {
    backgroundColor: '#1DA1F2',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  selectedPeriodText: {
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    margin: 6,
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
    marginBottom: 12,
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 2,
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
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  filterButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingHorizontal: 8,
  },
  chartItem: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 24,
    backgroundColor: '#1DA1F2',
    borderRadius: 12,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: '#64748B',
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
  postMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 12,
    color: '#64748B',
  },
  postContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
    fontWeight: '500',
  },
  insightCard: {
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
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});