import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MusicPlayerService } from '../services/music-player.service';
import { SpotifyService } from '../services/spotify.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private musicService = inject(MusicPlayerService);
  private spotifyService = inject(SpotifyService);
  private router = inject(Router);

  // Álbumes populares organizados por categorías
  featuredAlbums: any[] = [];
  newReleases: any[] = [];
  popularAlbums: any[] = [];
  isLoading = true;

  ngOnInit(): void {
    console.log('🏠 Home component inicializado');
    this.loadAlbums();
  }

  async loadAlbums(): Promise<void> {
    try {
      // Búsquedas de álbumes populares por géneros
      const [popTracks, rockTracks, electronicTracks, latinTracks] = await Promise.all([
        this.spotifyService.searchTracks('genre:pop'),
        this.spotifyService.searchTracks('genre:rock'),
        this.spotifyService.searchTracks('genre:electronic'),
        this.spotifyService.searchTracks('genre:latin')
      ]);

      // Extraer álbumes únicos de los resultados
      const allTracks = [
        ...(popTracks || []),
        ...(rockTracks || []),
        ...(electronicTracks || []),
        ...(latinTracks || [])
      ];

      // Crear un mapa de álbumes únicos
      const albumsMap = new Map();
      allTracks.forEach((track: any) => {
        if (track.album && !albumsMap.has(track.album.id)) {
          albumsMap.set(track.album.id, {
            id: track.album.id,
            name: track.album.name,
            artist: track.artists?.[0]?.name || 'Artista Desconocido',
            artistId: track.artists?.[0]?.id,
            image: track.album.images?.[0]?.url || track.album.images?.[1]?.url,
            releaseDate: track.album.release_date,
            totalTracks: track.album.total_tracks,
            albumType: track.album.album_type
          });
        }
      });

      const albums = Array.from(albumsMap.values()).filter(album => album.image);

      // Distribuir álbumes en diferentes categorías
      this.featuredAlbums = albums.slice(0, 6);
      this.newReleases = albums.slice(6, 12);
      this.popularAlbums = albums.slice(12, 18);

      this.isLoading = false;
      console.log('📀 Álbumes cargados:', { featured: this.featuredAlbums.length, new: this.newReleases.length, popular: this.popularAlbums.length });

    } catch (error) {
      console.error('Error cargando álbumes:', error);
      this.isLoading = false;
      
      // Álbumes de respaldo en caso de error
      this.loadFallbackAlbums();
    }
  }

  private loadFallbackAlbums(): void {
    // Álbumes de ejemplo con imágenes de placeholder
    const fallbackAlbums = [
      {
        id: '1',
        name: 'Midnight Dreams',
        artist: 'Luna Sky',
        image: 'https://picsum.photos/300/300?random=1',
        releaseDate: '2024',
        totalTracks: 12
      },
      {
        id: '2',
        name: 'Electric Waves',
        artist: 'Neon Pulse',
        image: 'https://picsum.photos/300/300?random=2',
        releaseDate: '2024',
        totalTracks: 10
      },
      {
        id: '3',
        name: 'Urban Legends',
        artist: 'City Beats',
        image: 'https://picsum.photos/300/300?random=3',
        releaseDate: '2024',
        totalTracks: 14
      },
      {
        id: '4',
        name: 'Acoustic Sessions',
        artist: 'Mountain Echo',
        image: 'https://picsum.photos/300/300?random=4',
        releaseDate: '2024',
        totalTracks: 8
      },
      {
        id: '5',
        name: 'Digital Paradise',
        artist: 'Cyber Dream',
        image: 'https://picsum.photos/300/300?random=5',
        releaseDate: '2024',
        totalTracks: 11
      },
      {
        id: '6',
        name: 'Retro Vibes',
        artist: 'Time Machine',
        image: 'https://picsum.photos/300/300?random=6',
        releaseDate: '2024',
        totalTracks: 9
      }
    ];

    this.featuredAlbums = fallbackAlbums.slice(0, 3);
    this.newReleases = fallbackAlbums.slice(3, 6);
    this.popularAlbums = fallbackAlbums;
  }

  playAlbum(album: any): void {
    console.log('🎵 Reproduciendo álbum:', album.name);
    // Aquí podrías implementar la reproducción del álbum completo
  }

  // Navegar al álbum
  goToAlbum(album: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (album.id) {
      console.log('💿 Navegando al álbum:', album.name);
      this.router.navigate(['/album', album.id]);
    }
  }

  // Navegar al artista (necesitaremos el artistId)
  goToArtist(artistId: string, artistName: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (artistId) {
      console.log('🎤 Navegando al artista:', artistName);
      this.router.navigate(['/artist', artistId]);
    }
  }

  // Método para hacer click en la tarjeta del álbum
  onAlbumCardClick(album: any): void {
    // Por defecto, navegar al álbum
    this.goToAlbum(album);
  }
}