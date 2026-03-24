// Level configurations - продуманный дизайн на 3-5 минут прохождения
// Принципы: секции, вертикальность, разнообразие, риск/награда

const LEVELS = {
    1: {
        name: 'Деревня',
        theme: 'VILLAGE',
        background: 0x87ceeb,
        music: 'village_theme',
        enemies: ['slime'],
        dialogue: STORY.INTRO,
        killsRequired: 20,
        width: 6400,
        height: 720,
        map: {
            platforms: [
                // ===== СЕКЦИЯ 1: Туториал (0-1200) =====
                { x: 0, y: 688, width: 500, height: 32, type: 'ground' },
                { x: 200, y: 590, width: 120, height: 24, type: 'platform' },
                { x: 400, y: 500, width: 100, height: 24, type: 'platform' },
                { x: 550, y: 688, width: 300, height: 32, type: 'ground' },
                { x: 650, y: 580, width: 120, height: 24, type: 'platform' },
                { x: 900, y: 688, width: 300, height: 32, type: 'ground' },
                
                // ===== СЕКЦИЯ 2: Первые прыжки (1200-2400) =====
                { x: 1100, y: 600, width: 100, height: 24, type: 'platform' },
                { x: 1250, y: 520, width: 100, height: 24, type: 'platform' },
                { x: 1400, y: 600, width: 100, height: 24, type: 'platform' },
                { x: 1500, y: 688, width: 400, height: 32, type: 'ground' },
                { x: 1600, y: 580, width: 140, height: 24, type: 'platform' },
                { x: 1800, y: 490, width: 120, height: 24, type: 'platform' },
                { x: 1950, y: 686, width: 300, height: 32, type: 'ground' },
                { x: 2050, y: 580, width: 100, height: 24, type: 'platform' },
                { x: 2200, y: 500, width: 120, height: 24, type: 'platform' },
                { x: 2300, y: 688, width: 200, height: 32, type: 'ground' },
                
                // ===== СЕКЦИЯ 3: Подъём (2400-3600) =====
                { x: 2550, y: 620, width: 100, height: 24, type: 'platform' },
                { x: 2700, y: 540, width: 100, height: 24, type: 'platform' },
                { x: 2850, y: 460, width: 120, height: 24, type: 'platform' },
                { x: 3000, y: 380, width: 140, height: 24, type: 'platform' },
                { x: 3150, y: 460, width: 100, height: 24, type: 'platform' },
                { x: 3300, y: 540, width: 100, height: 24, type: 'platform' },
                { x: 3450, y: 620, width: 120, height: 24, type: 'platform' },
                { x: 3550, y: 688, width: 250, height: 32, type: 'ground' },
                
                // ===== СЕКЦИЯ 4: Платформинг (3600-4800) =====
                { x: 3850, y: 600, width: 80, height: 24, type: 'platform' },
                { x: 3980, y: 530, width: 80, height: 24, type: 'platform' },
                { x: 4100, y: 600, width: 80, height: 24, type: 'platform' },
                { x: 4230, y: 530, width: 80, height: 24, type: 'platform' },
                { x: 4350, y: 600, width: 80, height: 24, type: 'platform' },
                { x: 4450, y: 688, width: 300, height: 32, type: 'ground' },
                { x: 4550, y: 580, width: 120, height: 24, type: 'platform' },
                { x: 4750, y: 500, width: 100, height: 24, type: 'platform' },
                { x: 4800, y: 688, width: 200, height: 32, type: 'ground' },
                
                // ===== СЕКЦИЯ 5: Арена (4800-5600) =====
                { x: 5050, y: 688, width: 600, height: 32, type: 'ground' },
                { x: 5150, y: 580, width: 140, height: 24, type: 'platform' },
                { x: 5350, y: 480, width: 160, height: 24, type: 'platform' },
                { x: 5550, y: 580, width: 140, height: 24, type: 'platform' },
                
                // ===== СЕКЦИЯ 6: Финиш (5600-6400) =====
                { x: 5700, y: 620, width: 100, height: 24, type: 'platform' },
                { x: 5850, y: 550, width: 100, height: 24, type: 'platform' },
                { x: 6000, y: 620, width: 100, height: 24, type: 'platform' },
                { x: 6100, y: 688, width: 300, height: 32, type: 'ground' },
            ],
            enemies: [
                // Секция 1
                { x: 350, y: 640, type: 'slime' },
                { x: 700, y: 640, type: 'goblin' },
                // Секция 2
                { x: 1600, y: 640, type: 'slime' },
                { x: 1850, y: 640, type: 'goblin' },
                { x: 2100, y: 640, type: 'slime' },
                // Секция 3
                { x: 2650, y: 640, type: 'slime' },
                { x: 3600, y: 640, type: 'goblin' },
                // Секция 5 (арена)
                { x: 5200, y: 640, type: 'slime' },
                { x: 5400, y: 640, type: 'goblin' },
                { x: 5550, y: 640, type: 'slime' },
            ],
            coins: [
                // Секция 1 - легко
                { x: 250, y: 550 }, { x: 450, y: 460 },
                { x: 700, y: 540 },
                // Секция 2
                { x: 1150, y: 560 }, { x: 1300, y: 480 },
                { x: 1650, y: 540 }, { x: 1850, y: 450 },
                { x: 2100, y: 540 }, { x: 2250, y: 460 },
                // Секция 3 - вершина (бонус)
                { x: 2900, y: 420 }, { x: 3050, y: 340 }, { x: 3200, y: 420 },
                // Секция 4
                { x: 3900, y: 560 }, { x: 4030, y: 490 },
                { x: 4150, y: 560 }, { x: 4280, y: 490 },
                { x: 4600, y: 540 }, { x: 4800, y: 460 },
                // Секция 5 (арена)
                { x: 5400, y: 440 },
                // Секция 6
                { x: 5750, y: 580 }, { x: 5900, y: 510 },
            ],
            playerStart: { x: 80, y: 620 },
            portal: { x: 6250, y: 620 }
        }
    },
    
    2: {
        name: 'Тёмный Лес',
        theme: 'FOREST',
        background: 0x2d5a27,
        music: 'forest_theme',
        enemies: ['slime', 'bat'],
        dialogue: STORY.LEVEL_1,
        killsRequired: 25,
        width: 8000,
        height: 720,
        map: {
            platforms: [
                // ===== СЕКЦИЯ 1: Вход в лес (0-1500) =====
                { x: 0, y: 688, width: 400, height: 32, type: 'ground' },
                { x: 200, y: 580, width: 100, height: 24, type: 'platform' },
                { x: 350, y: 500, width: 80, height: 24, type: 'platform' },
                { x: 480, y: 580, width: 100, height: 24, type: 'platform' },
                { x: 580, y: 688, width: 300, height: 32, type: 'ground' },
                { x: 700, y: 590, width: 120, height: 24, type: 'platform' },
                { x: 930, y: 688, width: 200, height: 32, type: 'ground' },
                { x: 1000, y: 580, width: 80, height: 24, type: 'platform' },
                { x: 1150, y: 500, width: 100, height: 24, type: 'platform' },
                { x: 1280, y: 580, width: 80, height: 24, type: 'platform' },
                { x: 1380, y: 688, width: 200, height: 32, type: 'ground' },
                
                // ===== СЕКЦИЯ 2: Ямы с летучими мышами (1500-3000) =====
                { x: 1630, y: 600, width: 80, height: 24, type: 'platform' },
                { x: 1760, y: 520, width: 80, height: 24, type: 'platform' },
                { x: 1890, y: 600, width: 80, height: 24, type: 'platform' },
                { x: 1970, y: 688, width: 250, height: 32, type: 'ground' },
                { x: 2100, y: 580, width: 100, height: 24, type: 'platform' },
                { x: 2270, y: 688, width: 200, height: 32, type: 'ground' },
                { x: 2350, y: 580, width: 100, height: 24, type: 'platform' },
                { x: 2500, y: 500, width: 80, height: 24, type: 'platform' },
                { x: 2630, y: 420, width: 100, height: 24, type: 'platform' },
                { x: 2780, y: 500, width: 80, height: 24, type: 'platform' },
                { x: 2900, y: 580, width: 100, height: 24, type: 'platform' },
                { x: 2980, y: 688, width: 200, height: 32, type: 'ground' },
                
                // ===== СЕКЦИЯ 3: Древние деревья - вертикаль (3000-4500) =====
                { x: 3230, y: 620, width: 80, height: 24, type: 'platform' },
                { x: 3360, y: 540, width: 80, height: 24, type: 'platform' },
                { x: 3490, y: 460, width: 100, height: 24, type: 'platform' },
                { x: 3640, y: 380, width: 120, height: 24, type: 'platform' },
                { x: 3810, y: 300, width: 140, height: 24, type: 'platform' },
                { x: 3980, y: 380, width: 100, height: 24, type: 'platform' },
                { x: 4130, y: 460, width: 80, height: 24, type: 'platform' },
                { x: 4260, y: 540, width: 80, height: 24, type: 'platform' },
                { x: 4380, y: 620, width: 100, height: 24, type: 'platform' },
                { x: 4480, y: 688, width: 200, height: 32, type: 'ground' },
                
                // ===== СЕКЦИЯ 4: Болото - узкие платформы (4500-6000) =====
                { x: 4730, y: 600, width: 85, height: 24, type: 'platform' },
                { x: 4840, y: 530, width: 85, height: 24, type: 'platform' },
                { x: 4950, y: 600, width: 85, height: 24, type: 'platform' },
                { x: 5060, y: 688, width: 150, height: 32, type: 'ground' },
                { x: 5260, y: 620, width: 85, height: 24, type: 'platform' },
                { x: 5370, y: 550, width: 85, height: 24, type: 'platform' },
                { x: 5480, y: 620, width: 85, height: 24, type: 'platform' },
                { x: 5560, y: 688, width: 150, height: 32, type: 'ground' },
                { x: 5760, y: 600, width: 80, height: 24, type: 'platform' },
                { x: 5890, y: 520, width: 80, height: 24, type: 'platform' },
                { x: 5990, y: 688, width: 200, height: 32, type: 'ground' },
                
                // ===== СЕКЦИЯ 5: Логово врагов (6000-7200) =====
                { x: 6240, y: 688, width: 500, height: 32, type: 'ground' },
                { x: 6300, y: 580, width: 120, height: 24, type: 'platform' },
                { x: 6480, y: 480, width: 140, height: 24, type: 'platform' },
                { x: 6660, y: 380, width: 120, height: 24, type: 'platform' },
                { x: 6780, y: 688, width: 300, height: 32, type: 'ground' },
                { x: 6850, y: 570, width: 140, height: 24, type: 'platform' },
                { x: 7050, y: 480, width: 120, height: 24, type: 'platform' },
                
                // ===== СЕКЦИЯ 6: Выход (7200-8000) =====
                { x: 7130, y: 688, width: 200, height: 32, type: 'ground' },
                { x: 7380, y: 600, width: 80, height: 24, type: 'platform' },
                { x: 7510, y: 520, width: 80, height: 24, type: 'platform' },
                { x: 7640, y: 600, width: 80, height: 24, type: 'platform' },
                { x: 7750, y: 688, width: 250, height: 32, type: 'ground' },
            ],
            enemies: [
                // Секция 1
                { x: 300, y: 640, type: 'slime' },
                { x: 800, y: 640, type: 'slime' },
                { x: 1200, y: 450, type: 'bat' },
                // Секция 2
                { x: 1810, y: 470, type: 'bat' },
                { x: 2050, y: 640, type: 'wolf' },
                { x: 2680, y: 370, type: 'bat' },
                // Секция 3
                { x: 3440, y: 410, type: 'bat' },
                { x: 3860, y: 250, type: 'bat' },
                { x: 4030, y: 330, type: 'bat' },
                // Секция 4
                { x: 5110, y: 640, type: 'wolf' },
                { x: 5610, y: 640, type: 'goblin' },
                { x: 5940, y: 470, type: 'bat' },
                // Секция 5 (логово)
                { x: 6400, y: 640, type: 'wolf' },
                { x: 6530, y: 430, type: 'bat' },
                { x: 6710, y: 330, type: 'bat' },
                { x: 6900, y: 640, type: 'goblin' },
                { x: 7000, y: 430, type: 'bat' },
            ],
            spikes: [
                { x: 420, y: 664, width: 60 },
                { x: 1580, y: 664, width: 80 },
                { x: 3180, y: 664, width: 60 },
                { x: 5210, y: 664, width: 50 },
                { x: 5710, y: 664, width: 50 },
            ],
            coins: [
                // Секция 1
                { x: 250, y: 540 }, { x: 400, y: 460 },
                { x: 750, y: 550 }, { x: 1050, y: 540 }, { x: 1200, y: 460 },
                // Секция 2
                { x: 1680, y: 560 }, { x: 1810, y: 480 },
                { x: 2150, y: 540 }, { x: 2400, y: 540 },
                { x: 2550, y: 460 }, { x: 2680, y: 380 }, { x: 2830, y: 460 },
                // Секция 3 (вершина - бонус)
                { x: 3540, y: 420 }, { x: 3690, y: 340 },
                { x: 3860, y: 260 }, { x: 4030, y: 340 }, { x: 4180, y: 420 },
                // Секция 4
                { x: 4780, y: 560 }, { x: 4890, y: 490 },
                { x: 5310, y: 580 }, { x: 5420, y: 510 },
                { x: 5810, y: 560 }, { x: 5940, y: 480 },
                // Секция 5
                { x: 6350, y: 540 }, { x: 6530, y: 440 }, { x: 6710, y: 340 },
                { x: 6900, y: 530 }, { x: 7100, y: 440 },
                // Секция 6
                { x: 7430, y: 560 }, { x: 7560, y: 480 },
            ],
            hearts: [
                { x: 2050, y: 540 },
                { x: 3860, y: 260 },
                { x: 6710, y: 340 },
            ],
            playerStart: { x: 80, y: 620 },
            portal: { x: 7850, y: 620 }
        }
    },
    
    3: {
        name: 'Пещеры',
        theme: 'CAVE',
        background: 0x1a1a2e,
        music: 'cave_theme',
        enemies: ['skeleton', 'bat'],
        dialogue: STORY.LEVEL_2,
        killsRequired: 30,
        width: 9600,
        height: 800,
        map: {
            platforms: [
                // ===== СЕКЦИЯ 1: Вход в пещеру (0-1600) =====
                { x: 0, y: 768, width: 350, height: 32, type: 'ground' },
                { x: 200, y: 670, width: 100, height: 24, type: 'platform' },
                { x: 350, y: 580, width: 80, height: 24, type: 'platform' },
                { x: 480, y: 670, width: 100, height: 24, type: 'platform' },
                { x: 550, y: 768, width: 250, height: 32, type: 'ground' },
                { x: 850, y: 680, width: 80, height: 24, type: 'platform' },
                { x: 980, y: 600, width: 80, height: 24, type: 'platform' },
                { x: 1100, y: 680, width: 100, height: 24, type: 'platform' },
                { x: 1200, y: 768, width: 200, height: 32, type: 'ground' },
                { x: 1450, y: 680, width: 80, height: 24, type: 'platform' },
                { x: 1550, y: 768, width: 150, height: 32, type: 'ground' },
                
                // ===== СЕКЦИЯ 2: Кристальная пещера (1600-3200) =====
                { x: 1750, y: 700, width: 80, height: 24, type: 'platform' },
                { x: 1880, y: 620, width: 80, height: 24, type: 'platform' },
                { x: 2010, y: 540, width: 100, height: 24, type: 'platform' },
                { x: 2160, y: 460, width: 120, height: 24, type: 'platform' },
                { x: 2330, y: 540, width: 80, height: 24, type: 'platform' },
                { x: 2450, y: 620, width: 80, height: 24, type: 'platform' },
                { x: 2550, y: 768, width: 200, height: 32, type: 'ground' },
                { x: 2800, y: 680, width: 80, height: 24, type: 'platform' },
                { x: 2930, y: 600, width: 80, height: 24, type: 'platform' },
                { x: 3050, y: 680, width: 100, height: 24, type: 'platform' },
                { x: 3150, y: 768, width: 150, height: 32, type: 'ground' },
                
                // ===== СЕКЦИЯ 3: Шипы и скелеты (3200-4800) =====
                { x: 3350, y: 700, width: 85, height: 24, type: 'platform' },
                { x: 3460, y: 620, width: 85, height: 24, type: 'platform' },
                { x: 3570, y: 700, width: 85, height: 24, type: 'platform' },
                { x: 3650, y: 768, width: 180, height: 32, type: 'ground' },
                { x: 3880, y: 700, width: 85, height: 24, type: 'platform' },
                { x: 3990, y: 620, width: 85, height: 24, type: 'platform' },
                { x: 4100, y: 700, width: 85, height: 24, type: 'platform' },
                { x: 4180, y: 768, width: 180, height: 32, type: 'ground' },
                { x: 4410, y: 680, width: 80, height: 24, type: 'platform' },
                { x: 4540, y: 600, width: 80, height: 24, type: 'platform' },
                { x: 4670, y: 680, width: 100, height: 24, type: 'platform' },
                { x: 4770, y: 768, width: 150, height: 32, type: 'ground' },
                
                // ===== СЕКЦИЯ 4: Глубины - вертикальный спуск (4800-6400) =====
                { x: 4970, y: 700, width: 80, height: 24, type: 'platform' },
                { x: 5100, y: 620, width: 80, height: 24, type: 'platform' },
                { x: 5230, y: 540, width: 100, height: 24, type: 'platform' },
                { x: 5380, y: 460, width: 100, height: 24, type: 'platform' },
                { x: 5530, y: 380, width: 120, height: 24, type: 'platform' },
                { x: 5700, y: 300, width: 140, height: 24, type: 'platform' },
                { x: 5890, y: 380, width: 100, height: 24, type: 'platform' },
                { x: 6040, y: 460, width: 80, height: 24, type: 'platform' },
                { x: 6170, y: 540, width: 80, height: 24, type: 'platform' },
                { x: 6300, y: 620, width: 100, height: 24, type: 'platform' },
                { x: 6400, y: 768, width: 200, height: 32, type: 'ground' },
                
                // ===== СЕКЦИЯ 5: Логово скелетов (6400-8000) =====
                { x: 6650, y: 768, width: 400, height: 32, type: 'ground' },
                { x: 6700, y: 660, width: 120, height: 24, type: 'platform' },
                { x: 6880, y: 560, width: 140, height: 24, type: 'platform' },
                { x: 7080, y: 460, width: 120, height: 24, type: 'platform' },
                { x: 7100, y: 768, width: 300, height: 32, type: 'ground' },
                { x: 7250, y: 650, width: 100, height: 24, type: 'platform' },
                { x: 7400, y: 768, width: 250, height: 32, type: 'ground' },
                { x: 7450, y: 650, width: 120, height: 24, type: 'platform' },
                { x: 7630, y: 550, width: 100, height: 24, type: 'platform' },
                { x: 7700, y: 768, width: 200, height: 32, type: 'ground' },
                { x: 7950, y: 680, width: 80, height: 24, type: 'platform' },
                
                // ===== СЕКЦИЯ 6: Выход на свет (8000-9600) =====
                { x: 7950, y: 768, width: 150, height: 32, type: 'ground' },
                { x: 8150, y: 700, width: 85, height: 24, type: 'platform' },
                { x: 8260, y: 620, width: 85, height: 24, type: 'platform' },
                { x: 8370, y: 700, width: 85, height: 24, type: 'platform' },
                { x: 8450, y: 768, width: 200, height: 32, type: 'ground' },
                { x: 8700, y: 680, width: 80, height: 24, type: 'platform' },
                { x: 8830, y: 600, width: 80, height: 24, type: 'platform' },
                { x: 8960, y: 680, width: 100, height: 24, type: 'platform' },
                { x: 9050, y: 768, width: 200, height: 32, type: 'ground' },
                { x: 9300, y: 700, width: 80, height: 24, type: 'platform' },
                { x: 9400, y: 768, width: 200, height: 32, type: 'ground' },
            ],
            spikes: [
                // Секция 1
                { x: 400, y: 744, width: 60 },
                { x: 800, y: 744, width: 50 },
                // Секция 2
                { x: 1700, y: 744, width: 50 },
                { x: 2750, y: 744, width: 50 },
                // Секция 3 (много шипов)
                { x: 3300, y: 744, width: 50 },
                { x: 3830, y: 744, width: 50 },
                { x: 4360, y: 744, width: 50 },
                // Секция 4
                { x: 4920, y: 744, width: 40 },
                // Секция 5
                { x: 6600, y: 744, width: 50 },
                { x: 7050, y: 744, width: 50 },
                { x: 7650, y: 744, width: 50 },
                // Секция 6
                { x: 8100, y: 744, width: 50 },
                { x: 8650, y: 744, width: 50 },
                { x: 9250, y: 744, width: 40 },
            ],
            enemies: [
                // Секция 1
                { x: 300, y: 720, type: 'skeleton' },
                { x: 1030, y: 550, type: 'ghost' },
                { x: 1350, y: 720, type: 'skeleton' },
                // Секция 2
                { x: 2060, y: 490, type: 'bat' },
                { x: 2210, y: 410, type: 'ghost' },
                { x: 2650, y: 720, type: 'skeleton' },
                { x: 2980, y: 550, type: 'bat' },
                // Секция 3
                { x: 3510, y: 570, type: 'bat' },
                { x: 3750, y: 720, type: 'goblin' },
                { x: 4040, y: 570, type: 'ghost' },
                { x: 4280, y: 720, type: 'skeleton' },
                { x: 4590, y: 550, type: 'bat' },
                // Секция 4
                { x: 5280, y: 490, type: 'bat' },
                { x: 5580, y: 330, type: 'ghost' },
                { x: 5750, y: 250, type: 'bat' },
                // Секция 5 (логово)
                { x: 6750, y: 720, type: 'skeleton' },
                { x: 6930, y: 510, type: 'ghost' },
                { x: 7130, y: 410, type: 'bat' },
                { x: 7200, y: 720, type: 'goblin' },
                { x: 7500, y: 720, type: 'skeleton' },
                { x: 7680, y: 500, type: 'ghost' },
                { x: 7800, y: 720, type: 'skeleton' },
                // Секция 6
                { x: 8310, y: 570, type: 'bat' },
                { x: 8550, y: 720, type: 'skeleton' },
                { x: 8880, y: 550, type: 'ghost' },
            ],
            coins: [
                // Секция 1
                { x: 250, y: 630 }, { x: 400, y: 540 },
                { x: 900, y: 640 }, { x: 1030, y: 560 },
                { x: 1500, y: 640 },
                // Секция 2
                { x: 1800, y: 660 }, { x: 1930, y: 580 },
                { x: 2060, y: 500 }, { x: 2210, y: 420 },
                { x: 2380, y: 500 }, { x: 2500, y: 580 },
                { x: 2850, y: 640 }, { x: 2980, y: 560 },
                // Секция 3
                { x: 3400, y: 660 }, { x: 3510, y: 580 },
                { x: 3930, y: 660 }, { x: 4040, y: 580 },
                { x: 4460, y: 640 }, { x: 4590, y: 560 },
                // Секция 4 (глубины - много бонусов)
                { x: 5020, y: 660 }, { x: 5150, y: 580 },
                { x: 5280, y: 500 }, { x: 5430, y: 420 },
                { x: 5580, y: 340 }, { x: 5750, y: 260 },
                { x: 5940, y: 340 }, { x: 6090, y: 420 },
                { x: 6220, y: 500 }, { x: 6350, y: 580 },
                // Секция 5
                { x: 6750, y: 620 }, { x: 6930, y: 520 }, { x: 7130, y: 420 },
                { x: 7300, y: 610 }, { x: 7500, y: 610 },
                { x: 7680, y: 510 },
                // Секция 6
                { x: 8200, y: 660 }, { x: 8310, y: 580 },
                { x: 8750, y: 640 }, { x: 8880, y: 560 },
                { x: 9350, y: 660 },
            ],
            hearts: [
                { x: 2210, y: 420 },
                { x: 5750, y: 260 },
                { x: 7130, y: 420 },
            ],
            playerStart: { x: 80, y: 700 },
            portal: { x: 9500, y: 700 }
        }
    },
    
    4: {
        name: 'Горы',
        theme: 'MOUNTAIN',
        background: 0x6b7280,
        music: 'mountain_theme',
        enemies: ['skeleton', 'golem'],
        dialogue: STORY.LEVEL_3,
        killsRequired: 25,
        width: 10400,
        height: 900,
        map: {
            platforms: [
                // ===== СЕКЦИЯ 1: Подножье (0-1600) =====
                { x: 0, y: 868, width: 400, height: 32, type: 'ground' },
                { x: 200, y: 770, width: 100, height: 24, type: 'platform' },
                { x: 350, y: 680, width: 80, height: 24, type: 'platform' },
                { x: 480, y: 770, width: 100, height: 24, type: 'platform' },
                { x: 550, y: 868, width: 300, height: 32, type: 'ground' },
                { x: 900, y: 790, width: 80, height: 24, type: 'platform' },
                { x: 1030, y: 710, width: 100, height: 24, type: 'platform' },
                { x: 1180, y: 790, width: 80, height: 24, type: 'platform' },
                { x: 1280, y: 868, width: 250, height: 32, type: 'ground' },
                
                // ===== СЕКЦИЯ 2: Первый подъём (1600-3200) =====
                { x: 1580, y: 800, width: 80, height: 24, type: 'platform' },
                { x: 1710, y: 720, width: 80, height: 24, type: 'platform' },
                { x: 1840, y: 640, width: 100, height: 24, type: 'platform' },
                { x: 1990, y: 560, width: 100, height: 24, type: 'platform' },
                { x: 2140, y: 480, width: 120, height: 24, type: 'platform' },
                { x: 2310, y: 560, width: 80, height: 24, type: 'platform' },
                { x: 2440, y: 640, width: 80, height: 24, type: 'platform' },
                { x: 2550, y: 720, width: 100, height: 24, type: 'platform' },
                { x: 2700, y: 800, width: 120, height: 24, type: 'platform' },
                { x: 2800, y: 868, width: 300, height: 32, type: 'ground' },
                
                // ===== СЕКЦИЯ 3: Плато с Големами (3200-4800) =====
                { x: 3150, y: 868, width: 500, height: 32, type: 'ground' },
                { x: 3200, y: 760, width: 140, height: 24, type: 'platform' },
                { x: 3400, y: 660, width: 160, height: 24, type: 'platform' },
                { x: 3620, y: 560, width: 140, height: 24, type: 'platform' },
                { x: 3700, y: 868, width: 300, height: 32, type: 'ground' },
                { x: 3850, y: 760, width: 120, height: 24, type: 'platform' },
                { x: 4050, y: 868, width: 250, height: 32, type: 'ground' },
                { x: 4100, y: 760, width: 100, height: 24, type: 'platform' },
                { x: 4280, y: 680, width: 100, height: 24, type: 'platform' },
                { x: 4430, y: 760, width: 100, height: 24, type: 'platform' },
                { x: 4500, y: 868, width: 300, height: 32, type: 'ground' },
                
                // ===== СЕКЦИЯ 4: Узкий хребет (4800-6400) =====
                { x: 4850, y: 800, width: 60, height: 24, type: 'platform' },
                { x: 4960, y: 720, width: 60, height: 24, type: 'platform' },
                { x: 5070, y: 640, width: 60, height: 24, type: 'platform' },
                { x: 5180, y: 560, width: 80, height: 24, type: 'platform' },
                { x: 5310, y: 480, width: 80, height: 24, type: 'platform' },
                { x: 5440, y: 400, width: 100, height: 24, type: 'platform' },
                { x: 5590, y: 320, width: 120, height: 24, type: 'platform' },
                { x: 5760, y: 400, width: 80, height: 24, type: 'platform' },
                { x: 5890, y: 480, width: 80, height: 24, type: 'platform' },
                { x: 6020, y: 560, width: 80, height: 24, type: 'platform' },
                { x: 6150, y: 640, width: 80, height: 24, type: 'platform' },
                { x: 6280, y: 720, width: 100, height: 24, type: 'platform' },
                { x: 6400, y: 868, width: 200, height: 32, type: 'ground' },
                
                // ===== СЕКЦИЯ 5: Вершина - арена (6400-8000) =====
                { x: 6650, y: 868, width: 600, height: 32, type: 'ground' },
                { x: 6700, y: 760, width: 120, height: 24, type: 'platform' },
                { x: 6880, y: 660, width: 140, height: 24, type: 'platform' },
                { x: 7080, y: 560, width: 160, height: 24, type: 'platform' },
                { x: 7300, y: 868, width: 400, height: 32, type: 'ground' },
                { x: 7350, y: 760, width: 100, height: 24, type: 'platform' },
                { x: 7520, y: 660, width: 120, height: 24, type: 'platform' },
                { x: 7750, y: 868, width: 300, height: 32, type: 'ground' },
                { x: 7800, y: 760, width: 100, height: 24, type: 'platform' },
                
                // ===== СЕКЦИЯ 6: Спуск к порталу (8000-10400) =====
                { x: 8100, y: 800, width: 80, height: 24, type: 'platform' },
                { x: 8230, y: 720, width: 80, height: 24, type: 'platform' },
                { x: 8360, y: 800, width: 80, height: 24, type: 'platform' },
                { x: 8450, y: 868, width: 200, height: 32, type: 'ground' },
                { x: 8700, y: 790, width: 80, height: 24, type: 'platform' },
                { x: 8830, y: 710, width: 80, height: 24, type: 'platform' },
                { x: 8960, y: 790, width: 100, height: 24, type: 'platform' },
                { x: 9050, y: 868, width: 200, height: 32, type: 'ground' },
                { x: 9300, y: 800, width: 60, height: 24, type: 'platform' },
                { x: 9410, y: 720, width: 60, height: 24, type: 'platform' },
                { x: 9520, y: 800, width: 60, height: 24, type: 'platform' },
                { x: 9600, y: 868, width: 200, height: 32, type: 'ground' },
                { x: 9850, y: 790, width: 80, height: 24, type: 'platform' },
                { x: 9980, y: 868, width: 100, height: 24, type: 'platform' },
                { x: 10100, y: 868, width: 300, height: 32, type: 'ground' },
            ],
            spikes: [
                { x: 450, y: 844, width: 50 },
                { x: 850, y: 844, width: 50 },
                { x: 1530, y: 844, width: 50 },
                { x: 3100, y: 844, width: 50 },
                { x: 4000, y: 844, width: 50 },
                { x: 4800, y: 844, width: 40 },
                { x: 6600, y: 844, width: 50 },
                { x: 7700, y: 844, width: 50 },
                { x: 8050, y: 844, width: 40 },
                { x: 9250, y: 844, width: 40 },
                { x: 9800, y: 844, width: 40 },
            ],
            enemies: [
                // Секция 1
                { x: 300, y: 820, type: 'wolf' },
                { x: 700, y: 820, type: 'skeleton' },
                { x: 1400, y: 820, type: 'wolf' },
                // Секция 2
                { x: 1890, y: 590, type: 'skeleton' },
                { x: 2190, y: 430, type: 'golem' },
                { x: 2900, y: 820, type: 'demon' },
                // Секция 3 (големы)
                { x: 3300, y: 820, type: 'golem' },
                { x: 3450, y: 610, type: 'demon' },
                { x: 3800, y: 820, type: 'golem' },
                { x: 4150, y: 820, type: 'wolf' },
                { x: 4330, y: 630, type: 'skeleton' },
                { x: 4600, y: 820, type: 'golem' },
                // Секция 4 (хребет)
                { x: 5230, y: 510, type: 'demon' },
                { x: 5490, y: 350, type: 'skeleton' },
                { x: 5640, y: 270, type: 'demon' },
                // Секция 5 (арена)
                { x: 6750, y: 820, type: 'golem' },
                { x: 6930, y: 610, type: 'demon' },
                { x: 7130, y: 510, type: 'golem' },
                { x: 7400, y: 820, type: 'wolf' },
                { x: 7570, y: 610, type: 'skeleton' },
                { x: 7850, y: 820, type: 'golem' },
                // Секция 6
                { x: 8550, y: 820, type: 'wolf' },
                { x: 8880, y: 660, type: 'demon' },
                { x: 9150, y: 820, type: 'skeleton' },
                { x: 9700, y: 820, type: 'golem' },
            ],
            coins: [
                // Секция 1
                { x: 250, y: 730 }, { x: 400, y: 640 },
                { x: 950, y: 750 }, { x: 1080, y: 670 },
                // Секция 2
                { x: 1630, y: 760 }, { x: 1760, y: 680 },
                { x: 1890, y: 600 }, { x: 2040, y: 520 },
                { x: 2190, y: 440 }, { x: 2360, y: 520 },
                { x: 2490, y: 600 }, { x: 2600, y: 680 },
                // Секция 3
                { x: 3250, y: 720 }, { x: 3450, y: 620 }, { x: 3670, y: 520 },
                { x: 3900, y: 720 }, { x: 4150, y: 720 }, { x: 4330, y: 640 },
                // Секция 4 (вершина - много бонусов)
                { x: 4900, y: 760 }, { x: 5010, y: 680 },
                { x: 5120, y: 600 }, { x: 5230, y: 520 },
                { x: 5360, y: 440 }, { x: 5490, y: 360 },
                { x: 5640, y: 280 }, { x: 5810, y: 360 },
                { x: 5940, y: 440 }, { x: 6070, y: 520 },
                { x: 6200, y: 600 }, { x: 6330, y: 680 },
                // Секция 5
                { x: 6750, y: 720 }, { x: 6930, y: 620 }, { x: 7130, y: 520 },
                { x: 7400, y: 720 }, { x: 7570, y: 620 },
                { x: 7850, y: 720 },
                // Секция 6
                { x: 8150, y: 760 }, { x: 8280, y: 680 },
                { x: 8750, y: 750 }, { x: 8880, y: 670 },
                { x: 9350, y: 760 }, { x: 9460, y: 680 },
                { x: 9900, y: 750 },
            ],
            hearts: [
                { x: 2190, y: 440 },
                { x: 5640, y: 280 },
                { x: 7130, y: 520 },
                { x: 9460, y: 680 },
            ],
            playerStart: { x: 80, y: 800 },
            portal: { x: 10250, y: 800 }
        }
    },
    
    5: {
        name: 'Замок Тьмы',
        theme: 'CASTLE',
        background: 0x1f1f3a,
        music: 'castle_theme',
        enemies: ['skeleton', 'golem'],
        dialogue: STORY.LEVEL_4,
        bossDialogue: STORY.BOSS,
        hasBoss: true,
        killsRequired: 0,
        width: 4000,
        height: 720,
        map: {
            platforms: [
                // ===== СЕКЦИЯ 1: Коридор замка (0-1200) =====
                { x: 0, y: 688, width: 300, height: 32, type: 'ground' },
                { x: 150, y: 580, width: 100, height: 24, type: 'platform' },
                { x: 300, y: 500, width: 80, height: 24, type: 'platform' },
                { x: 430, y: 580, width: 100, height: 24, type: 'platform' },
                { x: 500, y: 688, width: 250, height: 32, type: 'ground' },
                { x: 800, y: 600, width: 80, height: 24, type: 'platform' },
                { x: 930, y: 520, width: 80, height: 24, type: 'platform' },
                { x: 1050, y: 600, width: 100, height: 24, type: 'platform' },
                { x: 1150, y: 688, width: 150, height: 32, type: 'ground' },
                
                // ===== СЕКЦИЯ 2: Тронный зал - подъём (1200-2000) =====
                { x: 1350, y: 620, width: 80, height: 24, type: 'platform' },
                { x: 1480, y: 540, width: 80, height: 24, type: 'platform' },
                { x: 1610, y: 460, width: 100, height: 24, type: 'platform' },
                { x: 1760, y: 380, width: 120, height: 24, type: 'platform' },
                { x: 1930, y: 460, width: 80, height: 24, type: 'platform' },
                
                // ===== СЕКЦИЯ 3: БОСС-АРЕНА (2000-4000) =====
                { x: 2000, y: 688, width: 2000, height: 32, type: 'ground' },
                
                // Платформы для тактики
                { x: 2100, y: 580, width: 150, height: 24, type: 'platform' },
                { x: 2350, y: 480, width: 150, height: 24, type: 'platform' },
                { x: 2600, y: 380, width: 180, height: 24, type: 'platform' },
                { x: 2900, y: 480, width: 150, height: 24, type: 'platform' },
                { x: 3150, y: 580, width: 150, height: 24, type: 'platform' },
                
                { x: 3400, y: 480, width: 150, height: 24, type: 'platform' },
                { x: 3650, y: 380, width: 180, height: 24, type: 'platform' },
                { x: 3850, y: 480, width: 150, height: 24, type: 'platform' },
            ],
            spikes: [
                { x: 350, y: 664, width: 60 },
                { x: 750, y: 664, width: 50 },
                { x: 1300, y: 664, width: 50 },
            ],
            enemies: [
                // Коридор - стражники
                { x: 250, y: 640, type: 'skeleton' },
                { x: 600, y: 640, type: 'demon' },
                { x: 980, y: 470, type: 'ghost' },
                // Подъём
                { x: 1660, y: 410, type: 'skeleton' },
                { x: 1810, y: 330, type: 'golem' },
            ],
            coins: [
                // Коридор
                { x: 200, y: 540 }, { x: 350, y: 460 },
                { x: 850, y: 560 }, { x: 980, y: 480 },
                // Подъём
                { x: 1400, y: 580 }, { x: 1530, y: 500 },
                { x: 1660, y: 420 }, { x: 1810, y: 340 },
                // Арена (бонусы на платформах)
                { x: 2175, y: 540 }, { x: 2425, y: 440 },
                { x: 2690, y: 340 }, { x: 2975, y: 440 },
                { x: 3225, y: 540 }, { x: 3475, y: 440 },
                { x: 3740, y: 340 }, { x: 3925, y: 440 },
            ],
            hearts: [
                { x: 1810, y: 340 },
                { x: 2690, y: 340 },
                { x: 3740, y: 340 },
            ],
            boss: { x: 3200, y: 620 },
            playerStart: { x: 80, y: 620 },
            portal: { x: 2700, y: 620 }
        }
    }
};

const TOTAL_LEVELS = Object.keys(LEVELS).length;
