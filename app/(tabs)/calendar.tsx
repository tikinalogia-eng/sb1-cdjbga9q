import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ChevronRight, Climport { ChevronLeft, ChevronRight, Clock, Plus, Twitter, Instagram, Facebook, Linkedin, MoveHorizontal as MoreHorizontal, Trash2, CreditCard as Edit3, BadgeAlert as Alert } from 'lucide-react-native'alendar() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // We don't need this mock data as we're using the actual state
  // const scheduledPosts = [
  //   { id: 1, time: '10:00 AM', content: 'Morning motivation post', platform: 'twitter', color: '#1DA1F2' },
  //   { id: 2, time: '2:00 PM', content: 'Product showcase', platform: 'instagram', color: '#E4405F' },
  //   { id: 3, time: '4:00 PM', content: 'Industry insights', platform: 'linkedin', color: '#0A66C2' },
  // ];

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return Twitter;
      case 'instagram':
        return Instagram;
      case 'facebook':
        return Facebook;
      case 'linkedin':
        return Linkedin;
      default:
        return Clock;
    }
  };

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number | null) => {
    if (!day) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const selectDate = (day: number | null) => {
    if (!day) return;
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
  };

  // Get posts for selected date
  const getPostsForDate = (date: Date) => {
    return state.posts.filter(post => {
      if (!post.scheduledTime) return false;
      const postDate = new Date(post.scheduledTime);
      return postDate.toDateString() === date.toDateString();
    });
  };
  
  const selectedDatePosts = getPostsForDate(selectedDate);
  
  // Check if a day has posts
  const dayHasPosts = (day: number | null) => {
    if (!day) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return getPostsForDate(date).length > 0;
  };
  
  const deletePost = (postId: string) => {
    dispatch({ type: 'DELETE_POST', payload: postId });
  };
  
  const editPost = (post: any) => {
    // In a real app, you would navigate to compose with the post data
    // For now, we'll show an alert
    Alert.alert(
      'Edit Post',
      'This would open the compose screen with the post data pre-filled.',
      [{ text: 'OK' }]
    );
  };
  
  const days = getDaysInMonth(currentDate);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Content Calendar</Text>
          <Text style={styles.subtitle}>Plan and organize your social media posts</Text>
        </View>

        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth('prev')}
            >
              <ChevronLeft size={20} color="#64748B" />
            </TouchableOpacity>
            
            <Text style={styles.monthYear}>
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>
            
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth('next')}
            >
              <ChevronRight size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.daysOfWeekContainer}>
            {daysOfWeek.map((day) => (
              <Text key={day} style={styles.dayOfWeek}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  day && isToday(day) && styles.todayCell,
                  day && isSelected(day) && styles.selectedCell,
                ]}
                onPress={() => selectDate(day)}
                disabled={!day}
              >
                {day && (
                  <>
                    <Text style={[
                      styles.dayNumber,
                      isToday(day) && styles.todayText,
                      isSelected(day) && styles.selectedText,
                    ]}>
                      {day}
                    </Text>
                    {dayHasPosts(day) && (
                      <View style={styles.postIndicator} />
                    )}
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.selectedDateSection}>
          <View style={styles.selectedDateHeader}>
            <Text style={styles.selectedDateTitle}>
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/compose')}
            >
              <Plus size={20} color="#1DA1F2" />
            </TouchableOpacity>
          </View>

          <View style={styles.postsContainer}>
            {selectedDatePosts.map((post) => {
              const primaryPlatform = post.platforms[0];
              const PlatformIcon = getPlatformIcon(primaryPlatform);
              const account = state.connectedAccounts.find(acc => acc.platform === primaryPlatform);
              
              return (
                <View key={post.id} style={styles.postItem}>
                  <View style={styles.postTime}>
                    <Clock size={16} color="#64748B" />
                    <Text style={styles.timeText}>
                      {post.scheduledTime?.toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}
                    </Text>
                  </View>
                  <View style={styles.postContent}>
                    <View style={styles.postHeader}>
                      <PlatformIcon size={16} color={account?.color || '#64748B'} />
                      <Text style={styles.postTitle} numberOfLines={1}>
                        {post.content}
                      </Text>
                    </View>
                    <Text style={styles.postPlatform}>
                      {post.platforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => {
                      // Navigate to compose screen with post data
                      // In a real app, we would pass the post data to the compose screen
                      // For now, we'll just navigate to the compose screen
                      router.push('/compose');
                    }}
                  >
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {selectedDatePosts.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No posts scheduled for this day</Text>
              <TouchableOpacity 
                style={styles.scheduleButton}
                onPress={() => router.push('/compose')}
              >
                <Plus size={16} color="#1DA1F2" />
                <Text style={styles.scheduleButtonText}>Schedule a Post</Text>
              </TouchableOpacity>
            </View>
          )}
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
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  monthYear: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1E293B',
  },
  daysOfWeekContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayOfWeek: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    paddingVertical: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  todayCell: {
    backgroundColor: '#1DA1F2',
    borderRadius: 8,
  },
  selectedCell: {
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  todayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  postIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
  },
  selectedDateSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  selectedDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
  },
  postsContainer: {
    gap: 12,
  },
  postItem: {
    flexDirection: 'row',
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
  postTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 4,
    fontWeight: '500',
  },
  postContent: {
    flex: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
    marginLeft: 8,
  },
  postPlatform: {
    fontSize: 12,
    color: '#64748B',
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  editText: {
    fontSize: 12,
    color: '#1DA1F2',
    fontWeight: '500',
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