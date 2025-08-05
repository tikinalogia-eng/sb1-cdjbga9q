import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Twitter, Instagram, Facebook, Linkedin, Calendar as CalendarIcon } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ComposeScreen() {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const [postText, setPostText] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handlePlatformToggle = (platform: string) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  const handlePost = () => {
    if (postText.trim().length === 0) {
      return;
    }

    if (selectedPlatforms.length === 0) {
      Alert.alert('Select Platform', 'Please select at least one platform to post to.');
      return;
    }

    const newPost = {
      id: Date.now().toString(),
      content: postText,
      platforms: selectedPlatforms,
      status: isScheduled ? 'scheduled' : 'published',
      createdAt: new Date(),
      ...(isScheduled && { scheduledTime: scheduledDate }),
      metrics: isScheduled ? undefined : { likes: 0, comments: 0, shares: 0, reach: 0 }
    };

    dispatch({ type: 'ADD_POST', payload: newPost });
    Alert.alert(
      isScheduled ? 'Post Scheduled' : 'Post Published',
      isScheduled ? 'Your post has been scheduled successfully!' : 'Your post has been published successfully!',
      [{ text: 'OK', onPress: () => router.push('/') }]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setScheduledDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'New Post',
          headerRight: () => (
            <TouchableOpacity 
              style={styles.postButton}
              disabled={postText.trim().length === 0}
              onPress={handlePost}
            >
              <Text style={[styles.postButtonText, postText.trim().length === 0 && styles.disabledText]}>
                {isScheduled ? 'Schedule' : 'Post'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.scrollContainer}>
        <TextInput
          style={styles.input}
          placeholder="What's on your mind?"
          placeholderTextColor="#888"
          multiline
          value={postText}
          onChangeText={setPostText}
          autoFocus
        />
        
        <View style={styles.platformSection}>
          <Text style={styles.sectionTitle}>Post to</Text>
          <View style={styles.platformButtons}>
            {state.connectedAccounts.map((account) => {
              const isSelected = selectedPlatforms.includes(account.platform);
              const PlatformIcon = getPlatformIcon(account.platform);
              return (
                <TouchableOpacity
                  key={account.platform}
                  style={[styles.platformButton, isSelected && { backgroundColor: account.color + '20' }]}
                  onPress={() => handlePlatformToggle(account.platform)}
                  disabled={!account.connected}
                >
                  <PlatformIcon size={20} color={account.connected ? account.color : '#CBD5E1'} />
                  <Text style={[styles.platformButtonText, !account.connected && styles.disabledText]}>
                    {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
                  </Text>
                  {isSelected && <View style={[styles.selectedIndicator, { backgroundColor: account.color }]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.scheduleSection}>
          <View style={styles.scheduleHeader}>
            <Text style={styles.sectionTitle}>Schedule for later</Text>
            <Switch
              value={isScheduled}
              onValueChange={setIsScheduled}
              trackColor={{ false: '#CBD5E1', true: '#1DA1F2' }}
              thumbColor={'#FFFFFF'}
            />
          </View>

          {isScheduled && (
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <CalendarIcon size={16} color="#64748B" />
                <Text style={styles.dateText}>
                  {scheduledDate.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                Platform.OS === 'web' ? (
                  <View style={styles.webDatePickerContainer}>
                    <input 
                      type="datetime-local" 
                      value={scheduledDate.toISOString().slice(0, 16)}
                      min={new Date().toISOString().slice(0, 16)}
                      onChange={(e) => {
                        if (e.target.value) {
                          setScheduledDate(new Date(e.target.value));
                          setShowDatePicker(false);
                        }
                      }}
                      style={{
                        padding: 10,
                        borderRadius: 8,
                        borderColor: '#E2E8F0',
                        borderWidth: 1,
                        marginTop: 8,
                        width: '100%'
                      }}
                    />
                  </View>
                ) : (
                  <DateTimePicker
                    value={scheduledDate}
                    mode="datetime"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function getPlatformIcon(platform: string) {
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
      return Twitter;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  input: {
    fontSize: 16,
    color: '#334155',
    minHeight: 150,
  },
  postButton: {
    marginRight: 8,
  },
  postButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledText: {
    color: '#94A3B8',
  },
  webDatePickerContainer: {
    marginTop: 8,
    width: '100%',
  },
  platformSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  platformButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  platformButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    marginLeft: 6,
  },
  selectedIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
  },
  scheduleSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTimeContainer: {
    marginTop: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 14,
    color: '#334155',
    marginLeft: 8,
  },
});