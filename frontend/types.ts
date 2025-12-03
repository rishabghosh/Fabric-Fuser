export interface LogoConfig {
  horizontal: number;
  vertical: number;
  scale: number;
  rotation: number;
  opacity: number;
  blendMode: 'normal' | 'multiply' | 'overlay' | 'screen' | 'soft-light';
  fold_shadow_intensity: number;
}

export const DEFAULT_CONFIG: LogoConfig = {
  horizontal: 0.5, // Center (0-1 range)
  vertical: 0.5, // Center (0-1 range)
  scale: 0.3,
  rotation: 0,
  opacity: 0.9,
  blendMode: 'multiply', // Multiply usually looks best for dark ink on light clothes, or overlay for integration
  fold_shadow_intensity: 0.5,
};
