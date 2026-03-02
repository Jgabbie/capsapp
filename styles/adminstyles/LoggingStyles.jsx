import { StyleSheet } from 'react-native'

const LoggingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingTop: 16
  },
  header: {
    fontSize: 22,
    color: '#305797',
    fontWeight: 'bold',
    marginBottom: 12
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d5d5d5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d5d5d5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6
  },
  filterText: {
    fontSize: 12,
    color: '#305797',
    fontWeight: 'semibold'
  },
  filterCaret: {
    fontSize: 12,
    color: '#305797',
    fontWeight: 'bold'
  },
  tableWrapper: {
    minWidth: 920
  },
  table: {
    marginBottom: 12
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e3e3e3'
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    gap: 10
  },
  cardLabel: {
    fontSize: 12,
    color: '#305797',
    fontWeight: 'bold',
    width: 110
  },
  cardValue: {
    fontSize: 12,
    color: '#333',
    flex: 1,
    textAlign: 'right'
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#305797',
    borderBottomWidth: 1,
    borderBottomColor: '#6d6d6d',
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center'
  },
  tableHeaderCell: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e3e3e3',
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  tableCell: {
    fontSize: 11,
    textAlign: 'center',
    color: '#333'
  },
  performedCell: {
    width: 200,
    flexGrow: 0,
    flexShrink: 0,
    textAlign: 'left'
  },
  timestampCell: {
    width: 200,
    flexGrow: 0,
    flexShrink: 0,
    textAlign: 'left'
  },
  actionCell: {
    width: 90,
    flexGrow: 0,
    flexShrink: 0,
    textAlign: 'center'
  },
  roleCell: {
    width: 90,
    flexGrow: 0,
    flexShrink: 0,
    textAlign: 'center'
  },
  detailsCell: {
    width: 240,
    flexGrow: 0,
    flexShrink: 0,
    textAlign: 'left'
  },
  paginationRow: {
    marginTop: 8,
    marginBottom: 20
  },
  rowsPerPage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  rowsText: {
    fontSize: 12,
    color: '#555'
  },
  rowsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d5d5d5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginHorizontal: 8,
    backgroundColor: '#fff'
  },
  rowsPillText: {
    fontSize: 12,
    color: '#305797',
    fontWeight: 'semibold',
    marginHorizontal: 2
  },
  pageControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  pageButton: {
    borderWidth: 1,
    borderColor: '#d5d5d5',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff'
  },
  pageButtonActive: {
    backgroundColor: '#305797',
    borderColor: '#305797'
  },
  pageButtonText: {
    fontSize: 12,
    color: '#305797',
    fontWeight: 'semibold'
  },
  pageButtonTextActive: {
    color: '#fff'
  }
})

export default LoggingStyles
