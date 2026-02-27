import { StyleSheet } from 'react-native'

const UserManagementStyle = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F2F2F2'
	},
	contentContainer: {
		paddingBottom: 20
	},
	topBar: {
		height: 86,
		backgroundColor: '#FFFFFF',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#E3E3E3'
	},
	menuCircle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: '#E5E5E5',
		alignItems: 'center',
		justifyContent: 'center'
	},
	logoText: {
		fontSize: 20,
		fontWeight: '700',
		color: '#1F4E95'
	},
	rightIcons: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8
	},
	title: {
		marginTop: 20,
		marginHorizontal: 20,
		fontSize: 34,
		fontWeight: '700',
		color: '#1F4E95'
	},
	summaryGrid: {
		marginTop: 16,
		marginHorizontal: 18,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		rowGap: 10
	},
	summaryCard: {
		width: '48.5%',
		borderWidth: 1,
		borderColor: '#444',
		borderRadius: 12,
		backgroundColor: '#F8F8F8',
		paddingVertical: 14,
		paddingHorizontal: 14
	},
	summaryValue: {
		fontSize: 30,
		fontWeight: '700',
		color: '#000'
	},
	summaryLabel: {
		marginTop: 3,
		fontSize: 20,
		color: '#3E3E3E'
	},
	filterRow: {
		marginTop: 20,
		marginHorizontal: 18,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6
	},
	searchBox: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#E9EDF3',
		borderRadius: 24,
		paddingHorizontal: 12,
		height: 42
	},
	searchInput: {
		flex: 1,
		marginLeft: 8,
		fontSize: 14,
		color: '#000'
	},
	filterButton: {
		height: 42,
		backgroundColor: '#E9EDF3',
		borderRadius: 22,
		paddingHorizontal: 10,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 2,
		minWidth: 72,
		justifyContent: 'center'
	},
	filterButtonText: {
		color: '#000',
		fontSize: 13
	},
	addUserButton: {
		height: 42,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#1F4E95',
		borderRadius: 12,
		paddingHorizontal: 12,
		alignItems: 'center',
		justifyContent: 'center'
	},
	addUserButtonText: {
		color: '#1F4E95',
		fontWeight: '600',
		fontSize: 13
	},
	tableContainer: {
		marginTop: 14,
		marginHorizontal: 18,
		backgroundColor: '#FFFFFF',
		borderRadius: 8,
		overflow: 'hidden'
	},
	tableHeader: {
		backgroundColor: '#1F4E95',
		flexDirection: 'row',
		alignItems: 'center',
		minHeight: 40,
		paddingHorizontal: 8
	},
	tableHeaderText: {
		color: '#FFFFFF',
		fontWeight: '700',
		fontSize: 13
	},
	tableRow: {
		flexDirection: 'row',
		alignItems: 'center',
		minHeight: 52,
		paddingHorizontal: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#E5E5E5'
	},
	tableCell: {
		fontSize: 12,
		color: '#1A1A1A'
	},
	nameCol: {
		width: '24%'
	},
	usernameCol: {
		width: '22%'
	},
	emailCol: {
		width: '27%'
	},
	roleCol: {
		width: '11%'
	},
	actionCol: {
		width: '16%'
	},
	actionCell: {
		alignItems: 'flex-start'
	},
	editText: {
		color: '#1F4E95',
		fontWeight: '600',
		fontSize: 12
	},
	removeText: {
		color: '#1F4E95',
		fontWeight: '700',
		marginTop: 2,
		fontSize: 12
	},
	loadingBox: {
		paddingVertical: 18
	},
	emptyBox: {
		paddingVertical: 18,
		alignItems: 'center'
	},
	emptyText: {
		color: '#5A5A5A'
	},
	dropdownOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.1)',
		justifyContent: 'center',
		paddingHorizontal: 24
	},
	dropdownMenu: {
		backgroundColor: '#FFFFFF',
		borderRadius: 10,
		overflow: 'hidden'
	},
	dropdownItem: {
		paddingVertical: 12,
		paddingHorizontal: 14,
		borderBottomWidth: 1,
		borderBottomColor: '#ECECEC'
	},
	dropdownItemText: {
		fontSize: 14,
		color: '#222'
	}
})

export default UserManagementStyle
