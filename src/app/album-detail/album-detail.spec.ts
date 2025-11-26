import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { AlbumDetailComponent } from './album-detail';
import { SpotifyService } from '../services/spotify.service';

describe('AlbumDetailComponent', () => {
  let component: AlbumDetailComponent;
  let fixture: ComponentFixture<AlbumDetailComponent>;
  let mockSpotifyService: jasmine.SpyObj<SpotifyService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    const spotifyServiceSpy = jasmine.createSpyObj('SpotifyService', [
      'getAlbum',
      'getAlbumTracks'
    ]);
    
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    mockActivatedRoute = {
      params: of({ id: 'test-album-id' })
    };

    await TestBed.configureTestingModule({
      declarations: [AlbumDetailComponent],
      providers: [
        { provide: SpotifyService, useValue: spotifyServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AlbumDetailComponent);
    component = fixture.componentInstance;
    mockSpotifyService = TestBed.inject(SpotifyService) as jasmine.SpyObj<SpotifyService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load album data on init', () => {
    const mockAlbum = { id: 'test-album-id', name: 'Test Album' };
    const mockTracks = [{ id: '1', name: 'Track 1', duration_ms: 210000 }];

    mockSpotifyService.getAlbum.and.returnValue(Promise.resolve(mockAlbum));
    mockSpotifyService.getAlbumTracks.and.returnValue(Promise.resolve(mockTracks));

    component.ngOnInit();

    expect(component.albumId).toBe('test-album-id');
  });

  it('should navigate to artist when goToArtist is called', () => {
    component.goToArtist('artist-id');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/artist', 'artist-id']);
  });

  it('should format duration correctly', () => {
    expect(component.formatDuration(210000)).toBe('3:30');
    expect(component.formatDuration(65000)).toBe('1:05');
  });

  it('should calculate total duration correctly', () => {
    component.tracks = [
      { duration_ms: 210000 }, // 3:30
      { duration_ms: 180000 }, // 3:00
      { duration_ms: 240000 }  // 4:00
    ];
    
    expect(component.getTotalDuration()).toBe('10 min 30 seg');
  });

  it('should format release date correctly', () => {
    expect(component.getReleaseYear('2023-05-15')).toBe('2023');
    expect(component.getReleaseYear('')).toBe('N/A');
  });

  it('should identify current track correctly', () => {
    const track = { id: 'track1', name: 'Test Track' };
    component.currentTrack = track;
    
    expect(component.isCurrentTrack(track)).toBe(true);
    expect(component.isCurrentTrack({ id: 'track2', name: 'Other Track' })).toBe(false);
  });
});