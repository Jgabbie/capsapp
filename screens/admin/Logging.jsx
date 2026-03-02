import { View, Text, ScrollView, TextInput, FlatList, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import Header from '../../components/Header'
import AdminSidebar from '../../components/AdminSidebar'
import LoggingStyles from '../../styles/adminstyles/LoggingStyles'


export default function Logging() {
  const [isSidebarVisible, setSidebarVisible] = useState(false)

  const [logs] = useState([
    {
      id: '1',
      performedBy: 'marionbalmonte@gmail.com',
      timestamp: 'November 25, 2024 10:02:00',
      action: 'Login',
      role: 'Admin',
      details: 'username: marionbalmonte'
    },
    {
      id: '2',
      performedBy: 'juanlanuza@gmail.com',
      timestamp: 'November 25, 2024 10:02:00',
      action: 'Logout',
      role: 'Admin',
      details: 'username: juanlanuza'
    },
    {
      id: '3',
      performedBy: 'marionbalmonte@gmail.com',
      timestamp: 'November 25, 2024 10:02:00',
      action: 'Logout',
      role: 'User',
      details: 'username: marionbalmonte'
    },
    {
      id: '4',
      performedBy: 'juanlanuza@gmail.com',
      timestamp: 'November 25, 2024 10:02:00',
      action: 'Login',
      role: 'Admin',
      details: 'username: juanlanuza'
    },
    {
      id: '5',
      performedBy: 'yatsantos@gmail.com',
      timestamp: 'November 25, 2024 10:02:00',
      action: 'Logout',
      role: 'User',
      details: 'username: yatsantos'
    },
    {
      id: '6',
      performedBy: 'jssnbauca@gmail.com',
      timestamp: 'November 25, 2024 10:02:00',
      action: 'Login',
      role: 'User',
      details: 'username: jssnbauca'
    },
    {
      id: '7',
      performedBy: 'juanlanuza@gmail.com',
      timestamp: 'November 25, 2024 10:02:00',
      action: 'Login',
      role: 'Admin',
      details: 'username: juanlanuza'
    },
    {
      id: '8',
      performedBy: 'yatsantos@gmail.com',
      timestamp: 'November 25, 2024 10:02:00',
      action: 'Logout',
      role: 'User',
      details: 'username: yatsantos'
    }
  ])

  const renderItem = ({ item }) => (
    <View style={LoggingStyles.card}>
      <View style={LoggingStyles.cardRow}>
        <Text style={LoggingStyles.cardLabel}>Performed by</Text>
        <Text style={LoggingStyles.cardValue}>{item.performedBy}</Text>
      </View>
      <View style={LoggingStyles.cardRow}>
        <Text style={LoggingStyles.cardLabel}>Timestamp</Text>
        <Text style={LoggingStyles.cardValue}>{item.timestamp}</Text>
      </View>
      <View style={LoggingStyles.cardRow}>
        <Text style={LoggingStyles.cardLabel}>Action</Text>
        <Text style={LoggingStyles.cardValue}>{item.action}</Text>
      </View>
      <View style={LoggingStyles.cardRow}>
        <Text style={LoggingStyles.cardLabel}>Role</Text>
        <Text style={LoggingStyles.cardValue}>{item.role}</Text>
      </View>
      <View style={LoggingStyles.cardRow}>
        <Text style={LoggingStyles.cardLabel}>Details</Text>
        <Text style={LoggingStyles.cardValue}>{item.details}</Text>
      </View>
    </View>
  )

  return (
    <View style={{ flex: 1 }}>
      <Header openSidebar={() => { setSidebarVisible(true) }} />
      <AdminSidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

      <View style={LoggingStyles.container}>
        <Text style={LoggingStyles.header}>Logging</Text>

        <View style={LoggingStyles.searchRow}>
          <TextInput
            style={LoggingStyles.searchInput}
            placeholder="Search username and actions..."
            placeholderTextColor="#777"
          />
          <TouchableOpacity style={LoggingStyles.filterButton}>
            <Text style={LoggingStyles.filterText}>Filter</Text>
            <Text style={LoggingStyles.filterCaret}>v</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={logs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={LoggingStyles.table}
        />

        {/* <View style={LoggingStyles.paginationRow}>
          <View style={LoggingStyles.rowsPerPage}>
            <Text style={LoggingStyles.rowsText}>Rows per page</Text>
            <View style={LoggingStyles.rowsPill}>
              <Text style={LoggingStyles.rowsPillText}>8</Text>
              <Text style={LoggingStyles.rowsPillText}>v</Text>
            </View>
            <Text style={LoggingStyles.rowsText}>of 67 rows</Text>
          </View>

          <View style={LoggingStyles.pageControls}>
            <TouchableOpacity style={LoggingStyles.pageButton}>
              <Text style={LoggingStyles.pageButtonText}>{'<<'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={LoggingStyles.pageButton}>
              <Text style={LoggingStyles.pageButtonText}>{'<'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[LoggingStyles.pageButton, LoggingStyles.pageButtonActive]}>
              <Text style={[LoggingStyles.pageButtonText, LoggingStyles.pageButtonTextActive]}>1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={LoggingStyles.pageButton}>
              <Text style={LoggingStyles.pageButtonText}>2</Text>
            </TouchableOpacity>
            <TouchableOpacity style={LoggingStyles.pageButton}>
              <Text style={LoggingStyles.pageButtonText}>3</Text>
            </TouchableOpacity>
            <TouchableOpacity style={LoggingStyles.pageButton}>
              <Text style={LoggingStyles.pageButtonText}>...</Text>
            </TouchableOpacity>
            <TouchableOpacity style={LoggingStyles.pageButton}>
              <Text style={LoggingStyles.pageButtonText}>10</Text>
            </TouchableOpacity>
            <TouchableOpacity style={LoggingStyles.pageButton}>
              <Text style={LoggingStyles.pageButtonText}>{'>'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={LoggingStyles.pageButton}>
              <Text style={LoggingStyles.pageButtonText}>{'>>'}</Text>
            </TouchableOpacity>
          </View>
        </View> */}

      </View>
    </View>

  )
}