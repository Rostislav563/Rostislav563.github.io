// Game Constants
const GAME_CONFIG = {
    WIDTH: 1280,
    HEIGHT: 720,
    TILE_SIZE: 32,
    GRAVITY: 900,
    
    // Player settings
    PLAYER: {
        SPEED: 220,
        JUMP_VELOCITY: -420,
        MAX_HEALTH: 5,
        ATTACK_DAMAGE: 1,
        ATTACK_RANGE: 45,
        INVINCIBILITY_TIME: 1000
    },
    
    // Enemy settings
    ENEMY: {
        SPEED: 80,
        DAMAGE: 1,
        PATROL_DISTANCE: 100
    },
    
    // Boss settings
    BOSS: {
        HEALTH: 10,
        SPEED: 120,
        DAMAGE: 2
    },
    
    // Colors for procedural sprites
    COLORS: {
        PLAYER: 0x4ade80,
        ENEMY: 0xef4444,
        BOSS: 0x7c3aed,
        COIN: 0xfbbf24,
        HEART: 0xf43f5e,
        PLATFORM: 0x64748b,
        CRYSTAL: 0x60a5fa
    },
    
    // Level themes
    THEMES: {
        VILLAGE: {
            bg: 0x87ceeb,
            ground: 0x8b7355,
            platform: 0x6b5344
        },
        FOREST: {
            bg: 0x2d5a27,
            ground: 0x4a3728,
            platform: 0x3d2817
        },
        CAVE: {
            bg: 0x1a1a2e,
            ground: 0x4a4a5a,
            platform: 0x3a3a4a
        },
        MOUNTAIN: {
            bg: 0x6b7280,
            ground: 0x78716c,
            platform: 0x57534e
        },
        CASTLE: {
            bg: 0x1f1f3a,
            ground: 0x374151,
            platform: 0x4b5563
        }
    }
};

// Story dialogues
const STORY = {
    INTRO: [
        "Тёмный маг Морвин украл Кристалл Света...",
        "Без него наша деревня погрузится во тьму.",
        "Только ты можешь вернуть его!",
        "Отправляйся в путь, герой!"
    ],
    LEVEL_1: ["Деревня в безопасности. Путь лежит через лес..."],
    LEVEL_2: ["Лес позади. Впереди тёмные пещеры..."],
    LEVEL_3: ["Пещеры пройдены! Горы уже близко..."],
    LEVEL_4: ["Почти у цели! Замок мага ждёт..."],
    LEVEL_5: ["Морвин повержен! Кристалл Света возвращён!"],
    BOSS: ["Ха-ха-ха! Ты осмелился прийти сюда?!", "Кристалл мой! Ты не уйдёшь живым!"]
};

// Key bindings
const KEYS = {
    LEFT: ['LEFT', 'A'],
    RIGHT: ['RIGHT', 'D'],
    JUMP: ['UP', 'W', 'SPACE'],
    ATTACK: ['X', 'J'],
    PAUSE: ['ESC']
};
