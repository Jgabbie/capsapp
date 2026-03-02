import { View, Text, ScrollView, TextInput, FlatList, TouchableOpacity, Image } from 'react-native'
import React, { useState } from 'react'
import Header from '../../components/Header'
import AdminSidebar from '../../components/AdminSidebar'
import AuditingStyles from '../../styles/adminstyles/AuditingStyles'

export default function Auditing() {
  const [isSidebarVisible, setSidebarVisible] = useState(false)

  const [logs] = useState([
    {
      id: '1',
      performedBy: 'juanlanuza@gmail.com',
      timestamp: 'November 25, 2024 10:02:00',
      action: 'Deleted Account',
      role: 'Admin',
      changeDetails: 'Changed Phone number'
    },
    {
      id: '2',
      performedBy: 'juanlanuza@gmail.com',
      timestamp: 'November 25, 2024 10:02:00',
      action: 'Added a new package',
      role: 'Admin',
      changeDetails: 'Added PKG-BAG201'
    },
    {
      id: '3',
      performedBy: 'juanlanuza@gmail.com',
      timestamp: 'November 25, 2024 10:02:00',
      action: 'Changed Profile',
      role: 'User',
      changeDetails: 'Changed Address'
    },
    {
      id: '4',
      performedBy: 'juanlanuza@gmail.com',
      timestamp: 'November 25, 2024 10:02:00',
      action: 'Changed Profile',
      role: 'Admin',
      changeDetails: 'Changed Fullname'
    },
    {
      id: '5',
      performedBy: 'juanlanuza@gmail.com',
      timestamp: 'November 25, 2024 10:02:00',
      action: 'Deleted Account',
      role: 'User',
      changeDetails: 'Changed Lastname'
    },
    {
      id: '6',
      performedBy: 'juanlanuza@gmail.com',
      timestamp: 'November 25, 2024 10:02:00',
      action: 'Edited a package',
      role: 'User',
      changeDetails: 'Edited PKG-BAG201'
    },
    {
      id: '7',
      performedBy: 'juanlanuza@gmail.com',
      timestamp: 'November 25, 2024 10:02:00',
      action: 'Changed Profile',
      role: 'Admin',
      changeDetails: 'Changed Fullname'
    },
    {
      id: '8',
      performedBy: 'juanlanuza@gmail.com',
      timestamp: 'November 25, 2024 10:02:00',
      action: 'Deleted Account',
      role: 'User',
      changeDetails: 'Changed Profile Picture'
    }
  ])

  const renderItem = ({ item }) => (
    <View style={AuditingStyles.card}>
      <View style={AuditingStyles.cardRow}>
        <Text style={AuditingStyles.cardLabel}>Performed by</Text>
        <Text style={AuditingStyles.cardValue}>{item.performedBy}</Text>
      </View>
      <View style={AuditingStyles.cardRow}>
        <Text style={AuditingStyles.cardLabel}>Timestamp</Text>
        <Text style={AuditingStyles.cardValue}>{item.timestamp}</Text>
      </View>
      <View style={AuditingStyles.cardRow}>
        <Text style={AuditingStyles.cardLabel}>Action</Text>
        <Text style={AuditingStyles.cardValue}>{item.action}</Text>
      </View>
      <View style={AuditingStyles.cardRow}>
        <Text style={AuditingStyles.cardLabel}>Role</Text>
        <Text style={AuditingStyles.cardValue}>{item.role}</Text>
      </View>
      <View style={AuditingStyles.cardRow}>
        <Text style={AuditingStyles.cardLabel}>Change Details</Text>
        <Text style={AuditingStyles.cardValue}>{item.changeDetails}</Text>
      </View>
    </View>
  )

  return (
    <View style={{ flex: 1 }}>
      <Header openSidebar={() => { setSidebarVisible(true) }} />
      <AdminSidebar visible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />

      <View style={AuditingStyles.container}>
        <Text style={AuditingStyles.header}>Auditing</Text>

        <View style={AuditingStyles.searchRow}>
          <TextInput
            style={AuditingStyles.searchInput}
            placeholder="Search username and actions..."
            placeholderTextColor="#777"
          />
          <TouchableOpacity style={AuditingStyles.filterButton}>
            <Text style={AuditingStyles.filterText}>Filter</Text>
            <Text style={AuditingStyles.filterCaret}>v</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={logs}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={AuditingStyles.table}
        />

        {/* <View style={AuditingStyles.paginationRow}>
            <View style={AuditingStyles.rowsPerPage}>
              <Text style={AuditingStyles.rowsText}>Rows per page</Text>
              <View style={AuditingStyles.rowsPill}>
                <Text style={AuditingStyles.rowsPillText}>8</Text>
                <Text style={AuditingStyles.rowsPillText}>v</Text>
              </View>
              <Text style={AuditingStyles.rowsText}>of 67 rows</Text>
            </View>

            <View style={AuditingStyles.pageControls}>
              <TouchableOpacity style={AuditingStyles.pageButton}>
                <Text style={AuditingStyles.pageButtonText}>{'<<'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={AuditingStyles.pageButton}>
                <Text style={AuditingStyles.pageButtonText}>{'<'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[AuditingStyles.pageButton, AuditingStyles.pageButtonActive]}>
                <Text style={[AuditingStyles.pageButtonText, AuditingStyles.pageButtonTextActive]}>1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={AuditingStyles.pageButton}>
                <Text style={AuditingStyles.pageButtonText}>2</Text>
              </TouchableOpacity>
              <TouchableOpacity style={AuditingStyles.pageButton}>
                <Text style={AuditingStyles.pageButtonText}>3</Text>
              </TouchableOpacity>
              <TouchableOpacity style={AuditingStyles.pageButton}>
                <Text style={AuditingStyles.pageButtonText}>...</Text>
              </TouchableOpacity>
              <TouchableOpacity style={AuditingStyles.pageButton}>
                <Text style={AuditingStyles.pageButtonText}>10</Text>
              </TouchableOpacity>
              <TouchableOpacity style={AuditingStyles.pageButton}>
                <Text style={AuditingStyles.pageButtonText}>{'>'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={AuditingStyles.pageButton}>
                <Text style={AuditingStyles.pageButtonText}>{'>>'}</Text>
              </TouchableOpacity>
            </View>
          </View> */}

      </View>
    </View>

  )
}