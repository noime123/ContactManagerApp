import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, Alert, 
  Image, StyleSheet, ScrollView, Dimensions 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { AntDesign, Feather } from "@expo/vector-icons";

export default function App() {
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(null);
  const [search, setSearch] = useState("");
  const [editingContact, setEditingContact] = useState(null);

  useEffect(() => {
    loadContacts();
  }, []);

  // Load Contacts from AsyncStorage
  const loadContacts = async () => {
    try {
      const storedContacts = await AsyncStorage.getItem("contacts");
      if (storedContacts) setContacts(JSON.parse(storedContacts));
    } catch (error) {
      console.error("Error loading contacts:", error);
    }
  };

  // Save Contacts to AsyncStorage
  const saveContacts = async (contacts) => {
    try {
      await AsyncStorage.setItem("contacts", JSON.stringify(contacts));
    } catch (error) {
      console.error("Error saving contacts:", error);
    }
  };

  // Image Picker Function
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

  // Add or Update Contact
  const saveContact = () => {
    if (!name || !phone) {
      Alert.alert("Error", "Please enter name and phone number.");
      return;
    }

    if (editingContact) {
      // Edit Contact
      const updatedContacts = contacts.map((contact) =>
        contact.id === editingContact.id ? { ...contact, name, phone, image } : contact
      );
      setContacts(updatedContacts);
      saveContacts(updatedContacts);
      setEditingContact(null);
    } else {
      // Add New Contact
      const newContact = { id: Date.now().toString(), name, phone, image };
      const updatedContacts = [...contacts, newContact];
      setContacts(updatedContacts);
      saveContacts(updatedContacts);
    }

    setName("");
    setPhone("");
    setImage(null);
  };

  // Delete Contact
  const deleteContact = (id) => {
    Alert.alert("Delete Contact", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: () => {
          const updatedContacts = contacts.filter((contact) => contact.id !== id);
          setContacts(updatedContacts);
          saveContacts(updatedContacts);
        },
      },
    ]);
  };

  // Edit Contact
  const editContact = (contact) => {
    setName(contact.name);
    setPhone(contact.phone);
    setImage(contact.image);
    setEditingContact(contact);
  };

  // Filter Contacts by Search
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Contacts</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search contacts..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Contact List */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.contactItem}>
            <Image source={item.image ? { uri: item.image } : require("./assets/avatar.png")} style={styles.contactImage} />
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.contactPhone}>{item.phone}</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={() => editContact(item)}>
                <Feather name="edit" size={22} color="blue" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteContact(item.id)}>
                <AntDesign name="delete" size={22} color="red" style={{ marginLeft: 10 }} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Add Contact Form */}
      <View style={styles.form}>
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          {image ? (
            <Image source={{ uri: image }} style={styles.pickedImage} />
          ) : (
            <AntDesign name="camera" size={30} color="gray" />
          )}
        </TouchableOpacity>
        <TextInput
          placeholder="Name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          placeholder="Phone Number"
          style={styles.input}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />
        <TouchableOpacity style={styles.addButton} onPress={saveContact}>
          <Text style={styles.addButtonText}>{editingContact ? "Update" : "Add"} Contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  searchBar: { backgroundColor: "#fff", padding: 10, borderRadius: 10, marginBottom: 10 },
  contactItem: { flexDirection: "row", backgroundColor: "white", padding: 10, borderRadius: 10, marginBottom: 10, alignItems: "center" },
  contactImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 18, fontWeight: "bold" },
  contactPhone: { fontSize: 14, color: "gray" },
  actionButtons: { flexDirection: "row" },
  form: { marginTop: 20, padding: 10, backgroundColor: "#fff", borderRadius: 10 },
  imagePicker: { alignSelf: "center", marginBottom: 10 },
  pickedImage: { width: 60, height: 60, borderRadius: 30 },
  input: { backgroundColor: "#fff", padding: 10, borderRadius: 10, marginBottom: 10 },
  addButton: { backgroundColor: "blue", padding: 10, borderRadius: 10, alignItems: "center" },
  addButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

