'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Check, Tag, ArrowLeft } from 'lucide-react';

const parseArtworks = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const artworks = [];
  
  // First check if we have the dashboard wrapper (indicates authenticated state)
  const dashboardWrapper = doc.querySelector('.Dashboard_DashboardWrapper__Fcs2I');
  if (!dashboardWrapper) {
    throw new Error('Not authenticated or dashboard not found');
  }

  const cards = dashboardWrapper.querySelectorAll('article[data-test="previewCard"]');
  
  cards.forEach(card => {
    const title = card.querySelector('.ver-text-lg .ver-truncate')?.textContent;
    const artist = card.querySelector('.ver-font-bold')?.textContent;
    const year = card.querySelector('.ver-inline.ver-flex-shrink-0')?.textContent;
    const imageUrl = card.querySelector('.ver-min-h-64 img')?.src;
    
    if (title || artist) {
      artworks.push({
        id: `${title || 'untitled'}-${Date.now()}`.toLowerCase().replace(/[^\w-]/g, '-'),
        title: title || 'Untitled',
        artist: artist || 'Unknown Artist',
        year: year?.replace(',', '').trim() || '',
        imageUrl: imageUrl || '',
        status: 'Unverified'
      });
    }
  });

  return artworks;
};

const VerisartDashboard = () => {
  const [artworks, setArtworks] = useState([]);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [verisartUrl, setVerisartUrl] = useState(null);
  const [nfcStatus, setNfcStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthAndLoadArtworks = () => {
      try {
        // Get the Verisart app content from the parent page
        const verisartContent = document.querySelector('#verisart-app');
        if (!verisartContent) {
          setError('Please log in to view your artworks');
          setIsLoading(false);
          return;
        }

        const artworks = parseArtworks(verisartContent.outerHTML);
        setArtworks(artworks);
        setIsAuthenticated(true);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    // Check authentication immediately
    checkAuthAndLoadArtworks();

    // Set up a periodic check for dashboard updates
    const interval = setInterval(checkAuthAndLoadArtworks, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleArtworkSelect = async (artwork) => {
    setSelectedArtwork(artwork);
    setView('authentication');
    setIsLoading(true);

    try {
      // Find the artwork's Verisart URL from the parent page
      const artworkElement = document.querySelector(`[data-test="previewCard"][title="${artwork.title}"]`);
      if (!artworkElement) throw new Error('Artwork not found');

      const verisartLink = artworkElement.querySelector('a[href^="https://verisart.com/works/"]');
      if (!verisartLink) throw new Error('Verisart URL not found');

      setVerisartUrl(verisartLink.href);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of your component code remains the same...
  // (NFC handling and render functions)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            {view === 'authentication' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setView('dashboard')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <CardTitle>
              {view === 'dashboard' ? 'Artwork Dashboard' : 'NFC Authentication'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {!isAuthenticated ? (
            <Alert variant="destructive">
              <AlertDescription>
                Please log in to your Verisart account to view your artworks
              </AlertDescription>
            </Alert>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : view === 'dashboard' ? (
            artworks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artworks.map(artwork => (
                  <Card key={artwork.id} className="overflow-hidden">
                    <img 
                      src={artwork.imageUrl} 
                      alt={artwork.title}
                      className="w-full h-64 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-medium">{artwork.title}</h3>
                      <p className="text-sm text-gray-500">{artwork.artist}, {artwork.year}</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className={artwork.status === 'Verified' ? 'text-green-600' : 'text-orange-600'}>
                          {artwork.status}
                        </span>
                        <Button 
                          onClick={() => handleArtworkSelect(artwork)}
                          disabled={artwork.status === 'Verified'}
                        >
                          <Tag className="w-4 h-4 mr-2" />
                          Authenticate
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500">
                No artworks found
              </div>
            )
          ) : (
            // Authentication view remains the same...
            <div className="space-y-6">
              {selectedArtwork && verisartUrl && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{selectedArtwork.title}</h3>
                      <p className="text-sm text-gray-500">
                        {selectedArtwork.artist}, {selectedArtwork.year}
                      </p>
                    </div>
                    {nfcStatus !== 'success' && (
                      <Button
                        onClick={handleNFCScan}
                        disabled={nfcStatus === 'scanning' || nfcStatus === 'encoding'}
                      >
                        {nfcStatus === 'scanning' || nfcStatus === 'encoding' ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Tag className="w-4 h-4 mr-2" />
                        )}
                        Pair NFC Tag
                      </Button>
                    )}
                  </div>
                  
                  {nfcStatus === 'success' && (
                    <Alert className="bg-green-50">
                      <Check className="w-4 h-4" />
                      <AlertDescription>
                        NFC tag successfully paired with certificate
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerisartDashboard;
