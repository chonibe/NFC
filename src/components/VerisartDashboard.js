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

  // Locate the container
  const container = doc.querySelector('.Dashboard_DashboardWrapper__Fcs2I');
  if (!container) {
    console.error('Container not found');
    return artworks;
  }

  // Locate all cards
  const cards = container.querySelectorAll('article[data-test="previewCard"]');
  console.log('Cards found:', cards.length);

  if (!cards.length) {
    console.error('No cards found');
    return artworks;
  }

  // Parse each card
  cards.forEach((card, index) => {
    try {
      console.log(`Processing card ${index + 1}:`, card.outerHTML); // Debugging log

      const title = card.querySelector('h2.ver-text-base.ver-font-bold')?.textContent.trim() || 'Untitled';
      const artist = card.querySelector('.ver-text-lg .ver-truncate')?.textContent.trim() || 'Unknown Artist';
      const year = card.querySelector('.ver-inline.ver-flex-shrink-0')?.textContent.trim()?.replace(',', '') || '';
      const imageUrl = card.querySelector('.ver-min-h-64 img')?.src || '';

      artworks.push({
        id: `${title}-${Date.now()}-${index}`.toLowerCase().replace(/[^\w-]/g, '-'),
        title,
        artist,
        year,
        imageUrl,
        status: 'Unverified',
      });
    } catch (err) {
      console.error(`Error parsing card ${index + 1}:`, err);
    }
  });

  console.log('Total cards parsed:', cards.length);
  console.log('Parsed artworks:', artworks);

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

useEffect(() => {
  const fetchDashboard = async () => {
    try {
      setIsLoading(true); // Ensure loading state is set when the fetch starts
      const response = await fetch('/api/verisart');
      const html = await response.text();
     const parsedArtworks = parseArtworks(html);

      if (parsedArtworks.length > 0) {
        setArtworks(parsedArtworks);
      } else {
        setError('No artworks found');
      }
    } catch (error) {
      setError('Error loading artworks: ' + error.message);
    } finally {
      setIsLoading(false); // Ensure loading state is cleared after fetch
    }
  };

  fetchDashboard();
}, []);
  // Rest of the component code remains the same...
  
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
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : view === 'dashboard' && artworks.length > 0 ? (
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
          ) : view === 'authentication' ? (
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
          ) : (
            <div className="text-center p-8 text-gray-500">No artworks found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerisartDashboard;
