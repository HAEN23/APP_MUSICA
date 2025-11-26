// src/app/services/spotify.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({providedIn: 'root'})
export class SpotifyService {
  private clientId = '9944d71af81a4b06a0722ac659d82858';
  private clientSecret = '498b8a8723794bf5aefe693197effd66';
  
  // URLs de redirección (deben estar registradas en Spotify Dashboard)
  private redirectUri = 'https://www.google.com';

  constructor(private http: HttpClient) {}
  
  async getAccessToken(): Promise<string> {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
      },
      body: 'grant_type=client_credentials'
    });
    
    const data = await response.json();
    return data.access_token;
  }

  
  loginUser(): void {
    console.log('=== INICIANDO LOGIN SPOTIFY ===');
    
    const scopes = [
      'streaming',
      'user-read-email',
      'user-read-private',
      'user-read-playback-state',
      'user-modify-playback-state',
      'playlist-read-private',
      'playlist-read-collaborative'
    ].join(' ');
    
    const authUrl = `https://accounts.spotify.com/authorize?` +
      `response_type=code&` +
      `client_id=${this.clientId}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
      `show_dialog=true`;
    
    console.log('Client ID:', this.clientId);
    console.log('Redirect URI:', this.redirectUri);
    console.log('URL completa:', authUrl);
    
    // Verificar que window existe
    if (typeof window !== 'undefined') {
      console.log('✅ Redirigiendo a Spotify...');
      window.location.href = authUrl;
    } else {
      console.error('❌ Window no está disponible');
    }
  }

  // Método para intercambiar código por token de acceso completo
  async getTokenFromCode(code: string): Promise<any> {
    console.log('🔄 Intercambiando código por token...');
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
      },
      body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(this.redirectUri)}`
    });
    
    const data = await response.json();
    console.log('🎫 Token response:', data);
    
    if (data.access_token) {
      // Guardar token en localStorage para uso posterior
      localStorage.setItem('spotify_access_token', data.access_token);
      localStorage.setItem('spotify_refresh_token', data.refresh_token || '');
      console.log('✅ Token guardado exitosamente');
    }
    
    return data;
  }

  // Método para detectar código en URL automáticamente
  checkForSpotifyCode(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      console.log('🎫 Código de Spotify detectado automáticamente:', code.substring(0, 20) + '...');
      this.getTokenFromCode(code).then(tokenData => {
        console.log('✅ Token automático obtenido:', tokenData);
        // Limpiar URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }).catch(error => {
        console.error('❌ Error con código automático:', error);
      });
    }
  }

  // Método para obtener token guardado o crear uno nuevo
  async getValidAccessToken(): Promise<string> {
    // Verificar si hay código en la URL primero
    this.checkForSpotifyCode();
    
    // Intentar usar token guardado
    const savedToken = localStorage.getItem('spotify_access_token');
    if (savedToken) {
      console.log('🎫 Usando token guardado');
      return savedToken;
    }
    
    // Si no hay token guardado, usar client credentials
    console.log('🎫 Obteniendo nuevo token client credentials');
    return await this.getAccessToken();
  }

  async searchTracks(query: string): Promise<any> {
    try {
      const token = await this.getValidAccessToken();
      
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.tracks?.items || [];
    } catch (error) {
      console.error('❌ Error buscando tracks:', error);
      throw error;
    }
  }

  async getUserPlaylists(): Promise<any> {
    try {
      const token = await this.getValidAccessToken();
      
      const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('❌ Error obteniendo playlists:', error);
      throw error;
    }
  }

  // ========================
  // MÉTODOS PARA ARTISTAS
  // ========================

  async getArtist(artistId: string): Promise<any> {
    try {
      const token = await this.getValidAccessToken();
      
      const response = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('🎤 Datos del artista obtenidos:', data);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo artista:', error);
      throw error;
    }
  }

  async getArtistTopTracks(artistId: string, market: string = 'ES'): Promise<any[]> {
    try {
      const token = await this.getValidAccessToken();
      
      const response = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=${market}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('🎵 Top tracks obtenidos:', data.tracks?.length || 0);
      return data.tracks || [];
    } catch (error) {
      console.error('❌ Error obteniendo top tracks:', error);
      throw error;
    }
  }

  async getArtistAlbums(artistId: string, limit: number = 20): Promise<any[]> {
    try {
      const token = await this.getValidAccessToken();
      
      const response = await fetch(
        `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&market=ES&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('💿 Álbumes obtenidos:', data.items?.length || 0);
      return data.items || [];
    } catch (error) {
      console.error('❌ Error obteniendo álbumes del artista:', error);
      throw error;
    }
  }

  // ========================
  // MÉTODOS PARA ÁLBUMES
  // ========================

  async getAlbum(albumId: string): Promise<any> {
    try {
      const token = await this.getValidAccessToken();
      
      const response = await fetch(
        `https://api.spotify.com/v1/albums/${albumId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('💿 Datos del álbum obtenidos:', data);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo álbum:', error);
      throw error;
    }
  }

  async getAlbumTracks(albumId: string, limit: number = 50): Promise<any[]> {
    try {
      const token = await this.getValidAccessToken();
      
      const response = await fetch(
        `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('🎵 Tracks del álbum obtenidos:', data.items?.length || 0);
      return data.items || [];
    } catch (error) {
      console.error('❌ Error obteniendo tracks del álbum:', error);
      throw error;
    }
  }

  // ========================
  // MÉTODOS AUXILIARES
  // ========================

  async searchAll(query: string): Promise<any> {
    try {
      const token = await this.getValidAccessToken();
      
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track,album,artist&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        tracks: data.tracks?.items || [],
        albums: data.albums?.items || [],
        artists: data.artists?.items || []
      };
    } catch (error) {
      console.error('❌ Error en búsqueda completa:', error);
      throw error;
    }
  }
}