import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyService } from '../services/spotify.service';
import { CommonModule, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-artist-profile',
  standalone: false,
  templateUrl: './artist-profile.html',
  styleUrl: './artist-profile.css'
})
export class ArtistProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private spotifyService = inject(SpotifyService);

  artistId: string = '';
  artist: any = null;
  topTracks: any[] = [];
  albums: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.artistId = params['id'];
      if (this.artistId) {
        this.loadArtistData();
      }
    });
  }

  async loadArtistData(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      console.log('🎤 Cargando datos del artista:', this.artistId);
      
      // Cargar información del artista
      this.artist = await this.spotifyService.getArtist(this.artistId);
      
      // Cargar las canciones más populares
      this.topTracks = await this.spotifyService.getArtistTopTracks(this.artistId);
      
      // Cargar álbumes del artista
      this.albums = await this.spotifyService.getArtistAlbums(this.artistId);
      
      console.log('✅ Datos del artista cargados:', {
        artist: this.artist,
        topTracks: this.topTracks,
        albums: this.albums
      });
      
    } catch (error) {
      console.error('❌ Error cargando datos del artista:', error);
      this.errorMessage = 'Error al cargar la información del artista';
    } finally {
      this.isLoading = false;
    }
  }

  // Navegar al álbum cuando se hace click en una canción
  goToAlbum(albumId: string): void {
    this.router.navigate(['/album', albumId]);
  }

  // Navegar al álbum desde la lista de álbumes
  goToAlbumFromList(album: any): void {
    this.router.navigate(['/album', album.id]);
  }

  // Reproducir canción
  playTrack(track: any): void {
    console.log('🎵 Reproduciendo:', track.name);
    // Aquí integrarías con tu servicio de música
  }

  // Formatear duración de la canción
  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ':' + (parseInt(seconds) < 10 ? '0' : '') + seconds;
  }

  // Formatear número de seguidores
  formatFollowers(followers: number): string {
    if (followers >= 1000000) {
      return (followers / 1000000).toFixed(1) + 'M';
    } else if (followers >= 1000) {
      return (followers / 1000).toFixed(1) + 'K';
    }
    return followers.toString();
  }
}