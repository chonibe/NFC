'use client';  // Add this as the first line

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Check, Tag, ArrowLeft } from 'lucide-react';

// This function parses the HTML from the Verisart dashboard and extracts artwork information
// It uses the specific class names we found in the Verisart HTML structure
const parseArtworks = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const artworks = [];
  
  doc.querySelectorAll('article[data-test="previewCard"]').forEach(article => {
    const title = article.querySelector('.ver-truncate')?.textContent;
    const artist = article.querySelector('h2.ver-text-base.ver-font-bold')?.textContent;
    const year = article.querySelector('.ver-inline.ver-flex-shrink-0')?.textContent;
    const imageUrl = article.querySelector('img')?.src;
    
    if (title && artist) {
      artworks.push({
        id: `${title}-${year}`.replace(/[\s,]+/g, '-').toLowerCase(),
        title,
        artist,
        year: year?.replace(',', '').trim() || '',
        imageUrl,
        status: 'Unverified'
      });
    }
  });
  
  return artworks;
};
const VerisartDashboard = () => {
  // State management for our application
  const [artworks, setArtworks] = useState([]);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [verisartUrl, setVerisartUrl] = useState(null);
  const [nfcStatus, setNfcStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('dashboard');

  // Fetch dashboard data when component mounts
 useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/verisart');
      const html = await response.text();
      const parsedArtworks = parseArtworks(html);
      setArtworks(parsedArtworks);
    } catch (error) {
      setError('Error loading artworks: ' + error.message);
    } finally {
      setIsLoading(false);  // Make sure this runs
    }
  };

  fetchDashboard();
}, []);

  // Handle artwork selection and fetch its Verisart details
  const handleArtworkSelect = async (artwork) => {
    setSelectedArtwork(artwork);
    setView('authentication');
    setIsLoading(true);
    setError(null);

    try {
      // Use our proxy API route for fetching artwork details
      const response = await fetch(`/api/verisart/works/${artwork.id}`);
      if (!response.ok) throw new Error('Failed to fetch artwork details');
      
      const html = await response.text();
      
      // Parse the HTML to find the Verisart URL
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const verisartLink = doc.querySelector('div.ver-mt-12 a[href^="https://verisart.com/works/"]');
      
      if (verisartLink) {
        setVerisartUrl(verisartLink.getAttribute('href'));
      } else {
        throw new Error('Verisart URL not found');
      }
    } catch (error) {
      setError('Error loading artwork details: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle NFC scanning initialization
  const handleNFCScan = async () => {
    if (!verisartUrl) {
      setError('No Verisart URL available for NFC encoding');
      return;
    }

    setNfcStatus('scanning');
    setError(null);
    
    if (!('NDEFReader' in window)) {
      setError('NFC is not supported on this device. Please use an Android device with Chrome browser.');
      setNfcStatus('idle');
      return;
    }

    try {
      const ndef = new window.NDEFReader();
      await ndef.scan();
      
      ndef.addEventListener('reading', ({ serialNumber }) => {
        handleNFCEncoding(serialNumber);
      });
    } catch (error) {
      setError('Error scanning NFC: ' + error.message);
      setNfcStatus('error');
    }
  };

  // Handle NFC tag encoding
  const handleNFCEncoding = async (serialNumber) => {
    setNfcStatus('encoding');
    setError(null);
    
    try {
      const ndef = new window.NDEFReader();
      
      // Prepare the URL record for the NFC tag
      const record = {
        recordType: "url",
        data: verisartUrl
      };

      // Write the URL to the NFC tag
      await ndef.write({ records: [record] });
      
      // Update artwork status in our state
      setArtworks(prev => 
        prev.map(art => 
          art.id === selectedArtwork.id 
            ? { ...art, status: 'Verified' }
            : art
        )
      );
      
      setNfcStatus('success');
    } catch (error) {
      setError('Error writing to NFC tag: ' + error.message);
      setNfcStatus('error');
    }
  };

  // Render the UI based on current view and state
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
          ) : view === 'dashboard' ? (
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
