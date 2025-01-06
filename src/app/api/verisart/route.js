const parseArtworks = (html) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const artworks = [];
  
  doc.querySelectorAll('article[data-test="previewCard"]').forEach(article => {
    const title = article.querySelector('.ver-flex-row p.ver-truncate')?.textContent;
    const artist = article.querySelector('h2.ver-text-base.ver-font-bold')?.textContent;
    const year = article.querySelector('p.ver-inline')?.textContent;
    const imageUrl = article.querySelector('.ver-min-h-64 img')?.src;
    
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
  
  console.log('Parsed HTML:', html.substring(0, 200));
  console.log('Found artworks:', artworks);
  
  return artworks;
};
