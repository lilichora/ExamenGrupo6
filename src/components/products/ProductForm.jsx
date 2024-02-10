import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import jsPDF from 'jspdf';

const ProductForm = ({ supabase }) => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState(0);
  const [stock, setStock] = useState(0);

  useEffect(() => {
    // Leer productos al cargar el componente
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('Producto').select('*');

        if (error) {
          throw error;
        }

        setProducts(data); // Guardar la lista de productos
      } catch (error) {
        console.error('Error fetching products:', error.message);
      }
    };

    fetchProducts();
  }, [supabase]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nombre.trim() || !descripcion.trim() || isNaN(precio) || isNaN(stock)) {
      return;
    }

    try {
      if (editingProduct) {
        // Actualizar el producto existente
        const { data, error } = await supabase
          .from('Producto')
          .update([{ id: editingProduct.id, nombre, descripcion, precio: parseFloat(precio), stock: parseInt(stock) }])
          .eq('id', editingProduct.id);

        if (error) {
          throw error;
        }

        console.log('Product updated successfully:', data[0]);

        // Limpiar los campos después de actualizar el producto
        setEditingProduct(null);
      } else {
        // Agregar un nuevo producto
        const { data, error } = await supabase
          .from('Producto')
          .insert([{ nombre, descripcion, precio: parseFloat(precio), stock: parseInt(stock) }]);

        if (error) {
          throw error;
        }

        console.log('Product added successfully:', data[0]);
      }

      // Limpiar los campos después de agregar o actualizar el producto
      setNombre('');
      setDescripcion('');
      setPrecio(0);
      setStock(0);

      // Actualizar la lista de productos después de agregar o actualizar
      const updatedProducts = await supabase.from('Producto').select('*');
      setProducts(updatedProducts.data);
    } catch (error) {
      console.error('Error processing Product:', error.message);
    }
  };

  const handleGeneratePDF = () => {
    const pdf = new jsPDF();
    pdf.text('Informe de Productos', 10, 10);
    pdf.text('----------------------------------------', 10, 20);
  
    // Títulos de los campos
    pdf.text('Nombre, Descripción, Precio, Stock', 10, 30);
  
    // Contenido de los productos
    products.forEach((product, index) => {
      const yPosition = 40 + index * 10;
      pdf.text(
        `${product.nombre}, ${product.descripcion}, $${product.precio}, Stock: ${product.stock}`,
        10,
        yPosition
      );
      
    });
  
    pdf.save('Informe_Productos.pdf');
  };

  const handleEdit = (product) => {
    // Llenar el formulario con los valores del producto seleccionado para editar
    setEditingProduct(product);
    setNombre(product.nombre);
    setDescripcion(product.descripcion);
    setPrecio(product.precio);
    setStock(product.stock);
  };

  const handleCancelEdit = () => {
    // Cancelar la edición y limpiar los campos
    setEditingProduct(null);
    setNombre('');
    setDescripcion('');
    setPrecio(0);
    setStock(0);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('Producto').delete().eq('id', id);

      if (error) {
        throw error;
      }

      console.log('Product deleted successfully:', id);

      // Actualizar la lista de productos después de eliminar un producto
      const updatedProducts = await supabase.from('Producto').select('*');
      setProducts(updatedProducts.data);
    } catch (error) {
      console.error('Error deleting Product:', error.message);
    }
  };

  return (
     <div className="container mt-5">
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="row mb-3">
        <h1>Productos en Stock</h1>
        <label htmlFor="nombre" className="col-sm-2 col-form-label">Nombre del Producto:</label>
        <div className="col-sm-10">
          <input
            type="text"
            className="form-control"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
      </div>
      <div className="row mb-3">
        <label htmlFor="descripcion" className="col-sm-2 col-form-label">Descripción:</label>
        <div className="col-sm-10">
          <input
            type="text"
            className="form-control"
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>
      </div>
      <div className="row mb-3">
        <label htmlFor="precio" className="col-sm-2 col-form-label">Precio:</label>
        <div className="col-sm-10">
          <input
            type="number"
            className="form-control"
            id="precio"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
        </div>
      </div>
      <div className="row mb-3">
        <label htmlFor="stock" className="col-sm-2 col-form-label">Stock:</label>
        <div className="col-sm-10">
          <input
            type="number"
            className="form-control"
            id="stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-sm-10 offset-sm-2">
        <button
  type="submit"
  className="btn btn-primary"
  style={{ backgroundColor: '#007bff', borderColor: '#007bff' }}
>
  {editingProduct ? 'Actualizar Producto' : 'Agregar Producto'}
</button>

          {editingProduct && (
            <button type="button" className="btn btn-secondary ms-2" onClick={handleCancelEdit}>
              Cancelar Edición
            </button>
          )}
        </div>
      </div>
    </form>
    <br></br>
   
      <div className="d-flex justify-content-between mb-4">
        <h2 className="mt-4">Lista de Productos</h2>
        <button className="btn btn-primary" style={{ backgroundColor: 'blue', color: 'white', border: '1px solid blue' }} onClick={handleGeneratePDF}>
          Generar PDF
        </button>

      </div>
      <table className="table" style={{ border: '2px solid black', borderCollapse: 'collapse', width: '100%' }}>
  <thead style={{ backgroundColor: 'lightgray' }}>
    <tr>
      <th scope="col">Nombre</th>
      <th scope="col">Descripción</th>
      <th scope="col">Precio</th>
      <th scope="col">Stock</th>
      <th scope="col">Acciones</th>
    </tr>
  </thead>
  <tbody>
    {products.map((product) => (
      <tr key={product.id} style={{ borderBottom: '1px solid black' }}>
        <td>{product.nombre}</td>
        <td>{product.descripcion}</td>
        <td>${product.precio}</td>
        <td>{product.stock}</td>
        <td>
          <button className="btn btn-warning me-2" style={{ backgroundColor: 'orange' }} onClick={() => handleEdit(product)}>
            Editar
          </button>
          <button className="btn btn-danger" style={{ backgroundColor: 'red' }} onClick={() => handleDelete(product.id)}>
            Eliminar
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

    </div>
  );
};

ProductForm.propTypes = {
  supabase: PropTypes.object.isRequired,
};

export default ProductForm;