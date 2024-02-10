// TransactionForm.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import jsPDF from 'jspdf';

const TransactionForm = ({ supabase }) => {
  const [transactions, setTransactions] = useState([]);
  const [productos, setProductos] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState(0);
  const [fecha, setFecha] = useState('');
  const [tipo, setTipo] = useState('');

  useEffect(() => {
    // Leer transacciones al cargar el componente
    const fetchTransactions = async () => {
      try {
        const { data, error } = await supabase.from('Transaccion').select('*');

        if (error) {
          throw error;
        }
        
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error.message);
      }
    };

    // Leer productos al cargar el componente
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase.from('Producto').select('*');
  
        if (error) {
          throw error;
        }
  
        setProductos(data); // Guardar la lista de productos
      } catch (error) {
        console.error('Error fetching products:', error.message);
      }
    };

    fetchTransactions();
    fetchProducts();
  }, [supabase]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productoId || !productoId.toString().trim() || isNaN(cantidad) || !cantidad.toString().trim() || !fecha.trim() || !tipo.trim()) {
        return;
    }      

    try {
      if (editingTransaction) {
        // Actualizar la transacción existente
        const { data, error } = await supabase
          .from('Transaccion')
          .update([{ id: editingTransaction.id, productoId: productoId.toString(), cantidad: parseInt(cantidad), fecha, tipo }])
          .eq('id', editingTransaction.id);

        if (error) {
          throw error;
        }

        console.log('Transaction updated successfully:', data[0]);

        // Limpiar los campos después de actualizar la transacción
        setEditingTransaction(null);
      } else {
        // Agregar una nueva transacción
        const { data, error } = await supabase
          .from('Transaccion')
          .insert([{ productoId: productoId.toString(), cantidad: parseInt(cantidad), fecha, tipo }]);

        if (error) {
          throw error;
        }

        console.log('Transaction added successfully:', data[0]);
      }

      // Limpiar los campos después de agregar o actualizar la transacción
      setProductoId('');
      setCantidad(0);
      setFecha('');
      setTipo('');

      // Actualizar la lista de transacciones después de agregar o actualizar
      const updatedTransactions = await supabase.from('Transaccion').select('*');
      setTransactions(updatedTransactions.data);
    } catch (error) {
      console.error('Error processing Transaction:', error.message);
    }
  };

  const handleGeneratePDF = () => {
    const pdf = new jsPDF();
    pdf.text('Informe de Transacciones', 10, 10);
    pdf.text('----------------------------------------', 10, 20);
  
    // Títulos de los campos
    pdf.text('Producto, Cantidad, Fecha, Tipo', 10, 30);
  
    // Contenido de las transacciones
    transactions.forEach((transaction, index) => {
      const productName = productos.find((producto) => producto.id === transaction.productoId)?.nombre;
  
      const yPosition = 40 + index * 10;
      pdf.text(`${productName}, ${transaction.cantidad}, ${transaction.fecha}, ${transaction.tipo}`, 10, yPosition);

    });
  
    pdf.save('Informe_Transacciones.pdf');
  };
  

  const handleEdit = (transaction) => {
    // Llenar el formulario con los valores de la transacción seleccionada para editar
    setEditingTransaction(transaction);
    setProductoId(transaction.productoId);
    setCantidad(transaction.cantidad);
    setFecha(transaction.fecha);
    setTipo(transaction.tipo);
  };

  const handleCancelEdit = () => {
    // Cancelar la edición y limpiar los campos
    setEditingTransaction(null);
    setProductoId('');
    setCantidad(0);
    setFecha('');
    setTipo('');
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('Transaccion').delete().eq('id', id);

      if (error) {
        throw error;
      }

      console.log('Transaction deleted successfully:', id);

      // Actualizar la lista de transacciones después de eliminar una
      const updatedTransactions = await supabase.from('Transaccion').select('*');
      setTransactions(updatedTransactions.data);
    } catch (error) {
      console.error('Error deleting Transaction:', error.message);
    }
  };

  return (
    <div>
  <form onSubmit={handleSubmit} className="mb-4" style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
    <div className="mb-3">
    <h1>Transaccion</h1>
      <label htmlFor="productoId" className="form-label">
        Lista de Productos:
      </label>
      <select
        id="productoId"
        className="form-select"
        value={productoId}
        onChange={(e) => setProductoId(e.target.value)}
      >
        <option value="" disabled>
          Seleccione un producto
        </option>
        {productos.map((producto) => (
          <option key={producto.id} value={producto.id}>
            {producto.nombre}
          </option>
        ))}
      </select>
    </div>
    <div className="mb-3">
      <label htmlFor="cantidad" className="form-label">
        Cantidad:
      </label>
      <input
        type="number"
        id="cantidad"
        className="form-control"
        value={cantidad}
        onChange={(e) => setCantidad(e.target.value)}
        style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
      />
    </div>
    <div className="mb-3">
      <label htmlFor="fecha" className="form-label">
        Fecha:
      </label>
      <input
        type="date"
        id="fecha"
        className="form-control"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
      />
    </div>
    <div className="mb-3">
      <label htmlFor="tipo" className="form-label">
        Tipo:
      </label>
      <select
        id="tipo"
        className="form-control"
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
      >
        <option value="">Seleccione...</option>
        <option value="Entrada">Entrada</option>
        <option value="Salida">Salida</option>
      </select>
    </div>

    <button
  type="submit"
  className="btn btn-primary"
  style={{ marginRight: '10px', backgroundColor: '#007bff', borderColor: '#007bff' }}
>
  {editingTransaction ? 'Actualizar Transacción' : 'Agregar Transacción'}
</button>

    {editingTransaction && (
      <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
        Cancelar Edición
      </button>
    )}
  </form>
  <br></br>


      <div className="d-flex justify-content-between mb-4">
        <h2 className="mt-4">Lista de Transacciones</h2>
        <button className="btn btn-primary" style={{ backgroundColor: 'blue', color: 'white', border: '1px solid blue' }} onClick={handleGeneratePDF}>
          Generar PDF
        </button>
      </div>
      <table className="table" style={{ border: '2px solid black', borderCollapse: 'collapse', width: '100%' }}>
      <thead style={{ backgroundColor: 'lightgray' }}>
            <tr>
            <th scope="col">Producto</th>
            <th scope="col">Cantidad</th>
            <th scope="col">Fecha</th>
            <th scope="col">Tipo</th>
            <th scope="col">Acciones</th>
            </tr>
        </thead>
        <tbody>
            {transactions.map((transaction) => (
            <tr key={transaction.id}>
                <td>{productos.find((producto) => producto.id === transaction.productoId)?.nombre}</td>
                <td>{transaction.cantidad}</td>
                <td>{transaction.fecha}</td>
                <td>{transaction.tipo}</td>
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

TransactionForm.propTypes = {
  supabase: PropTypes.object.isRequired,
};

export default TransactionForm;