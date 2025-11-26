import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyService } from '../services/spotify.service';
import { CommonModule, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-album-detail',
  standalone: false,
  templateUrl: './album-detail.html',
  styleUrl: './album-detail.css'
})
export class AlbumDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private spotifyService = inject(SpotifyService);

  albumId: string = '';
  album: any = null;
  tracks: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  isPlaying: boolean = false;
  currentTrack: any = null;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.albumId = params['id'];
      if (this.albumId) {
        this.loadAlbumData();
      }
    });
  }

  async loadAlbumData(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      console.log('💿 Cargando datos del álbum:', this.albumId);
      
      // Cargar información del álbum
      this.album = await this.spotifyService.getAlbum(this.albumId);
      
      // Cargar tracks del álbum
      this.tracks = await this.spotifyService.getAlbumTracks(this.albumId);
      
      console.log('✅ Datos del álbum cargados:', {
        album: this.album,
        tracks: this.tracks
      });
      
    } catch (error) {
      console.error('❌ Error cargando datos del álbum:', error);
      this.errorMessage = 'Error al cargar la información del álbum';
    } finally {
      this.isLoading = false;
    }
  }

  // Navegar al perfil del artista
  goToArtist(artistId: string): void {
    this.router.navigate(['/artist', artistId]);
  }

  // Reproducir track específico
  playTrack(track: any, index: number): void {
    console.log('🎵 Reproduciendo:', track.name);
    this.currentTrack = track;
    this.isPlaying = true;
    // Aquí integrarías con tu servicio de música
  }

  // Reproducir todo el álbum
  playAlbum(): void {
    if (this.tracks.length > 0) {
      this.playTrack(this.tracks[0], 0);
    }
  }

  // Pausar/reanudar reproducción
  togglePlayPause(): void {
    this.isPlaying = !this.isPlaying;
    console.log(this.isPlaying ? '▶️ Reanudando' : '⏸️ Pausando');
  }

  // Agregar a favoritos
  toggleLike(): void {
    console.log('❤️ Toggle like album:', this.album?.name);
    // Implementar lógica de favoritos
  }

  // Verificar si es la canción actual
  isCurrentTrack(track: any): boolean {
    return this.currentTrack?.id === track.id;
  }

  // Formatear duración
  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ':' + (parseInt(seconds) < 10 ? '0' : '') + seconds;
  }

  // Calcular duración total del álbum
  getTotalDuration(): string {
    if (!this.tracks || this.tracks.length === 0) return '0:00';
    
    const totalMs = this.tracks.reduce((total, track) => total + (track.duration_ms || 0), 0);
    const minutes = Math.floor(totalMs / 60000);
    const seconds = Math.floor((totalMs % 60000) / 1000);
    
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} h ${remainingMinutes} min`;
    }
    
    return `${minutes} min ${seconds} seg`;
  }

  // Formatear fecha de lanzamiento
  formatReleaseDate(dateString: string): string {
    if (!dateString) return 'Fecha no disponible';
    
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return date.toLocaleDateString('es-ES', options);
  }

  // Obtener año de lanzamiento
  getReleaseYear(dateString: string): string {
    return dateString ? dateString.substring(0, 4) : 'N/A';
  }
}