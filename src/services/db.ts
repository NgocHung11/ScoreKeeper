import * as SQLite from 'expo-sqlite';
import { Player } from '../types';

let db: SQLite.SQLiteDatabase | null = null;

export const initDB = async () => {
    try {
        db = await SQLite.openDatabaseAsync('scorekeeper.db');
        
        // Tạo bảng players nếu chưa có
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS players (
                id TEXT PRIMARY KEY NOT NULL,
                name TEXT NOT NULL,
                score INTEGER DEFAULT 0
            );
        `);

        // Tạo bảng settings để lưu dealerId, v.v.
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY NOT NULL,
                value TEXT NOT NULL
            );
        `);

        // Insert dữ liệu mẫu nếu chưa có (Optional - chỉ để test lần đầu)
        const result = await db.getAllAsync('SELECT * FROM players');
        if (result.length === 0) {
            await db.execAsync(`
                INSERT INTO players (id, name, score) VALUES 
                ('1', 'Tùng', 0),
                ('2', 'Cúc', 0),
                ('3', 'Trúc', 0),
                ('4', 'Mai', 0);
            `);
        }

        console.log("Database initialized successfully");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
};

export const getPlayers = async (): Promise<Player[]> => {
    if (!db) await initDB();
    try {
        const result: any[] = await db!.getAllAsync('SELECT * FROM players ORDER BY id ASC');
        return result.map(row => ({
            id: row.id,
            name: row.name,
            score: row.score
        }));
    } catch (error) {
        console.error("Error fetching players:", error);
        return [];
    }
};

export const savePlayers = async (players: Player[]) => {
    if (!db) await initDB();
    try {
        // Sử dụng transaction để đảm bảo toàn vẹn dữ liệu
        await db!.withTransactionAsync(async () => {
            await db!.runAsync('DELETE FROM players'); // Xóa hết cũ để insert mới (đơn giản nhất)
            for (const p of players) {
                await db!.runAsync(
                    'INSERT OR REPLACE INTO players (id, name, score) VALUES (?, ?, ?)',
                    [p.id, p.name, p.score]
                );
            }
        });
    } catch (error) {
        console.error("Error saving players:", error);
    }
};

export const getSetting = async (key: string): Promise<string | null> => {
    if (!db) await initDB();
    try {
        const result: any = await db!.getFirstAsync('SELECT value FROM settings WHERE key = ?', [key]);
        return result ? result.value : null;
    } catch (error) {
        console.error(`Error fetching setting ${key}:`, error);
        return null;
    }
};

export const saveSetting = async (key: string, value: string) => {
    if (!db) await initDB();
    try {
        await db!.runAsync(
            'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
            [key, value]
        );
    } catch (error) {
        console.error(`Error saving setting ${key}:`, error);
    }
};

// Reset điểm về 0 (Giữ người chơi)
export const resetScores = async () => {
    if (!db) await initDB();
    try {
        await db!.runAsync('UPDATE players SET score = 0');
    } catch (error) {
        console.error("Error resetting scores:", error);
    }
};

// Xóa toàn bộ dữ liệu (Hard Reset)
export const clearAllData = async () => {
    if (!db) await initDB();
    try {
        await db!.execAsync(`
            DELETE FROM players;
            DELETE FROM settings;
        `);
    } catch (error) {
        console.error("Error clearing all data:", error);
    }
};
