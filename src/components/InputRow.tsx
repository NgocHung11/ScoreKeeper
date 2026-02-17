import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Player } from '../types';

interface InputRowProps {
    player: Player;
    isDealer: boolean;
    onScoreChange: (playerId: string, roundScore: number) => void;
    resetTrigger: number;
    onMakeDealer: (playerId: string) => void; // New prop
}

const InputRow: React.FC<InputRowProps> = ({
    player,
    isDealer,
    onScoreChange,
    resetTrigger,
    onMakeDealer
}) => {
    // State nội bộ: 0 = Hòa, 1 = Thắng, -1 = Thua
    const [result, setResult] = useState<0 | 1 | -1>(0);

    // State nội bộ: Hệ số nhân (1 hoặc 2)
    const [multiplier, setMultiplier] = useState<1 | 2>(1);

    // 1. Logic Reset: Khi resetTrigger thay đổi (từ cha), reset lại state nội bộ
    useEffect(() => {
        setResult(0);
        setMultiplier(1);
        // Lưu ý: Không cần gọi onScoreChange(0) ở đây vì logic cha đã clear rồi
    }, [resetTrigger]);

    // 2. Logic Gửi điểm: Mỗi khi user bấm nút, tính điểm và gửi ra ngoài
    useEffect(() => {
        if (isDealer) return;

        const finalScore = result * multiplier;
        onScoreChange(player.id, finalScore);
    }, [result, multiplier]);

    // Nếu là Nhà Cái
    if (isDealer) {
        return (
            <View style={[styles.container, styles.dealerContainer]}>
                <View style={styles.infoWrapper}>
                    <Text style={styles.nameText}>{player.name}</Text>
                    <Text style={styles.currentTotalScore}>Tổng: {player.score}</Text>
                </View>
                <View style={styles.dealerBadge}>
                    <Text style={styles.dealerText}>👑 Cầm Cái</Text>
                </View>
            </View>
        );
    }

    // Nếu là Người chơi con
    return (
        <View style={styles.container}>
            {/* Cột Trái: Tên & Điểm dự kiến */}
            <View style={styles.nameCol}>
                <Text style={styles.nameText}>{player.name}</Text>
                <Text style={styles.currentTotalScore}>Tổng: {player.score}</Text>

                {/* Button Make Dealer (Chỉ hiện khi chưa chọn thắng thua để tránh rối) */}
                {result === 0 && (
                    <TouchableOpacity
                        style={styles.makeDealerBtn}
                        onPress={() => onMakeDealer(player.id)}
                    >
                        <Text style={styles.makeDealerText}>⭐ Chọn làm cái</Text>
                    </TouchableOpacity>
                )}

                {/* Hiển thị điểm ván này sẽ cộng/trừ bao nhiêu */}
                <Text style={[
                    styles.previewScore,
                    result > 0 ? styles.textWin : (result < 0 ? styles.textLose : styles.textNeutral)
                ]}>
                    Ván này: {result === 0 ? '--' : (result > 0 ? `+${result * multiplier}` : `${result * multiplier}`)}
                </Text>
            </View>

            {/* Cột Phải: Các nút bấm */}
            <View style={styles.controlsCol}>

                {/* Hàng 1: Thắng / Thua */}
                <View style={styles.buttonGroup}>
                    <TouchableOpacity
                        style={[styles.btn, result === 1 && styles.btnWinActive]}
                        onPress={() => setResult(result === 1 ? 0 : 1)}
                    >
                        <Text style={[styles.btnText, result === 1 && styles.textWhite]}>Thắng</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.btn, result === -1 && styles.btnLoseActive]}
                        onPress={() => setResult(result === -1 ? 0 : -1)}
                    >
                        <Text style={[styles.btnText, result === -1 && styles.textWhite]}>Thua</Text>
                    </TouchableOpacity>
                </View>

                {/* Hàng 2: Hệ số (Chỉ hiện khi đã chọn Thắng/Thua) */}
                {result !== 0 && (
                    <View style={[styles.buttonGroup, { marginTop: 8 }]}>
                        <TouchableOpacity
                            style={[styles.btnSmall, multiplier === 1 && styles.btnMultiActive]}
                            onPress={() => setMultiplier(1)}
                        >
                            <Text style={[styles.btnTextSmall, multiplier === 1 && styles.textWhite]}>x1</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btnSmall, multiplier === 2 && styles.btnMultiActive]}
                            onPress={() => setMultiplier(2)}
                        >
                            <Text style={[styles.btnTextSmall, multiplier === 2 && styles.textWhite]}>x2</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: 'white',
        marginBottom: 10,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    dealerContainer: {
        backgroundColor: '#fff8e1',
        borderWidth: 1,
        borderColor: '#ffc107',
        justifyContent: 'space-between'
    },
    infoWrapper: {
        flex: 1
    },
    nameCol: {
        flex: 1,
        justifyContent: 'center',
    },
    controlsCol: {
        flex: 1.5,
        alignItems: 'flex-end',
    },
    nameText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
    },
    currentTotalScore: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4
    },
    dealerBadge: {
        backgroundColor: '#ffc107',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    dealerText: {
        fontWeight: 'bold',
        color: '#fff',
    },
    previewScore: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    textWin: { color: '#4caf50' },
    textLose: { color: '#f44336' },
    textNeutral: { color: '#9e9e9e' },
    textWhite: { color: '#fff' },
    buttonGroup: {
        flexDirection: 'row',
        gap: 8,
    },
    btn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        minWidth: 70,
        alignItems: 'center',
    },
    btnSmall: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: '#f0f0f0',
        minWidth: 50,
        alignItems: 'center',
    },
    btnWinActive: { backgroundColor: '#4caf50' },
    btnLoseActive: { backgroundColor: '#f44336' },
    btnMultiActive: { backgroundColor: '#2196f3' },
    btnText: { fontSize: 14, fontWeight: '500' },
    makeDealerBtn: {
        marginTop: 4,
        marginBottom: 8,
        backgroundColor: '#e3f2fd',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    makeDealerText: {
        fontSize: 10,
        color: '#1976d2',
        fontWeight: 'bold',
    },
    btnTextSmall: { fontSize: 12, fontWeight: 'bold' },
});

export default InputRow;