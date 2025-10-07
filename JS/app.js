// ==== SISTEMA DE CARRITO UNIFICADO ====
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Actualizar contador del carrito
function actualizarContadorCarrito() {
    const contadores = document.querySelectorAll("#cart-count");
    if (contadores.length > 0) {
        const totalItems = carrito.reduce((acc, item) => acc + (item.cantidad || 1), 0);
        contadores.forEach(contador => {
            contador.textContent = totalItems;
        });
    }
}

// Agregar producto al carrito
function agregarAlCarrito(producto) {
    const existe = carrito.find(item => item.id === producto.id);
    
    if (existe) {
        existe.cantidad = (existe.cantidad || 1) + 1;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1
        });
    }
    
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContadorCarrito();
    mostrarNotificacion(`✅ ${producto.nombre} agregado al carrito`);
}

// Eliminar producto del carrito
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContadorCarrito();
    mostrarCarrito();
}

// Vaciar carrito completo
function vaciarCarrito() {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
        carrito = [];
        localStorage.removeItem("carrito");
        actualizarContadorCarrito();
        mostrarCarrito();
        mostrarNotificacion('🗑️ Carrito vaciado');
        
        // Forzar actualización visual
        setTimeout(() => {
            location.reload();
        }, 500);
    }
}
// Mostrar notificación
function mostrarNotificacion(mensaje, tipo = 'success') {
    let notif = document.getElementById('notification-global');
    if (!notif) {
        notif = document.createElement('div');
        notif.id = 'notification-global';
        notif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1A3A5F;
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            z-index: 9999;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.4s ease;
        `;
        document.body.appendChild(notif);
    }
    
    notif.textContent = mensaje;
    notif.style.background = tipo === 'error' ? '#c0392b' : '#1A3A5F';
    notif.style.opacity = '1';
    notif.style.transform = 'translateY(0)';
    
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateY(-20px)';
    }, 3000);
}

// Calcular total del carrito
function calcularTotal() {
    return carrito.reduce((total, item) => {
        const precio = typeof item.precio === 'string' 
            ? parseFloat(item.precio.replace(/[^\d]/g, '')) || 0
            : item.precio || 0;
        return total + (precio * (item.cantidad || 1));
    }, 0);
}

// Mostrar carrito (para página carrito.html)
function mostrarCarrito() {
    const container = document.getElementById('cart-container');
    const totalDiv = document.getElementById('cart-total');
    const actions = document.getElementById('cart-actions');
    
    if (!container) return;
    
    // Recargar desde localStorage
    carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    
    if (carrito.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <p>Tu carrito está vacío</p>
                <a href="listado_box.html" class="cta-button" style="margin-top: 1rem;">Ver Productos</a>
            </div>
        `;
        if (totalDiv) totalDiv.style.display = 'none';
        if (actions) actions.style.display = 'none';
        
        // Actualizar contador a 0
        actualizarContadorCarrito();
    } else {
        container.innerHTML = '';
        
        carrito.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            const precioMostrar = typeof item.precio === 'string' ? item.precio : `$${item.precio}`;
            itemDiv.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.nombre}</h4>
                    <p>Cantidad: ${item.cantidad || 1}</p>
                </div>
                <div class="cart-item-price">${precioMostrar}</div>
                <button class="btn btn-small btn-danger" onclick="eliminarDelCarrito(${index})">Eliminar</button>
            `;
            container.appendChild(itemDiv);
        });
        
        const total = calcularTotal();
        if (totalDiv) {
            totalDiv.textContent = `Total: $${total.toLocaleString('es-AR')}`;
            totalDiv.style.display = 'block';
        }
        if (actions) actions.style.display = 'flex';
    }
}
// Función para actualizar la barra de progreso
function actualizarBarraProgreso() {
    const form = document.getElementById('purchaseForm');
    const progressFill = document.getElementById('progress-bar-fill');
    
    if (!form || !progressFill) return;
    
    const inputs = form.querySelectorAll('input, select');
    let camposCompletados = 0;
    let camposTotales = 0;
    
    inputs.forEach(input => {
        if (input.type === 'radio') {
            // Para radios, contamos el grupo una sola vez
            const name = input.name;
            if (!document.querySelector(`input[name="${name}"]:checked`)) {
                camposTotales++;
            } else {
                camposTotales++;
                camposCompletados++;
            }
            // Evitamos contar múltiples veces el mismo grupo
            return;
        } else if (input.type !== 'radio') {
            camposTotales++;
            if (input.value.trim() !== '') {
                camposCompletados++;
            }
        }
    });
    
    const porcentaje = camposTotales > 0 ? (camposCompletados / camposTotales) * 100 : 0;
    progressFill.style.width = porcentaje + '%';
}

// Función para preparar la compra desde el carrito
function prepararCompraDesdeCarrito() {
    // Guardar información del carrito para usar en la página de compra
    const carritoActual = JSON.parse(localStorage.getItem("carrito")) || [];
    
    if (carritoActual.length === 0) {
        mostrarNotificacion('Tu carrito está vacío', 'error');
        return false;
    }
    
    // Guardar en sessionStorage para usar en la página de compra
    sessionStorage.setItem('compraDesdeCarrito', 'true');
    sessionStorage.setItem('carritoParaCompra', JSON.stringify(carritoActual));
    
    return true;
}

// Función para cargar productos del carrito en el formulario de compra
function cargarCarritoEnFormulario() {
    const compraDesdeCarrito = sessionStorage.getItem('compraDesdeCarrito');
    const carritoParaCompra = sessionStorage.getItem('carritoParaCompra');
    
    if (compraDesdeCarrito === 'true' && carritoParaCompra) {
        const carrito = JSON.parse(carritoParaCompra);
        
        // Mostrar información del carrito
        const infoCarrito = document.getElementById('info-carrito');
        if (infoCarrito) {
            infoCarrito.style.display = 'block';
            const totalItems = carrito.reduce((acc, item) => acc + (item.cantidad || 1), 0);
            infoCarrito.innerHTML = `
                <strong>📦 Compra desde carrito:</strong> 
                ${carrito.length} producto(s) - ${totalItems} item(s) total
                <br><small>Tus productos han sido cargados automáticamente</small>
            `;
        }
        
        // Limpiar el select de productos
        const selectProducto = document.getElementById('producto');
        if (selectProducto) {
            selectProducto.innerHTML = '<option value="">Seleccione un producto...</option>';
            
            // Agregar productos del carrito al select
            carrito.forEach(item => {
                const option = document.createElement('option');
                option.value = item.nombre;
                option.textContent = `${item.nombre} (Cantidad: ${item.cantidad || 1})`;
                option.selected = true;
                selectProducto.appendChild(option);
            });
            
            // Si hay múltiples productos, mostrar un resumen como opción seleccionada
            if (carrito.length > 1) {
                const optionResumen = document.createElement('option');
                optionResumen.value = 'multiple';
                optionResumen.textContent = `Múltiples productos (${carrito.length} items del carrito)`;
                optionResumen.selected = true;
                selectProducto.insertBefore(optionResumen, selectProducto.firstChild.nextSibling);
            }
        }
        
        // Establecer la cantidad total
        const inputCantidad = document.getElementById('cantidad');
        if (inputCantidad) {
            const cantidadTotal = carrito.reduce((total, item) => total + (item.cantidad || 1), 0);
            inputCantidad.value = cantidadTotal;
            inputCantidad.setAttribute('readonly', 'true');
            inputCantidad.title = 'Cantidad automática desde el carrito';
        }
        
        // Limpiar sessionStorage después de usar
        sessionStorage.removeItem('compraDesdeCarrito');
        sessionStorage.removeItem('carritoParaCompra');
        
        // Actualizar barra de progreso
        setTimeout(actualizarBarraProgreso, 100);
    }
}

// Inicialización cuando carga la página
document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorCarrito();
    
    // Si estamos en la página del carrito
    if (document.getElementById('cart-container')) {
        mostrarCarrito();
        
            const btnVaciar = document.getElementById('clear-cart');
                if (btnVaciar) {
                        btnVaciar.addEventListener('click', function(e) {
                            e.preventDefault();
                            vaciarCarrito();
    });
}
        
        // Configurar el botón de finalizar compra
        const btnFinalizar = document.getElementById('finalizar-compra');
        if (btnFinalizar) {
            btnFinalizar.addEventListener('click', function(e) {
                if (!prepararCompraDesdeCarrito()) {
                    e.preventDefault(); // Prevenir navegación si el carrito está vacío
                }
            });
        }
    }
    
    // Si estamos en la página de detalle de producto
    const btnAgregar = document.getElementById('btn-agregar');
    if (btnAgregar) {
        btnAgregar.addEventListener('click', () => {
            const producto = {
                id: document.getElementById('codigo-producto').textContent.replace('Código: ', ''),
                nombre: document.getElementById('nombre-producto').textContent,
                precio: document.getElementById('precio-producto').textContent
            };
            agregarAlCarrito(producto);
        });
    }
    
    // Si estamos en la página de compra, cargar productos del carrito si viene desde allí
    if (document.getElementById('purchaseForm')) {
        cargarCarritoEnFormulario();
        const formCompra = document.getElementById('purchaseForm');
        const inputs = formCompra.querySelectorAll('input, select');
        
        // Configurar eventos para la barra de progreso
        inputs.forEach(input => {
            if (input.type === 'radio') {
                input.addEventListener('change', actualizarBarraProgreso);
            } else {
                input.addEventListener('input', actualizarBarraProgreso);
            }
        });
        
        // Inicializar barra de progreso
        actualizarBarraProgreso();
        
        const validarNombre = nombre => /^[a-zA-ZÀ-ÿ\s]{2,}$/.test(nombre);
        const validarTelefono = tel => /^[0-9]{7,15}$/.test(tel);
        const validarEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        
        formCompra.addEventListener('submit', (e) => {
            e.preventDefault();
            let valido = true;
            
            const nombre = document.getElementById('nombre');
            const tel = document.getElementById('telefono');
            const email = document.getElementById('email');
            const metodoPago = document.querySelector('input[name="metodoPago"]:checked');
            const producto = document.getElementById('producto');
            
            // Validar nombre
            const errorNombre = document.getElementById('error-nombre');
            if (nombre && !validarNombre(nombre.value.trim())) {
                if (errorNombre) errorNombre.style.display = 'block';
                valido = false;
            } else if (errorNombre) {
                errorNombre.style.display = 'none';
            }
            
            // Validar teléfono
            const errorTel = document.getElementById('error-telefono');
            if (tel && !validarTelefono(tel.value.trim())) {
                if (errorTel) errorTel.style.display = 'block';
                valido = false;
            } else if (errorTel) {
                errorTel.style.display = 'none';
            }
            
            // Validar email
            const errorEmail = document.getElementById('error-email');
            if (email && !validarEmail(email.value.trim())) {
                if (errorEmail) errorEmail.style.display = 'block';
                valido = false;
            } else if (errorEmail) {
                errorEmail.style.display = 'none';
            }
            
            // Validar método de pago
            const errorMetodo = document.getElementById('error-metodo');
            if (!metodoPago) {
                if (errorMetodo) errorMetodo.style.display = 'block';
                valido = false;
            } else if (errorMetodo) {
                errorMetodo.style.display = 'none';
            }
            
            // Validar producto seleccionado
            if (producto && producto.value === '') {
                valido = false;
                producto.style.borderColor = '#c0392b';
            } else if (producto) {
                producto.style.borderColor = '';
            }
            
            if (!valido) {
                mostrarNotificacion('Por favor completa correctamente todos los campos', 'error');
                return;
            }
            
            // Si todo es válido, procesar el pedido
            const productoSeleccionado = producto.value;
            const cantidad = document.getElementById('cantidad').value;
            
            // Determinar si es una compra desde carrito
            const esCompraDesdeCarrito = sessionStorage.getItem('compraDesdeCarrito') === 'true';
            
            if (esCompraDesdeCarrito) {
                // Para compras desde carrito, vaciar el carrito después de la compra
                carrito = [];
                localStorage.removeItem("carrito");
                actualizarContadorCarrito();
                
                mostrarNotificacion('✅ Compra finalizada correctamente. ¡Gracias por tu pedido!');
            } else {
                // Para compras individuales, agregar al carrito
                const productoCarrito = {
                    id: 'PED' + Date.now(), // ID único para el pedido
                    nombre: `${productoSeleccionado} (x${cantidad}) - Pedido personalizado`,
                    precio: '0', // No tenemos precio específico en el formulario
                    cantidad: parseInt(cantidad)
                };
                
                agregarAlCarrito(productoCarrito);
                mostrarNotificacion('✅ Pedido enviado correctamente');
            }
            
            formCompra.reset();
            
            // Reiniciar barra de progreso
            actualizarBarraProgreso();
            
            // Restablecer cantidad editable si estaba en modo carrito
            const inputCantidad = document.getElementById('cantidad');
            if (inputCantidad) {
                inputCantidad.removeAttribute('readonly');
                inputCantidad.removeAttribute('title');
            }
            
            // Ocultar info carrito si existe
            const infoCarrito = document.getElementById('info-carrito');
            if (infoCarrito) {
                infoCarrito.style.display = 'none';
            }
        });
    }
});

// Hacer funciones disponibles globalmente
window.agregarAlCarrito = agregarAlCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;
window.vaciarCarrito = vaciarCarrito;
window.mostrarCarrito = mostrarCarrito;
window.prepararCompraDesdeCarrito = prepararCompraDesdeCarrito;