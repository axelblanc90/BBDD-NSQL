import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    character_name: '',
    year: '',
    house: 'Marvel',
    biography: '',
    equipment: '',
    images: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchHero();
    }
  }, [id]);

  const fetchHero = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/superheroes/${id}`);
      const hero = response.data;
      setFormData({
        ...hero,
        images: hero.images ? hero.images.join(', ') : ''
      });
    } catch (error) {
      console.error('Error fetching hero:', error);
      toast.error('Error al cargar datos del superhéroe.');
      navigate('/');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Parse images
    const imagesArray = formData.images
      .split(',')
      .map(url => url.trim())
      .filter(url => url !== '');

    if (imagesArray.length === 0) {
      toast.error('Debes proporcionar al menos la URL de una imagen.');
      return;
    }

    const payload = {
      ...formData,
      year: parseInt(formData.year, 10),
      images: imagesArray
    };

    try {
      setLoading(true);
      if (isEdit) {
        await axios.put(`http://localhost:5000/api/superheroes/${id}`, payload);
        toast.success('¡Superhéroe actualizado con éxito!');
        navigate(`/superhero/${id}`);
      } else {
        const response = await axios.post('http://localhost:5000/api/superheroes', payload);
        toast.success('¡Superhéroe creado con éxito!');
        navigate(`/superhero/${response.data._id}`);
      }
    } catch (error) {
      console.error('Error saving hero:', error);
      toast.error('Error al guardar el superhéroe. Verifique los datos ingresados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in form-container">
      <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>
        {isEdit ? 'Editar Superhéroe' : 'Agregar Nuevo Superhéroe'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre del Superhéroe</label>
          <input 
            type="text" 
            name="name" 
            className="form-control" 
            value={formData.name} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Nombre del Personaje (Nombre Real)</label>
          <input 
            type="text" 
            name="character_name" 
            className="form-control" 
            value={formData.character_name} 
            onChange={handleChange} 
          />
        </div>

        <div className="form-group">
          <label>Casa / Universo</label>
          <select 
            name="house" 
            className="form-control" 
            value={formData.house} 
            onChange={handleChange}
            required
            style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
          >
            <option value="Marvel">Marvel</option>
            <option value="DC">DC</option>
          </select>
        </div>

        <div className="form-group">
          <label>Año de Aparición</label>
          <input 
            type="number" 
            name="year" 
            className="form-control" 
            value={formData.year} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Equipamiento / Poderes</label>
          <input 
            type="text" 
            name="equipment" 
            className="form-control" 
            value={formData.equipment} 
            onChange={handleChange} 
          />
        </div>

        <div className="form-group">
          <label>URLs de las Imágenes (separadas por comas)</label>
          <input 
            type="text" 
            name="images" 
            className="form-control" 
            value={formData.images} 
            onChange={handleChange} 
            placeholder="http://ejemplo.com/img1.jpg, http://ejemplo.com/img2.jpg"
            required 
          />
        </div>

        <div className="form-group">
          <label>Biografía</label>
          <textarea 
            name="biography" 
            className="form-control" 
            value={formData.biography} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div style={{ marginTop: '2rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : isEdit ? 'Actualizar Superhéroe' : 'Agregar Superhéroe'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEdit;
