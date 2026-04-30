import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from '../components/toastManager';

// Componente para la vista de detalle de un superhéroe específico
const Detail = () => {
  const { id } = useParams(); // Obtenemos el ID de la URL
  const navigate = useNavigate();
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImgIndex, setCurrentImgIndex] = useState(0); // Estado para controlar el carrusel de imágenes

  // Efecto para obtener los detalles del héroe al montar el componente
  useEffect(() => {
    const fetchHero = async () => {
      try {
        const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await fetch(`${url}/superheroes/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setHero(data);
      } catch (err) {
        toast.error("Héroe no encontrado");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchHero();
  }, [id, navigate]);

  if (loading) return <div style={{textAlign:'center', marginTop:'3rem'}}>Cargando...</div>;
  if (!hero) return null;

  const isMarvel = hero.house?.toLowerCase() === 'marvel';
  const logoUrl = isMarvel 
    ? 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Marvel_Logo.svg'
    : 'https://upload.wikimedia.org/wikipedia/commons/3/3d/DC_Comics_logo.svg';

  const images = hero.images?.length > 0 ? hero.images : ['https://via.placeholder.com/600x800?text=No+Image'];

  return (
    <div>
      <Link to="/" className="btn" style={{background: 'rgba(255,255,255,0.1)', color: 'white', marginBottom: '2rem', display: 'inline-block'}}>
        &larr; Volver
      </Link>
      
      <div className="detail-container">
        <div className="detail-carousel">
          {images.map((img, idx) => (
            <img 
              key={idx} 
              src={img} 
              alt={`${hero.name} - ${idx}`} 
              className={`carousel-img ${idx === currentImgIndex ? 'active' : ''}`}
            />
          ))}
          {images.length > 1 && (
            <div className="carousel-controls">
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`carousel-dot ${idx === currentImgIndex ? 'active' : ''}`}
                  onClick={() => setCurrentImgIndex(idx)}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="detail-info">
          <img src={logoUrl} alt={hero.house} className="house-logo" />
          
          <h1 style={{fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: 900}}>{hero.name}</h1>
          
          <div className="detail-row">
            <span className="detail-label">Nombre Real</span>
            <span className="detail-value">{hero.real_name || 'Desconocido'}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Primera Aparición</span>
            <span className="detail-value">{hero.year}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Casa</span>
            <span className="detail-value">{hero.house}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Equipamiento</span>
            <span className="detail-value">{hero.equipment || 'Ninguno'}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Imágenes</span>
            <span className="detail-value">{images.length} disponible(s)</span>
          </div>
          
          <div className="detail-row" style={{border: 'none', flexDirection: 'column'}}>
            <span className="detail-label" style={{marginBottom: '0.5rem'}}>Biografía</span>
            <span className="detail-value" style={{lineHeight: 1.6}}>{hero.bio}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;
