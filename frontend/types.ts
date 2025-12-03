export interface LogoConfig {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
  blendMode: 'normal' | 'multiply' | 'overlay' | 'screen' | 'soft-light';
  displacementStrength: number;
}

export const DEFAULT_CONFIG: LogoConfig = {
  x: 0.5, // Center (0-1 range)
  y: 0.5, // Center (0-1 range)
  scale: 0.3,
  rotation: 0,
  opacity: 0.9,
  blendMode: 'multiply', // Multiply usually looks best for dark ink on light clothes, or overlay for integration
  displacementStrength: 0.5,
};
