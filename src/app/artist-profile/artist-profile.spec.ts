import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { ArtistProfileComponent } from './artist-profile';
import { SpotifyService } from '../services/spotify.service';

describe('ArtistProfileComponent', () => {
  let component: ArtistProfileComponent;
  let fixture: ComponentFixture<ArtistProfileComponent>;
  let mockSpotifyService: jasmine.SpyObj<SpotifyService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    const spotifyServiceSpy = jasmine.createSpyObj('SpotifyService', [
      'getArtist',
      'getArtistTopTracks',
      'getArtistAlbums'
    ]);
    
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    mockActivatedRoute = {
      params: of({ id: 'test-artist-id' })
    };

    await TestBed.configureTestingModule({
      declarations: [ArtistProfileComponent],
      providers: [
        { provide: SpotifyService, useValue: spotifyServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArtistProfileComponent);
    component = fixture.componentInstance;
    mockSpotifyService = TestBed.inject(SpotifyService) as jasmine.SpyObj<SpotifyService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load artist data on init', () => {
    const mockArtist = { id: 'test-artist-id', name: 'Test Artist' };
    const mockTopTracks = [{ id: '1', name: 'Track 1' }];
    const mockAlbums = [{ id: 'album1', name: 'Album 1' }];

    mockSpotifyService.getArtist.and.returnValue(Promise.resolve(mockArtist));
    mockSpotifyService.getArtistTopTracks.and.returnValue(Promise.resolve(mockTopTracks));
    mockSpotifyService.getArtistAlbums.and.returnValue(Promise.resolve(mockAlbums));

    component.ngOnInit();

    expect(component.artistId).toBe('test-artist-id');
  });

  it('should navigate to album when goToAlbum is called', () => {
    component.goToAlbum('album-id');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/album', 'album-id']);
  });

  it('should format duration correctly', () => {
    expect(component.formatDuration(210000)).toBe('3:30');
    expect(component.formatDuration(65000)).toBe('1:05');
  });

  it('should format followers correctly', () => {
    expect(component.formatFollowers(1500000)).toBe('1.5M');
    expect(component.formatFollowers(5000)).toBe('5.0K');
    expect(component.formatFollowers(500)).toBe('500');
  });
});