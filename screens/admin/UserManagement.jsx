import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Platform, Alert, Modal, Pressable } from 'react-native'
import axios from 'axios'
import { Ionicons } from '@expo/vector-icons'
import Header from '../../components/Header'
import UserManagementStyle from '../../styles/adminstyles/UserManagementStyle'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [openDropdown, setOpenDropdown] = useState(null)

  const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:5000/api' : 'http://localhost:5000/api'

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/get-user`)
      setUsers(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load users')
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveUser = (userId) => {
    Alert.alert('Remove User', 'Are you sure you want to remove this user?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${API_BASE_URL}/delete-user/${userId}`)
            setUsers((prevUsers) => prevUsers.filter((item) => item._id !== userId))
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to remove user')
          }
        }
      }
    ])
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const normalizedUsers = useMemo(() => {
    return users.map((user, index) => ({
      ...user,
      role: (user.role || 'user').toLowerCase(),
      isVerified: !!user.isVerified,
      fullName: `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.username || 'No Name',
      displayId: `U-${String(index + 1).padStart(4, '0')}`
    }))
  }, [users])

  const stats = useMemo(() => {
    const total = normalizedUsers.length
    const verified = normalizedUsers.filter((user) => user.isVerified).length
    const unverified = total - verified
    const admins = normalizedUsers.filter((user) => user.role === 'admin').length

    return { total, verified, unverified, admins }
  }, [normalizedUsers])

  const filteredUsers = useMemo(() => {
    return normalizedUsers.filter((user) => {
      const searchValue = searchText.trim().toLowerCase()
      const searchMatch =
        !searchValue ||
        user.fullName?.toLowerCase().includes(searchValue) ||
        user.displayId.toLowerCase().includes(searchValue) ||
        user.username?.toLowerCase().includes(searchValue) ||
        user.email?.toLowerCase().includes(searchValue)

      const roleMatch = roleFilter === 'All' || user.role === roleFilter.toLowerCase()
      const statusMatch =
        statusFilter === 'All' ||
        (statusFilter === 'Verified' && user.isVerified) ||
        (statusFilter === 'Unverified' && !user.isVerified)

      return searchMatch && roleMatch && statusMatch
    })
  }, [normalizedUsers, searchText, roleFilter, statusFilter])

  return (
    <ScrollView style={UserManagementStyle.container} contentContainerStyle={UserManagementStyle.contentContainer}>
      <Header openSidebar={() => {}} />

      <Text style={UserManagementStyle.title}>User Management</Text>

      <View style={UserManagementStyle.summaryGrid}>
        <View style={UserManagementStyle.summaryCard}>
          <Text style={UserManagementStyle.summaryValue}>{stats.total}</Text>
          <Text style={UserManagementStyle.summaryLabel}>Users</Text>
        </View>
        <View style={UserManagementStyle.summaryCard}>
          <Text style={UserManagementStyle.summaryValue}>{stats.verified}</Text>
          <Text style={UserManagementStyle.summaryLabel}>Verified</Text>
        </View>
        <View style={UserManagementStyle.summaryCard}>
          <Text style={UserManagementStyle.summaryValue}>{stats.unverified}</Text>
          <Text style={UserManagementStyle.summaryLabel}>Unverified</Text>
        </View>
        <View style={UserManagementStyle.summaryCard}>
          <Text style={UserManagementStyle.summaryValue}>{stats.admins}</Text>
          <Text style={UserManagementStyle.summaryLabel}>Admins</Text>
        </View>
      </View>

      <View style={UserManagementStyle.filterRow}>
        <View style={UserManagementStyle.searchBox}>
          <Ionicons name="search" size={16} color="#000" />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            style={UserManagementStyle.searchInput}
            placeholder="Search name, username or email"
            placeholderTextColor="#6B6B6B"
          />
        </View>

        <TouchableOpacity
          style={UserManagementStyle.filterButton}
          onPress={() => setOpenDropdown('role')}
        >
          <Text style={UserManagementStyle.filterButtonText}>{roleFilter}</Text>
          <Ionicons name="chevron-down" size={16} color="#1F4E95" />
        </TouchableOpacity>

        <TouchableOpacity
          style={UserManagementStyle.filterButton}
          onPress={() => setOpenDropdown('status')}
        >
          <Text style={UserManagementStyle.filterButtonText}>{statusFilter}</Text>
          <Ionicons name="chevron-down" size={16} color="#1F4E95" />
        </TouchableOpacity>

        <TouchableOpacity style={UserManagementStyle.addUserButton}>
          <Text style={UserManagementStyle.addUserButtonText}>Add User</Text>
        </TouchableOpacity>
      </View>

      <View style={UserManagementStyle.tableContainer}>
        <View style={UserManagementStyle.tableHeader}>
          <Text style={[UserManagementStyle.tableHeaderText, UserManagementStyle.nameCol]}>Name</Text>
          <Text style={[UserManagementStyle.tableHeaderText, UserManagementStyle.usernameCol]}>Username</Text>
          <Text style={[UserManagementStyle.tableHeaderText, UserManagementStyle.emailCol]}>Email</Text>
          <Text style={[UserManagementStyle.tableHeaderText, UserManagementStyle.roleCol]}>Role</Text>
          <Text style={[UserManagementStyle.tableHeaderText, UserManagementStyle.actionCol]}>Action</Text>
        </View>

        {loading ? (
          <View style={UserManagementStyle.loadingBox}>
            <ActivityIndicator size="small" color="#1F4E95" />
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={UserManagementStyle.emptyBox}>
            <Text style={UserManagementStyle.emptyText}>No users found.</Text>
          </View>
        ) : (
          filteredUsers.map((user) => (
            <View key={user._id} style={UserManagementStyle.tableRow}>
              <Text style={[UserManagementStyle.tableCell, UserManagementStyle.nameCol]} numberOfLines={1}>{user.fullName}</Text>
              <Text style={[UserManagementStyle.tableCell, UserManagementStyle.usernameCol]} numberOfLines={1}>{user.username}</Text>
              <Text style={[UserManagementStyle.tableCell, UserManagementStyle.emailCol]} numberOfLines={1}>{user.email}</Text>
              <Text style={[UserManagementStyle.tableCell, UserManagementStyle.roleCol]}>{user.role === 'admin' ? 'Admin' : 'User'}</Text>
              <View style={[UserManagementStyle.actionCol, UserManagementStyle.actionCell]}>
                <Text style={UserManagementStyle.editText}>Edit</Text>
                <Text style={UserManagementStyle.removeText} onPress={() => handleRemoveUser(user._id)}>Remove</Text>
              </View>
            </View>
          ))
        )}
      </View>

      <Modal transparent visible={openDropdown === 'role'} animationType="fade">
        <Pressable style={UserManagementStyle.dropdownOverlay} onPress={() => setOpenDropdown(null)}>
          <View style={UserManagementStyle.dropdownMenu}>
            {['All', 'User', 'Admin'].map((option) => (
              <TouchableOpacity
                key={option}
                style={UserManagementStyle.dropdownItem}
                onPress={() => {
                  setRoleFilter(option)
                  setOpenDropdown(null)
                }}
              >
                <Text style={UserManagementStyle.dropdownItemText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <Modal transparent visible={openDropdown === 'status'} animationType="fade">
        <Pressable style={UserManagementStyle.dropdownOverlay} onPress={() => setOpenDropdown(null)}>
          <View style={UserManagementStyle.dropdownMenu}>
            {['All', 'Verified', 'Unverified'].map((option) => (
              <TouchableOpacity
                key={option}
                style={UserManagementStyle.dropdownItem}
                onPress={() => {
                  setStatusFilter(option)
                  setOpenDropdown(null)
                }}
              >
                <Text style={UserManagementStyle.dropdownItemText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  )
}
