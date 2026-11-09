import { useState } from 'react';
import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';
import Icon from '../ui/Icon.jsx';
import Alert from '../ui/Alert.jsx';
import useValidatedForm from '../../hooks/useValidatedForm.js';
import { formatCLP, isEmail } from '../../utils/format.js';
import api from '../../services/backendApi.js';

function validate(values) {
  const errors = {};
  if (values.nombre.trim().length < 3) errors.nombre = 'Ingresa el nombre de quien recibe.';
  if (!isEmail(values.email)) errors.email = 'Ingresa un correo válido.';
  if (values.direccion.trim().length < 5) errors.direccion = 'Ingresa una dirección de al menos 5 caracteres.';
  if (values.ciudad.trim().length < 3) errors.ciudad = 'Ingresa la ciudad o campus de entrega.';
  return errors;
}

export default function CheckoutForm({ total, user, onConfirm, onCancel }) {
  const [step, setStep] = useState('shipping'); // 'shipping', 'payment', 'processing'
  const [paymentMethod, setPaymentMethod] = useState('webpay');
  const [cardNumber, setCardNumber] = useState('4242424242424242');
  const [processingStatus, setProcessingStatus] = useState('');
  const [paymentError, setPaymentError] = useState(null);

  const form = useValidatedForm(
    {
      nombre: user?.nombre || '',
      email: user?.email || '',
      direccion: user?.campus ? `Punto de Retiro ${user.campus}` : 'Av. República 237',
      ciudad: 'Santiago'
    },
    validate,
    () => setStep('payment')
  );

  const props = (name) => ({
    name,
    value: form.values[name],
    onChange: form.change,
    error: form.errors[name]
  });

  async function handleExecutePayment() {
    setStep('processing');
    setPaymentError(null);
    setProcessingStatus('Conectando con Pasarela Segura Webpay Plus...');

    await new Promise((r) => setTimeout(r, 900));
    setProcessingStatus('Verificando fondos y token de autorización bancaria...');

    await new Promise((r) => setTimeout(r, 900));

    // Llamada a la API de simulación de pagos
    const simResult = await api.simulatePayment({
      monto: total,
      metodo: paymentMethod === 'webpay' ? 'Webpay Plus Simulado' : 'Redcompra Simulado',
      cardNumber,
      simulatedOutcome: cardNumber.endsWith('0000') ? 'FAILURE' : 'SUCCESS'
    });

    if (!simResult.success) {
      setStep('payment');
      setPaymentError(simResult.error || 'La transacción fue rechazada por el banco emisor simulado.');
      return;
    }

    const voucher = simResult.data.voucher || {
      codigoAutorizacion: 'AUTH-' + Math.floor(100000 + Math.random() * 900000),
      tarjeta: `•••• •••• •••• ${cardNumber.slice(-4)}`,
      metodo: 'Webpay Plus'
    };

    onConfirm(form.values, voucher);
  }

  return (
    <div className="nt-checkout-flow">
      {step === 'shipping' && (
        <form ref={form.ref} onSubmit={form.submit} noValidate>
          <div className="nt-flow-stepper">
            <span className="nt-step-chip is-active">1. Despacho y Entrega</span>
            <span className="nt-step-chip">2. Pago Webpay Plus</span>
          </div>

          <p className="nt-demo-hint">
            Ingresa los datos para la entrega en campus o dirección particular.
          </p>

          <Field label="Nombre del destinatario" {...props('nombre')} autoFocus required maxLength={100} />
          <Field label="Correo de contacto" {...props('email')} type="email" required maxLength={160} />
          <Field label="Dirección / Punto de Retiro" {...props('direccion')} required maxLength={180} />
          <Field label="Ciudad / Sede UNAB" {...props('ciudad')} required maxLength={80} />

          <div className="nt-checkout-total">
            <span>Total a pagar</span>
            <strong>{formatCLP(total)}</strong>
          </div>

          <div className="nt-form-actions">
            <Button variant="secondary" onClick={onCancel}>
              Volver al carrito
            </Button>
            <Button type="submit" icon="arrow">
              Continuar al pago
            </Button>
          </div>
        </form>
      )}

      {step === 'payment' && (
        <div className="nt-payment-step">
          <div className="nt-flow-stepper">
            <span className="nt-step-chip is-done">1. Despacho ✓</span>
            <span className="nt-step-chip is-active">2. Pago Webpay Plus</span>
          </div>

          {paymentError && (
            <Alert tone="danger" title="Error en la transacción">
              {paymentError}
            </Alert>
          )}

          <div className="nt-gateway-badge">
            <Icon name="shield" size={24} />
            <div>
              <strong>Pasarela Certificada Transbank Webpay Plus</strong>
              <small>Simulación académica segura · Sin cobros a cuentas reales</small>
            </div>
          </div>

          <div className="nt-payment-options">
            <label className={`nt-pay-option ${paymentMethod === 'webpay' ? 'is-selected' : ''}`}>
              <input
                type="radio"
                name="pm"
                value="webpay"
                checked={paymentMethod === 'webpay'}
                onChange={() => setPaymentMethod('webpay')}
              />
              <div>
                <strong>Webpay Plus (Tarjetas de Crédito / Débito)</strong>
                <span>Visa, Mastercard, Magna, American Express</span>
              </div>
            </label>

            <label className={`nt-pay-option ${paymentMethod === 'redcompra' ? 'is-selected' : ''}`}>
              <input
                type="radio"
                name="pm"
                value="redcompra"
                checked={paymentMethod === 'redcompra'}
                onChange={() => setPaymentMethod('redcompra')}
              />
              <div>
                <strong>Redcompra / CuentaRUT BancoEstado</strong>
                <span>Débito directo bancario simulado</span>
              </div>
            </label>
          </div>

          <div className="nt-card-simulator">
            <label className="nt-field-label">Tarjeta de Prueba para Simulación:</label>
            <select
              className="form-select nt-select"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            >
              <option value="4242424242424242">4242 •••• •••• 4242 — [Simular Pago Exitoso / Autorizado]</option>
              <option value="4000000000000000">4000 •••• •••• 0000 — [Simular Pago Rechazado / Sin fondos]</option>
            </select>
          </div>

          <div className="nt-checkout-total">
            <span>Monto a autorizar</span>
            <strong>{formatCLP(total)}</strong>
          </div>

          <div className="nt-form-actions">
            <Button variant="secondary" onClick={() => setStep('shipping')}>
              Volver a despacho
            </Button>
            <Button icon="check" onClick={handleExecutePayment}>
              Pagar {formatCLP(total)}
            </Button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="nt-payment-processing">
          <div className="nt-spinner" />
          <h4>Procesando Transacción Segura</h4>
          <p>{processingStatus}</p>
          <div className="nt-gateway-lock">
            <Icon name="shield" size={16} /> Encriptación SSL 256-bit
          </div>
        </div>
      )}
    </div>
  );
}
