'use client';

import { useState, useEffect, useRef, Component, ErrorInfo, ReactNode } from 'react';
import Map, { NavigationControl, FullscreenControl, GeolocateControl, MapRef } from 'react-map-gl/mapbox';
import mapboxgl from 'mapbox-gl';
import { MAP_CONFIG } from '@/lib/constants/map-config';
import { Save, Key, Info, MonitorX, RefreshCw } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface BaseMapProps {
  children?: React.ReactNode;
  onViewportChange?: (viewport: any) => void;
  interactive?: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class MapErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Mapbox GL WebGL Error caught by boundary:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return false;

    if (typeof mapboxgl !== 'undefined' && typeof mapboxgl.supported === 'function') {
      return mapboxgl.supported();
    }
    return true;
  } catch (e) {
    return false;
  }
}

function WebGLFallbackUI() {
  return (
    <div className="h-full w-full min-h-[500px] flex items-center justify-center bg-card/40 border border-border/50 rounded-2xl p-8 relative overflow-hidden backdrop-blur-md">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-600/5 via-transparent to-transparent pointer-events-none" />
      <div className="max-w-md w-full space-y-6 text-center animate-fade-in relative z-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <MonitorX className="h-8 w-8 text-amber-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-foreground">Aceleração WebGL Indisponível</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Não foi possível inicializar a renderização de mapas vetoriais 3D (WebGL). O seu navegador ou sistema operacional pode estar com a aceleração gráfica por hardware desativada.
          </p>
        </div>

        <div className="bg-muted/20 border border-border p-4 rounded-xl text-left space-y-2 text-xs">
          <span className="font-semibold text-foreground block">Como reativar o WebGL:</span>
          <ul className="list-disc list-inside space-y-1.5 text-muted-foreground text-[11px]">
            <li>
              <strong className="text-foreground">Google Chrome / Brave / Edge:</strong> Vá em <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono">chrome://settings/system</code> e ative a opção <em>&quot;Usar aceleração de hardware quando disponível&quot;</em>.
            </li>
            <li>
              <strong className="text-foreground">Mozilla Firefox:</strong> Acesse <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono">about:config</code>, busque por <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono">webgl.disabled</code> e certifique-se de que está definido como <code className="bg-muted px-1 py-0.5 rounded text-foreground font-mono">false</code>.
            </li>
            <li>
              Verifique se os drivers da sua GPU estão instalados e atualizados.
            </li>
          </ul>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-500 py-2.5 text-xs font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/30"
        >
          <RefreshCw className="h-4 w-4" />
          Tentar Novamente
        </button>
      </div>
    </div>
  );
}

export function BaseMap({ children, interactive = true }: BaseMapProps) {
  const mapRef = useRef<MapRef>(null);
  
  // Estado para token Mapbox (busca do env ou localStorage)
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenInput, setTokenInput] = useState<string>('');
  const [hasTokenError, setHasTokenError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);

  useEffect(() => {
    setIsMounted(true);

    // Verifica se o WebGL é suportado no navegador
    const webGLOK = checkWebGLSupport();
    if (!webGLOK) {
      setIsWebGLSupported(false);
    }

    // Recupera token do env ou do localStorage do navegador
    const envToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const savedToken = localStorage.getItem('edurio_mapbox_token');
    
    if (savedToken) {
      setMapboxToken(savedToken);
    } else if (envToken && !envToken.includes('seu-mapbox-token-aqui') && envToken.trim() !== '') {
      setMapboxToken(envToken);
    } else {
      setHasTokenError(true);
    }
  }, []);

  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim() !== '') {
      localStorage.setItem('edurio_mapbox_token', tokenInput.trim());
      setMapboxToken(tokenInput.trim());
      setHasTokenError(false);
      window.location.reload(); // Recarrega para iniciar o mapa com o novo token
    }
  };

  const handleClearToken = () => {
    localStorage.removeItem('edurio_mapbox_token');
    setMapboxToken('');
    setHasTokenError(true);
  };

  if (!isMounted) {
    return <div className="h-full w-full animate-pulse bg-muted/10 rounded-2xl" />;
  }

  // Fallback se WebGL não for suportado no navegador
  if (!isWebGLSupported) {
    return <WebGLFallbackUI />;
  }

  // Se não temos token configurado, renderiza o fallback explicativo com opção de inserção dinâmica
  if (hasTokenError || !mapboxToken) {
    return (
      <div className="h-full w-full min-h-[500px] flex items-center justify-center bg-card/40 border border-border/50 rounded-2xl p-8 relative overflow-hidden backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-md w-full space-y-6 text-center animate-fade-in relative z-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10">
            <Key className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-foreground">Token do Mapbox Requerido</h3>
            <p className="text-sm text-muted-foreground">
              A visualização cartográfica utiliza Mapbox GL. Adicione um token temporário abaixo ou configure o arquivo <strong>.env.local</strong> do projeto.
            </p>
          </div>

          <form onSubmit={handleSaveToken} className="glass-card p-5 rounded-2xl border border-border space-y-4">
            <div className="text-left space-y-1.5">
              <label htmlFor="token-input" className="text-xs font-semibold text-foreground">
                Token Público (pk.xxx)
              </label>
              <input
                id="token-input"
                type="password"
                placeholder="Insira seu token público Mapbox..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-input py-2 px-3 text-xs text-foreground placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30"
            >
              <Save className="h-4 w-4" />
              Salvar Token Localmente
            </button>
          </form>

          <div className="flex gap-3 justify-center items-start text-left bg-muted/20 border border-border p-4 rounded-xl text-xs text-muted-foreground">
            <Info className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
            <p>
              Você pode obter um token gratuito criando uma conta em <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">mapbox.com</a>. O plano grátis suporta até 50.000 carregamentos de mapa por mês.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border">
      <MapErrorBoundary fallback={<WebGLFallbackUI />} onError={() => setIsWebGLSupported(false)}>
        <Map
          ref={mapRef}
          mapboxAccessToken={mapboxToken}
          initialViewState={MAP_CONFIG.defaultViewport}
          maxZoom={MAP_CONFIG.maxZoom}
          minZoom={MAP_CONFIG.minZoom}
          maxBounds={MAP_CONFIG.bounds}
          mapStyle={MAP_CONFIG.styles.dark}
          style={{ width: '100%', height: '100%' }}
          dragRotate={false}
          touchZoomRotate={interactive}
          interactive={interactive}
        >
          {/* Camadas do Mapa */}
          {children}

          {/* Controles do mapa */}
          {interactive && (
            <>
              <div className="absolute right-4 top-4 z-10">
                <NavigationControl showCompass={false} position="top-right" />
              </div>
              <div className="absolute right-4 top-24 z-10">
                <GeolocateControl position="top-right" trackUserLocation={false} />
              </div>
              <div className="absolute right-4 top-36 z-10">
                <FullscreenControl position="top-right" />
              </div>
            </>
          )}
        </Map>
      </MapErrorBoundary>

      {/* Botão flutuante para redefinir token */}
      <button
        onClick={handleClearToken}
        className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 rounded-lg border border-border bg-card/85 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold text-muted-foreground transition-all hover:bg-card hover:text-foreground"
      >
        <Key className="h-3 w-3" />
        Trocar Token Mapbox
      </button>
    </div>
  );
}

