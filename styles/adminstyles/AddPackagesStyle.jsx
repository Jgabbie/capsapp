import { StyleSheet } from "react-native";

const AddPackagesStyle = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    headerText: {
        fontSize: 22,
        color: "#305797",
        fontWeight: '700',
        marginBottom: 20,
    },
    formPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        borderStyle: 'dashed',
    }
});

export default AddPackagesStyle;