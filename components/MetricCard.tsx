import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: LucideIcon;
  color: string;
}

export default function MetricCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon,
  color 
}: MetricCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon size={24} color={color} />
        <View style={[
          styles.changeIndicator,
          { backgroundColor: changeType === 'positive' ? '#10B981' : '#EF4444' }
        ]}>
          <Text style={styles.changeText}>{change}</Text>
        </View>
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  changeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  changeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
});