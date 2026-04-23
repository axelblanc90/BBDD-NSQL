import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Carousel } from 'react-responsive-carousel';

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHero();
  }, [id]);

  const fetchHero = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/superheroes/${id}`);
      setHero(response.data);
    } catch (error) {
      console.error('Error fetching hero details:', error);
      toast.error('Superhéroe no encontrado.');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`¿Estás seguro que deseas eliminar a ${hero.name}?`)) {
      try {
        await axios.delete(`http://localhost:5000/api/superheroes/${id}`);
        toast.success(`¡${hero.name} eliminado con éxito!`);
        navigate('/');
      } catch (error) {
        console.error('Error deleting hero:', error);
        toast.error('Error al eliminar el superhéroe.');
      }
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando...</div>;
  if (!hero) return null;

  return (
    <div className="animate-fade-in detail-container">
      <div className="detail-carousel">
        {hero.images && hero.images.length > 1 ? (
          <Carousel showThumbs={false} autoPlay infiniteLoop interval={3000}>
            {hero.images.map((img, index) => (
              <div key={index}>
                <img src={img} alt={`${hero.name} - ${index + 1}`} />
              </div>
            ))}
          </Carousel>
        ) : (
          <img 
            src={hero.images && hero.images.length > 0 ? hero.images[0] : 'https://placehold.co/400x500/1e1e1e/white?text=Sin+Imagen'} 
            alt={hero.name} 
            style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '12px' }}
          />
        )}
      </div>

      <div className="detail-info">
        <div className={`detail-house-logo logo-${hero.house.toLowerCase()}`}>
          {hero.house.toUpperCase()}
        </div>

        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{hero.name}</h1>
        <h3 style={{ color: 'var(--text-muted)' }}>{hero.character_name || 'Identidad Desconocida'}</h3>

        <div className="detail-meta">
          <div className="meta-item">
            <span>Universo</span>
            <strong>{hero.house}</strong>
          </div>
          <div className="meta-item">
            <span>Primera Aparición</span>
            <strong>{hero.year}</strong>
          </div>
          <div className="meta-item" style={{ gridColumn: 'span 2' }}>
            <span>Equipamiento / Poderes</span>
            <strong>{hero.equipment || 'Ninguno especificado'}</strong>
          </div>
        </div>

        <div className="detail-bio" style={{ marginTop: '1rem', flex: 1 }}>
          <p>{hero.biography}</p>
        </div>

        <div className="detail-actions">
          <button className="btn btn-primary" onClick={() => navigate(`/edit/${hero._id}`)}>
            Editar Superhéroe
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Detail;
