import { useState } from 'react';
import { ImageOff, Eye, EyeOff, ZoomIn } from 'lucide-react';
import type { SensitiveArea } from '@/types';
import { cn } from '@/lib/utils';

interface ImageMarkerProps {
  src: string;
  alt?: string;
  sensitiveAreas?: SensitiveArea[];
  showMarkers?: boolean;
  showConfidence?: boolean;
  maxHeight?: string;
  className?: string;
  onImageClick?: () => void;
  onMarkerClick?: (area: SensitiveArea) => void;
}

const areaColorMap: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  default: {
    border: 'border-danger-500',
    bg: 'bg-danger-500/20',
    text: 'text-danger-700',
    badge: 'bg-danger-500',
  },
  adult: {
    border: 'border-purple-500',
    bg: 'bg-purple-500/20',
    text: 'text-purple-700',
    badge: 'bg-purple-500',
  },
  violence: {
    border: 'border-danger-600',
    bg: 'bg-danger-600/20',
    text: 'text-danger-800',
    badge: 'bg-danger-600',
  },
  logo: {
    border: 'border-warning-500',
    bg: 'bg-warning-500/20',
    text: 'text-warning-700',
    badge: 'bg-warning-500',
  },
  text: {
    border: 'border-info-500',
    bg: 'bg-info-500/20',
    text: 'text-info-700',
    badge: 'bg-info-500',
  },
  face: {
    border: 'border-info-600',
    bg: 'bg-info-600/20',
    text: 'text-info-800',
    badge: 'bg-info-600',
  },
};

function getAreaColors(type: string) {
  return areaColorMap[type] || areaColorMap.default;
}

function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

export function ImageMarker({
  src,
  alt = '商品图片',
  sensitiveAreas = [],
  showMarkers: initialShowMarkers = true,
  showConfidence = true,
  maxHeight = '320px',
  className,
  onImageClick,
  onMarkerClick,
}: ImageMarkerProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [showMarkers, setShowMarkers] = useState(initialShowMarkers);
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);

  const hasSensitiveAreas = sensitiveAreas && sensitiveAreas.length > 0;

  const handleImageLoad = () => {
    setLoaded(true);
    setError(false);
  };

  const handleImageError = () => {
    setLoaded(true);
    setError(true);
  };

  return (
    <div
      className={cn(
        'relative group rounded-lg overflow-hidden bg-primary-50 border border-primary-100',
        className,
      )}
      style={{ maxHeight }}
    >
      {error ? (
        <div
          className="flex flex-col items-center justify-center gap-2 bg-primary-50"
          style={{ minHeight: '200px' }}
        >
          <ImageOff size={32} className="text-primary-400" />
          <span className="text-sm text-primary-500">图片加载失败</span>
        </div>
      ) : (
        <div className="relative w-full" style={{ maxHeight }}>
          {!loaded && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-primary-50 z-10"
              style={{ minHeight: '200px' }}
            >
              <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            </div>
          )}

          <img
            src={src}
            alt={alt}
            onLoad={handleImageLoad}
            onError={handleImageError}
            onClick={onImageClick}
            className={cn(
              'w-full h-auto object-contain transition-opacity duration-300',
              onImageClick && 'cursor-pointer hover:opacity-90',
              loaded ? 'opacity-100' : 'opacity-0',
            )}
            style={{ maxHeight }}
            draggable={false}
          />

          {loaded && hasSensitiveAreas && showMarkers && (
            <div className="absolute inset-0 w-full h-full pointer-events-none">
              {sensitiveAreas.map((area) => {
                const colors = getAreaColors(area.type);
                const isHovered = hoveredArea === area.id;

                return (
                  <div
                    key={area.id}
                    className={cn(
                      'absolute border-2 rounded transition-all duration-200',
                      'pointer-events-auto cursor-pointer',
                      colors.border,
                      isHovered ? cn(colors.bg, 'shadow-lg scale-[1.02]') : 'bg-transparent',
                    )}
                    style={{
                      left: `${area.x}%`,
                      top: `${area.y}%`,
                      width: `${area.width}%`,
                      height: `${area.height}%`,
                    }}
                    onMouseEnter={() => setHoveredArea(area.id)}
                    onMouseLeave={() => setHoveredArea(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkerClick?.(area);
                    }}
                  >
                    <div
                      className={cn(
                        'absolute -top-1 left-0 -translate-y-full',
                        'flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-semibold text-white whitespace-nowrap shadow',
                        'transition-all duration-200',
                        colors.badge,
                        isHovered ? 'opacity-100' : 'opacity-75',
                      )}
                    >
                      <span>{area.type}</span>
                      {showConfidence && (
                        <span className="opacity-90 font-medium">
                          {formatConfidence(area.confidence)}
                        </span>
                      )}
                    </div>

                    {isHovered && (
                      <>
                        <span className={cn('absolute w-2 h-2 rounded-full -top-1 -left-1', colors.badge)} />
                        <span className={cn('absolute w-2 h-2 rounded-full -top-1 -right-1', colors.badge)} />
                        <span className={cn('absolute w-2 h-2 rounded-full -bottom-1 -left-1', colors.badge)} />
                        <span className={cn('absolute w-2 h-2 rounded-full -bottom-1 -right-1', colors.badge)} />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            {hasSensitiveAreas && (
              <button
                type="button"
                onClick={() => setShowMarkers(!showMarkers)}
                className={cn(
                  'p-1.5 rounded-md text-white text-xs font-medium',
                  'backdrop-blur-sm transition-all',
                  showMarkers
                    ? 'bg-primary-900/70 hover:bg-primary-900/80'
                    : 'bg-primary-500/60 hover:bg-primary-500/70',
                )}
                title={showMarkers ? '隐藏标注' : '显示标注'}
              >
                {showMarkers ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            )}

            {onImageClick && (
              <button
                type="button"
                onClick={onImageClick}
                className="p-1.5 rounded-md bg-primary-900/70 text-white backdrop-blur-sm hover:bg-primary-900/80 transition-all"
                title="查看大图"
              >
                <ZoomIn size={14} />
              </button>
            )}
          </div>

          {hasSensitiveAreas && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md bg-danger-500/90 text-white text-xs font-semibold backdrop-blur-sm">
                {sensitiveAreas.length} 处敏感区域
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
