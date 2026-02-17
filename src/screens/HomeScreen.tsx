import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, Modal, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Player } from '../types';
import { calculateNewScores } from '../utils/gameLogic';
import InputRow from '../components/InputRow';
import { initDB, getPlayers, savePlayers, getSetting, saveSetting, clearAllData } from '../services/db';
import { styles } from '../styles/homeScreenStyles';

const HomeScreen = () => {
    // 1. Dữ liệu người chơi
    const [players, setPlayers] = useState<Player[]>([]);

    // 2. ID người làm cái
    const [dealerId, setDealerId] = useState<string>('');

    // State cho Modal thêm người chơi
    const [isModalVisible, setModalVisible] = useState(false);
    const [newPlayerName, setNewPlayerName] = useState('');

    // Load dữ liệu từ SQLite khi mở app
    useEffect(() => {
        const loadData = async () => {
            try {
                await initDB();
                const savedPlayers = await getPlayers();
                if (savedPlayers && savedPlayers.length > 0) {
                    setPlayers(savedPlayers);
                }

                const savedDealerId = await getSetting('dealerId');
                if (savedDealerId) {
                    setDealerId(savedDealerId);
                }
            } catch (error) {
                console.error("Failed to load game data:", error);
            }
        };
        loadData();
    }, []);

    // Lưu dealerId mỗi khi thay đổi
    useEffect(() => {
        saveSetting('dealerId', dealerId);
    }, [dealerId]);

    // 3. Điểm tạm thời của ván đấu hiện tại (Chưa chốt)
    const [currentRoundScores, setCurrentRoundScores] = useState<Record<string, number>>({});

    // 4. Biến kích hoạt Reset (Tăng lên 1 sau mỗi lần chốt sổ)
    const [resetTrigger, setResetTrigger] = useState<number>(0);

    // Callback nhận điểm từ InputRow
    const handleScoreChange = (playerId: string, score: number) => {
        setCurrentRoundScores(prev => ({
            ...prev,
            [playerId]: score
        }));
    };

    // Logic Chốt Sổ (Submit)
    const handleSubmitRound = () => {
        // Kiểm tra xem có dữ liệu nhập vào chưa (Optional)
        const hasData = Object.values(currentRoundScores).some(score => score !== 0);
        if (!hasData) {
            Alert.alert("Chưa nhập điểm", "Vui lòng nhập thắng thua trước khi chốt!");
            return;
        }

        // Tính toán điểm mới
        const newPlayersState = calculateNewScores(players, dealerId, currentRoundScores);

        // Cập nhật State chính
        setPlayers(newPlayersState);

        // Lưu vào SQLite
        savePlayers(newPlayersState);

        // Reset dữ liệu tạm thời
        setCurrentRoundScores({});

        // Kích hoạt reset cho các component con (InputRow)
        setResetTrigger(prev => prev + 1);

    };

    // Logic Reset
    const handleResetGame = async () => {
        Alert.alert(
            "Chơi Ván Mới?",
            "Điểm của mọi người sẽ về 0. Bạn có chắc chắn không?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Đồng Ý",
                    onPress: async () => {
                        const resetPlayers = players.map(p => ({ ...p, score: 0 }));
                        setPlayers(resetPlayers);
                        await savePlayers(resetPlayers);
                        Alert.alert("Đã reset điểm!");
                    }
                }
            ]
        );
    };

    // Thêm người chơi mới (Modified to use Modal)
    const handleAddPlayer = async () => {
        if (!newPlayerName.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập tên người chơi!");
            return;
        }

        const newId = Date.now().toString();
        // Use user input name
        const newName = newPlayerName.trim();
        const newPlayer: Player = { id: newId, name: newName, score: 0 };

        // Nếu đây là người duy nhất (lúc đầu list rỗng), tự động set làm cái
        if (players.length === 0) {
            setDealerId(newId);
        }

        const newPlayersList = [...players, newPlayer];
        setPlayers(newPlayersList);

        // Reset & Close Modal immediately for better UX
        setModalVisible(false);
        setNewPlayerName('');

        // Save to DB in background
        await savePlayers(newPlayersList);
    };

    // Đổi người làm cái
    const handleSetDealer = (playerId: string) => {
        setDealerId(playerId);
    };

    // Xóa trắng toàn bộ dữ liệu
    const handleClearAllData = () => {
        const performClear = async () => {
            // Cập nhật giao diện ngay lập tức (Optimistic Update)
            setPlayers([]);
            setDealerId('');
            setResetTrigger(0);

            try {
                await clearAllData();
                if (Platform.OS === 'web') {
                    window.alert("Đã xóa toàn bộ dữ liệu!");
                } else {
                    Alert.alert("Thành công", "Đã xóa toàn bộ dữ liệu!");
                }
            } catch (error) {
                console.error("Lỗi xóa DB:", error);
                if (Platform.OS === 'web') {
                    window.alert("Lỗi: Không thể xóa dữ liệu trong database");
                } else {
                    Alert.alert("Lỗi", "Không thể xóa dữ liệu trong database");
                }
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ dữ liệu người chơi không?")) {
                performClear();
            }
        } else {
            Alert.alert(
                "Xác nhận xóa",
                "Bạn có chắc chắn muốn xóa toàn bộ dữ liệu người chơi không?",
                [
                    { text: "Hủy", style: "cancel" },
                    {
                        text: "Đồng Ý",
                        style: "destructive",
                        onPress: performClear
                    }
                ]
            );
        }
    };

    // Sắp xếp danh sách: Người làm cái lên đầu
    const sortedPlayers = React.useMemo(() => {
        return [...players].sort((a, b) => {
            if (a.id === dealerId) return -1;
            if (b.id === dealerId) return 1;
            return 0;
        });
    }, [players, dealerId]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.headerTitle}>Bảng Tính Điểm</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <Text style={styles.subTitle}>Ván thứ: {resetTrigger + 1}</Text>
                        <TouchableOpacity onPress={handleResetGame}>
                            <Text style={{ color: 'orange', fontWeight: 'bold', marginRight: 10 }}>Reset Điểm</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleClearAllData} style={{ padding: 8 }}>
                            <Text style={{ color: 'red', fontWeight: 'bold' }}>Xóa Hết</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <FlatList
                    data={sortedPlayers}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    renderItem={({ item }) => (
                        <InputRow
                            player={item}
                            isDealer={item.id === dealerId}
                            onScoreChange={handleScoreChange}
                            resetTrigger={resetTrigger}
                            onMakeDealer={handleSetDealer}
                        />
                    )}
                    ListFooterComponent={
                        <TouchableOpacity style={styles.addPlayerBtn} onPress={() => setModalVisible(true)}>
                            <Text style={styles.addPlayerText}>+ Thêm Người Chơi</Text>
                        </TouchableOpacity>
                    }
                />

                {/* Modal Thêm Người Chơi */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalText}>Nhập tên người chơi mới:</Text>
                            <TextInput
                                style={styles.input}
                                onChangeText={setNewPlayerName}
                                value={newPlayerName}
                                placeholder="Tên người chơi..."
                                autoFocus={true}
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.button, styles.buttonClose]}
                                    onPress={() => {
                                        setModalVisible(false);
                                        setNewPlayerName('');
                                    }}
                                >
                                    <Text style={styles.textStyle}>Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.buttonAdd]}
                                    onPress={handleAddPlayer}
                                >
                                    <Text style={styles.textStyle}>Thêm</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Nút Chốt Sổ Nổi ở dưới cùng */}
                <View style={styles.footer}>
                    <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitRound}>
                        <Text style={styles.submitBtnText}>CHỐT SỔ VÁN NÀY</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;