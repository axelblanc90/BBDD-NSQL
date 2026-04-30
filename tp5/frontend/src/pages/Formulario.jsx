import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '../components/toastManager';

// Componente de Formulario utilizado tanto para crear como para editar superhéroes
const Formulario = () => {
  const { id } = useParams(); // Si hay ID en la URL, significa que estamos editando
  const navigate = useNavigate();
  const isEditing = !!id; // Booleano para saber si es edición

  // Estado inicial del formulario
  const [formData, setFormData] = useState({
    name: '',
    real_name: '',
    year: '',
    house: 'Marvel',
    equipment: '',
    bio: '',
    images: ['']
  });

  useEffect(() => {
    if (isEditing) {
      const fetchHero = async () => {
        try {
          const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          const res = await fetch(`${url}/superheroes/${id}`);
          if (res.ok) {
            const data = await res.json();
            setFormData({
              ...data,
              images: data.images?.length > 0 ? data.images : ['']
            });
          }
        } catch (err) {
          toast.error("Error al cargar datos del héroe");
        }
      };
      fetchHero();
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (index) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, images: newImages }));
    }
  };

  // Función que maneja el envío del formulario al backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Filtramos URLs vacías para asegurar que haya imágenes válidas
    const cleanedImages = formData.images.filter(url => url.trim() !== '');
    if (cleanedImages.length === 0) {
      toast.error("Debe proporcionar al menos una URL de imagen válida");
      return;
    }

    // Preparamos los datos asegurándonos de que el año sea un número entero
    const payload = {
      ...formData,
      year: parseInt(formData.year, 10) || new Date().getFullYear(),
      images: cleanedImages
    };

    try {
      const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const method = isEditing ? 'PUT' : 'POST';
      const endpoint = isEditing ? `${url}/superheroes/${id}` : `${url}/superheroes`;

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        if (payload.house === 'Marvel') {
          toast.marvel(`${payload.name} ${isEditing ? 'actualizado' : 'creado'} con éxito!`);
        } else {
          toast.dc(`${payload.name} ${isEditing ? 'actualizado' : 'creado'} con éxito!`);
        }
        navigate('/');
      } else {
        toast.error("Error al guardar el superhéroe");
      }
    } catch (err) {
      toast.error("Error de conexión");
    }
  };

  return (
    <div className="form-container">
      <h1 className="page-title" style={{fontSize:'2rem'}}>{isEditing ? 'Editar Superhéroe' : 'Nuevo Superhéroe'}</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Nombre del Superhéroe *</label>
          <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
        </div>
        
        <div className="form-group">
          <label className="form-label">Nombre Real</label>
          <input type="text" name="real_name" className="form-control" value={formData.real_name} onChange={handleChange} />
        </div>
        
        <div className="form-group" style={{display:'flex', gap:'1rem'}}>
          <div style={{flex:1}}>
            <label className="form-label">Año de Aparición *</label>
            <input type="number" name="year" className="form-control" value={formData.year} onChange={handleChange} required />
          </div>
          <div style={{flex:1}}>
            <label className="form-label">Casa *</label>
            <select name="house" className="form-control" value={formData.house} onChange={handleChange} required>
              <option value="Marvel">Marvel</option>
              <option value="DC">DC</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Equipamiento</label>
          <input type="text" name="equipment" className="form-control" value={formData.equipment} onChange={handleChange} />
        </div>
        
        <div className="form-group">
          <label className="form-label">Biografía *</label>
          <textarea name="bio" className="form-control" rows="4" value={formData.bio} onChange={handleChange} required></textarea>
        </div>
        
        <div className="form-group">
          <label className="form-label">Imágenes (URLs) *</label>
          <div className="images-list">
            {formData.images.map((img, index) => (
              <div key={index} className="image-input-row">
                <input 
                  type="url" 
                  className="form-control" 
                  value={img} 
                  onChange={(e) => handleImageChange(index, e.target.value)} 
                  placeholder="https://ejemplo.com/imagen.jpg"
                  required={index === 0}
                />
                {formData.images.length > 1 && (
                  <button type="button" className="btn btn-icon delete" onClick={() => removeImageField(index)}>✕</button>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="btn" style={{background:'rgba(255,255,255,0.1)', color:'white', marginTop:'0.5rem'}} onClick={addImageField}>
            + Agregar otra imagen
          </button>
        </div>
        
        <div style={{display:'flex', justifyContent:'flex-end', gap:'1rem', marginTop:'2rem'}}>
          <button type="button" className="btn" style={{background:'transparent', border:'1px solid var(--glass-border)', color:'white'}} onClick={() => navigate(-1)}>
            Cancelar
          </button>
          <button type="submit" className={`btn ${formData.house === 'Marvel' ? 'btn-marvel' : 'btn-primary'}`}>
            {isEditing ? 'Actualizar' : 'Crear'} Héroe
          </button>
        </div>
      </form>
    </div>
  );
};

export default Formulario;
