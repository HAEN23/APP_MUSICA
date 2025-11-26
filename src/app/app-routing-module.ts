import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './home/home';
import { SearchView } from './search-view/search-view';
import { PlaylistView } from './playlist-view/playlist-view';
import { ArtistProfileComponent } from './artist-profile/artist-profile';
import { AlbumDetailComponent } from './album-detail/album-detail';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'search', component: SearchView },
  { path: 'playlist', component: PlaylistView },
  { path: 'artist/:id', component: ArtistProfileComponent },
  { path: 'album/:id', component: AlbumDetailComponent },
  { path: '**', redirectTo: '/home' } // Ruta comodín para páginas no encontradas
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
