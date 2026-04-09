import React, { useState } from 'react';
import axios from 'axios';
//import swal from 'sweetalert2';
//import estados from '../../estados';
//import swalConfigs from '../../swalConfigs';

let GetPersonajes = () => {
	const [datos, setData] = useState([]);

	const getPersonajes = () => {
			axios.get('http://localhost:3002/', ).then(res => {
				console.log(res.data.valor);
				setData(res.data.valor);
				console.log('aqui')
			});
	};

	return (
		<div className='form-row col-12 my-5'>
			<legend className='text-center'>Valor retornado {datos} </legend>

			<div className='col-12 mt-5'>
				<button
					type='button'
					className='font-weight-bold text-uppercase btn btn-primary btn-block'
					onClick={getPersonajes}
				>
					Obtener valor calve Kylo
				</button>
			</div>
		</div>
	);
};

export default GetPersonajes;