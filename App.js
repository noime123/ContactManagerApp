import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, StyleSheet, Modal, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { AntDesign } from '@expo/vector-icons';

const ContactsApp = () => {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [image, setImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const storedContacts = await AsyncStorage.getItem('contacts');
      if (storedContacts) setContacts(JSON.parse(storedContacts));
    } catch (error) {
      console.error('Failed to load contacts', error);
    }
  };

  const saveContacts = async (newContacts) => {
    try {
      await AsyncStorage.setItem('contacts', JSON.stringify(newContacts));
    } catch (error) {
      console.error('Failed to save contacts', error);
    }
  };

  const addContact = () => {
    if (name && phone) {
      const newContacts = [...contacts, { id: Date.now().toString(), name, phone, image }];
      setContacts(newContacts);
      saveContacts(newContacts);
      setName('');
      setPhone('');
      setImage(null);
    }
  };

  const deleteContact = (id) => {
    const newContacts = contacts.filter(contact => contact.id !== id);
    setContacts(newContacts);
    saveContacts(newContacts);
  };

  const openEditModal = (contact) => {
    setEditingContact(contact);
    setName(contact.name);
    setPhone(contact.phone);
    setImage(contact.image);
    setModalVisible(true);
  };

  const saveEdit = () => {
    if (editingContact) {
      const updatedContacts = contacts.map(contact => 
        contact.id === editingContact.id ? { ...contact, name, phone, image } : contact
      );
      setContacts(updatedContacts);
      saveContacts(updatedContacts);
      setModalVisible(false);
      setEditingContact(null);
      setName('');
      setPhone('');
      setImage(null);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Contacts</Text>
      <TextInput 
        style={styles.searchBar} 
        placeholder="Search contacts..." 
        value={search} 
        onChangeText={setSearch} 
      />
      <FlatList 
        data={contacts.filter(contact => contact.name.toLowerCase().includes(search.toLowerCase()))} 
        keyExtractor={item => item.id} 
        renderItem={({ item }) => (
          <View style={styles.contactItem}>
            <Image source={{ uri: item.image }} style={styles.avatar} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactPhone}>{item.phone}</Text>
            </View>
            <TouchableOpacity onPress={() => openEditModal(item)}>
              <AntDesign name="edit" size={20} color="blue" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteContact(item.id)}>
              <AntDesign name="delete" size={20} color="red" />
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={styles.addContactContainer}>
        <TouchableOpacity onPress={pickImage}>
          <AntDesign name="camera" size={30} color="gray" />
        </TouchableOpacity>
        <TextInput placeholder="Name" style={styles.input} value={name} onChangeText={setName} />
        <TextInput placeholder="Phone Number" style={styles.input} keyboardType="numeric" value={phone} onChangeText={setPhone} />
        <TouchableOpacity style={styles.addButton} onPress={addContact}>
          <Text style={styles.addButtonText}>Add Contact</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.header}>Edit Contact</Text>
          <TouchableOpacity onPress={pickImage}>
            <AntDesign name="camera" size={30} color="gray" />
          </TouchableOpacity>
          <TextInput placeholder="Name" style={styles.input} value={name} onChangeText={setName} />
          <TextInput placeholder="Phone Number" style={styles.input} keyboardType="numeric" value={phone} onChangeText={setPhone} />
          <Button title="Save Changes" onPress={saveEdit} />
          <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  searchBar: { backgroundColor: 'white', padding: 10, borderRadius: 10, marginBottom: 10 },
  contactItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 10, borderRadius: 10, marginBottom: 5 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  contactInfo: { flex: 1 },
  contactName: { fontWeight: 'bold' },
  contactPhone: { color: 'gray' },
  addContactContainer: { backgroundColor: 'white', padding: 20, borderRadius: 10, marginTop: 20, alignItems: 'center' },
  input: { width: '100%', backgroundColor: '#f0f0f0', padding: 10, borderRadius: 10, marginBottom: 10 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  addButton: { backgroundColor: 'blue', padding: 10, borderRadius: 10, width: '100%', alignItems: 'center' },
  addButtonText: { color: 'white', fontWeight: 'bold' },
});

export default ContactsApp;
