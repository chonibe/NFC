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
