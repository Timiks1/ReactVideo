import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Image, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [cameraPermission, setCameraPermission] = useState(null);
  const cameraRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      console.log("MediaLibrary Permission Status:", status);
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'This app needs access to your camera roll to save photos.');
      } else {
        const media = await MediaLibrary.getAssetsAsync();
        setPhotos(media.assets);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      console.log("Camera Permission Status:", status);
      setCameraPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const { uri } = await cameraRef.current.takePictureAsync();
      const newPhotos = [{ uri }, ...photos];
      setPhotos(newPhotos);
      await MediaLibrary.saveToLibraryAsync(uri);
    }
  };

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      setIsRecording(true);
      const { uri } = await cameraRef.current.recordAsync();
      setVideoUri(uri);
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      setIsRecording(false);
      cameraRef.current.stopRecording();
    }
  };

  const renderPhoto = ({ item }) => (
    <TouchableOpacity style={styles.photoContainer}>
      <Image source={{ uri: item.uri }} style={styles.photo} />
    </TouchableOpacity>
  );

  const renderVideo = () => (
    <TouchableOpacity
      style={styles.videoContainer}
      onPress={() => setVideoUri(null)}
    >
      <Video
        source={{ uri: videoUri }}
        style={styles.video}
        shouldPlay
        isLooping
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
  
  const { width } = Dimensions.get('window');
  const numColumns = 2;
  const itemWidth = (width - 20) / numColumns;

  return 
    <View style={styles.container}>
      {cameraPermission && (
        <View style={styles.cameraContainer}>
          <Camera style={styles.camera} type={Camera.Constants.Type.back} ref={cameraRef}>
            <TouchableOpacity style={styles.takePictureButton} onPress={takePicture} />
            <TouchableOpacity
              style={styles.recordButton}
              onPress={isRecording ? stopRecording : startRecording}
            />
          </Camera>
        </View>
      )}

      {videoUri && renderVideo()}

      <FlatList
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        style={styles.photoList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 40,
  },
  cameraContainer: {
    width: '100%',
    height: 400,
    position: 'relative',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  takePictureButton: {
    width: 30,
    height: 30,
    backgroundColor: 'white',
    borderRadius: 30,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  recordButton: {
    width: 60,
    height: 60,
    backgroundColor: 'red',
    borderRadius: 30,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  videoContainer: {
    width: '100%',
    height: 300,
  },
  video: {
    flex: 1,
  },
  photoList: {
    marginTop: 10,
  },
  photoContainer: {
    width: '50%',
    padding: 5,
  },
  photo: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
    borderRadius: 5,
  },
});
