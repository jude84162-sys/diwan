export interface SceneConfig {
  cameraPosition: [number, number, number]
  fov: number
  ambientIntensity: number
  mainLightIntensity: number
  particleCount: number
}

export const HERO_SCENE_CONFIG: SceneConfig = {
  cameraPosition: [0, 0.5, 6],
  fov: 40,
  ambientIntensity: 0.5,
  mainLightIntensity: 1.2,
  particleCount: 500,
}

export const PERFORMANCE_BUDGETS = {
  low:    { particleCount: 200,  shadows: false, antialias: false },
  medium: { particleCount: 500,  shadows: true,  antialias: true  },
  high:   { particleCount: 1000, shadows: true,  antialias: true  },
} as const
