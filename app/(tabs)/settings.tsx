import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, Bell, Shield, Palette, CircleHelp as HelpCircle, LogOut, ChevronRight, Twitter, Instagram, Facebook, Linkedin, Plus, CircleCheck as CheckCircle, X } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';

export default function Settings() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  
  const { notifications, darkMode, autoSchedule } = state.settings;

  const connectedAccounts = state.connectedAccounts.map(account => ({
    ...account,
    platform: account.platform.charAt(0).toUpperCase() + account.platform.slice(1),
    icon: account.platform === 'twitter' ? Twitter :
          account.platform === 'instagram' ? Instagram :
          account.platform === 'facebook' ? Facebook :
          account.platform === 'linkedin' ? Linkedin : Twitter
  }));

  const settingsOptions = [
    {
      section: 'Account',
      items: [
        { label: 'Profile Settings', icon: User, action: 'navigate' },
        { label: 'Privacy & Security', icon: Shield, action: 'navigate' },
      ]
    },
    {
      section: 'Preferences',
      items: [
        { 
          label: 'Notifications', 
          icon: Bell, 
          action: 'toggle', 
          value: notifications, 
          onToggle: (value: boolean) => dispatch({ type: 'UPDATE_SETTINGS', payload: { notifications: value } })
        },
        { 
          label: 'Dark Mode', 
          icon: Palette, 
          action: 'toggle', 
          value: darkMode, 
          onToggle: (value: boolean) => dispatch({ type: 'UPDATE_SETTINGS', payload: { darkMode: value } })
        },
        { 
          label: 'Auto-Schedule', 
          icon: CheckCircle, 
          action: 'toggle', 
          value: autoSchedule, 
          onToggle: (value: boolean) => dispatch({ type: 'UPDATE_SETTINGS', payload: { autoSchedule: value } })
        },
      ]
    },
    {
      section: 'Support',
      items: [
        { label: 'Help Center', icon: HelpCircle, action: 'navigate' },
        { label: 'Contact Support', icon: HelpCircle, action: 'navigate' },
      ]
    }
  ];

  const toggleAccountConnection = (platform: string) => {
    dispatch({ type: 'TOGGLE_ACCOUNT', payload: platform.toLowerCase() });
    
    const account = state.connectedAccounts.find(acc => acc.platform === platform.toLowerCase());
    const action = account?.connected ? 'disconnected' : 'connected';
    
    Alert.alert(
      `Account ${action.charAt(0).toUpperCase() + action.slice(1)}`,
      `Your ${platform} account has been ${action}.`,
      [{ text: 'OK' }]
    );
  };
  
  const calculateMonthlyStats = () => {
    const publishedPosts = state.posts.filter(post => post.status === 'published');
    const totalFollowers = publishedPosts.reduce((sum, post) => sum + (post.metrics?.reach || 0) * 0.01, 0);
    const totalReach = publishedPosts.reduce((sum, post) => sum + (post.metrics?.reach || 0), 0);
    
    return {
      postsPublished: publishedPosts.length,
      newFollowers: Math.floor(totalFollowers),
      totalReach: Math.floor(totalReach),
    };
  };
  
  const monthlyStats = calculateMonthlyStats();
  const renderAccountCard = (account: any) => (
    <View key={account.platform.toLowerCase()} style={styles.accountCard}>
      <View style={styles.accountInfo}>
        <View style={[styles.iconContainer, { backgroundColor: `${account.color}15` }]}>
          <account.icon size={20} color={account.color} />
        </View>
        <View style={styles.accountDetails}>
          <Text style={styles.accountPlatform}>{account.platform}</Text>
          <Text style={styles.accountUsername}>{account.username}</Text>
        </View>
      </View>
      <View style={styles.accountStatus}>
        {account.connected ? (
          <>
            <CheckCircle size={16} color="#10B981" />
            <Text style={styles.connectedText}>Connected</Text>
            <TouchableOpacity 
              style={styles.disconnectButton}
              onPress={() => toggleAccountConnection(account.platform)}
            >
              <X size={14} color="#EF4444" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={styles.connectButton}
            onPress={() => toggleAccountConnection(account.platform)}
          >
            <Plus size={16} color="#1DA1F2" />
            <Text style={styles.connectText}>Connect</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderSettingsItem = (item: any) => (
    <TouchableOpacity 
      key={item.label} 
      style={styles.settingsItem}
      onPress={() => {
        if (item.action === 'navigate') {
          Alert.alert(
            item.label,
            'This feature would navigate to the respective settings page.',
            [{ text: 'OK' }]
          );
        }
      }}
    >
      <View style={styles.settingsItemLeft}>
        <item.icon size={20} color="#64748B" />
        <Text style={styles.settingsItemLabel}>{item.label}</Text>
      </View>
      <View style={styles.settingsItemRight}>
        {item.action === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#E2E8F0', true: '#1DA1F2' }}
            thumbColor={item.value ? '#FFFFFF' : '#64748B'}
          />
        ) : (
          <ChevronRight size={16} color="#64748B" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your account and preferences</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected Accounts</Text>
          <Text style={styles.sectionDescription}>
            Manage your social media accounts for posting and analytics
          </Text>
          <View style={styles.accountsList}>
            {connectedAccounts.map(renderAccountCard)}
          </View>
        </View>

        {settingsOptions.map((section) => (
          <View key={section.section} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.section}</Text>
            <View style={styles.settingsGroup}>
              {section.items.map(renderSettingsItem)}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics & Insights</Text>
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Your Progress This Month</Text>
            <View style={styles.progressStats}>
              <View style={styles.progressItem}>
                <Text style={styles.progressValue}>{monthlyStats.postsPublished}</Text>
                <Text style={styles.progressLabel}>Posts Published</Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressValue}>
                  {(monthlyStats.newFollowers / 1000).toFixed(1)}K
                </Text>
                <Text style={styles.progressLabel}>New Followers</Text>
              </View>
              <View style={styles.progressItem}>
                <Text style={styles.progressValue}>
                  {(monthlyStats.totalReach / 1000).toFixed(1)}K
                </Text>
                <Text style={styles.progressLabel}>Total Reach</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                'Sign Out',
                'Are you sure you want to sign out?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Sign Out', 
                    style: 'destructive',
                    onPress: () => {
                      Alert.alert('Signed Out', 'You have been signed out successfully.');
                    }
                  }
                ]
              );
            }}
          >
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>SocialFlow v1.0.0</Text>
          <Text style={styles.footerSubText}>
            Made with ❤️ for content creators
          </Text>
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
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },
  accountsList: {
    gap: 12,
  },
  accountCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountDetails: {
    flex: 1,
  },
  accountPlatform: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  accountUsername: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  accountStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 8,
  },
  disconnectButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#FEF2F2',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  connectText: {
    fontSize: 12,
    color: '#1DA1F2',
    fontWeight: '600',
    marginLeft: 4,
  },
  settingsGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsItemLabel: {
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 12,
    fontWeight: '500',
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 16,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressItem: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1DA1F2',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  footerSubText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
});