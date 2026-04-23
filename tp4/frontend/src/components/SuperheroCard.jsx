import React from 'react';
import { Link } from 'react-router-dom';

const SuperheroCard = ({ hero }) => {
  // Use the first image for the card avatar, or placeholder if none
  const imageUrl = hero.images && hero.images.length > 0 
    ? hero.images[0] 
    : 'https://placehold.co/400x500/1e1e1e/white?text=Sin+Imagen';

  // Truncate bio to ~100 chars
  const bioExcerpt = hero.biography.length > 100 
    ? hero.biography.substring(0, 100) + '...' 
    : hero.biography;

  const cardClass = `hero-card ${hero.house.toLowerCase()}-card`;

  return (
    <div className={cardClass}>
      <img src={imageUrl} alt={hero.name} className="card-img" />
      <div className="card-content">
        <h3 className="card-title">{hero.name}</h3>
        <p className="card-subtitle">{hero.character_name || 'Identidad Desconocida'}</p>
        <p className="card-bio">{bioExcerpt}</p>
        <Link to={`/superhero/${hero._id}`} className="btn btn-primary">
          Más detalles
        </Link>
      </div>
    </div>
  );
};

export default SuperheroCard;
