import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    container: {
        flex: 1,
        padding: 16,
    },
    headerContainer: {
        marginBottom: 16,
        alignItems: 'center'
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    subTitle: {
        fontSize: 14,
        color: '#7f8c8d',
        marginTop: 4
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
    },
    submitBtn: {
        backgroundColor: '#2c3e50',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    submitBtnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    addPlayerBtn: {
        marginVertical: 10,
        padding: 12,
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#999'
    },
    addPlayerText: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold'
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%'
    },
    button: {
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        minWidth: 80,
        alignItems: 'center'
    },
    buttonAdd: {
        backgroundColor: "#2196F3",
    },
    buttonClose: {
        backgroundColor: "#ff5252",
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 18,
        fontWeight: 'bold'
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        width: '100%',
        borderColor: '#ccc',
        borderRadius: 5
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
        gap: 10
    }
});
