export interface Player {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    bullets: Bullet[];
    lives: number;
}

export interface Camera {
    x: number;
    y: number;
}

export interface Monster {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    dx: number;
    dy: number;
    points: number;
    designIndex: number;
}

export interface Boss {
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    dx: number;
    dy: number;
    health: number;
    maxHealth: number;
    spawnTimer: number;
    active: boolean;
}

export interface Bullet {
    x: number;
    y: number;
    dx: number;
    dy: number;
}

export interface GameState {
    [x: string]: any;
    player: Player;
    camera: Camera;
    monsters: Monster[];
    boss: Boss | null;
    score: number;
    keys: { [key: string]: boolean };
    isGameOver: boolean;
}

export const MAP_WIDTH = 6000;
export const MAP_HEIGHT = 6000;