import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  FlatList,
  Image,
  ActivityIndicator
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const BrowserScreen = ({ navigation }) => {
  const [url, setUrl] = useState('https://example.com');
  const [isLoading, setIsLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentTitle, setCurrentTitle] = useState('Astranova Browser');
  const webViewRef = useRef(null);

  const handleNavigate = (targetUrl) => {
    if (!targetUrl.startsWith('http')) {
      targetUrl = `https://${targetUrl}`;
    }
    setUrl(targetUrl);
    setIsLoading(true);
    
    // Add to history
    const historyItem = {
      id: Date.now().toString(),
      title: targetUrl,
      url: targetUrl,
      timestamp: new Date()
    };
    setHistory(prev => [historyItem, ...prev.slice(0, 49)]);
  };

  const handleSearch = async () => {
    if (!url.trim()) return;
    
    try {
      // AI-powered search
      const response = await fetch('https://astranova-liard.vercel.app/api/v1/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: url })
      });
      
      if (response.ok) {
        const results = await response.json();
        if (results.results?.[0]?.url) {
          handleNavigate(results.results[0].url);
        }
      }
    } catch (error) {
      // Fallback to regular navigation
      handleNavigate(url);
    }
  };

  const addBookmark = () => {
    const bookmark = {
      id: Date.now().toString(),
      title: currentTitle,
      url: url,
      favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`
    };
    setBookmarks(prev => [...prev, bookmark]);
    Alert.alert('Bookmark Added', 'Page added to bookmarks');
  };

  const renderBookmark = ({ item }) => (
    <TouchableOpacity
      style={styles.bookmarkItem}
      onPress={() => {
        handleNavigate(item.url);
        setShowBookmarks(false);
      }}
    >
      <Image source={{ uri: item.favicon }} style={styles.favicon} />
      <View style={styles.bookmarkInfo}>
        <Text style={styles.bookmarkTitle}>{item.title}</Text>
        <Text style={styles.bookmarkUrl}>{item.url}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => {
        handleNavigate(item.url);
        setShowHistory(false);
      }}
    >
      <View style={styles.historyInfo}>
        <Text style={styles.historyTitle}>{item.title}</Text>
        <Text style={styles.historyTime}>
          {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.navigationRow}>
          <TouchableOpacity style={styles.navButton}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Icon name="arrow-forward" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Icon name="home" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.urlInput}
            value={url}
            onChangeText={setUrl}
            onSubmitEditing={handleNavigate}
            placeholder="Enter URL or search..."
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <TouchableOpacity style={styles.navButton} onPress={addBookmark}>
            <Icon name="bookmark" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => setShowBookmarks(!showBookmarks)}
          >
            <Icon name="star" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navButton} 
            onPress={() => setShowHistory(!showHistory)}
          >
            <Icon name="history" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchRow}>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Icon name="search" size={20} color="#fff" />
            <Text style={styles.searchButtonText}>AI Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Browser Content */}
      <View style={styles.browserContainer}>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
        
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webView}
          onLoad={() => setIsLoading(false)}
          onNavigationStateChange={(navState) => {
            setCurrentTitle(navState.title || 'Astranova Browser');
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Bookmarks Modal */}
      <Modal
        visible={showBookmarks}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBookmarks(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowBookmarks(false)}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Bookmarks</Text>
            <View style={{ width: 24 }} />
          </View>
          <FlatList
            data={bookmarks}
            renderItem={renderBookmark}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="bookmark-border" size={48} color="#666" />
                <Text style={styles.emptyText}>No bookmarks yet</Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>

      {/* History Modal */}
      <Modal
        visible={showHistory}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowHistory(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowHistory(false)}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>History</Text>
            <View style={{ width: 24 }} />
          </View>
          <FlatList
            data={history}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="history" size={48} color="#666" />
                <Text style={styles.emptyText}>No history yet</Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="Browser" component={BrowserScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    backgroundColor: '#111',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  navButton: {
    padding: 8,
    borderRadius: 4,
  },
  urlInput: {
    flex: 1,
    backgroundColor: '#222',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    fontSize: 14,
  },
  searchRow: {
    flexDirection: 'row',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    gap: 8,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  browserContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  bookmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  favicon: {
    width: 24,
    height: 24,
    marginRight: 12,
    borderRadius: 4,
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  bookmarkUrl: {
    color: '#666',
    fontSize: 14,
  },
  historyItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  historyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTitle: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  historyTime: {
    color: '#666',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
  },
});

export default App;
