import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import paymentApi from '../../../apiCalls/paymentApi';
import './dashboard.scss';

const initialForm = {
  title: '',
  description: '',
  amount: '',
  currency: 'USD',
  due_date: '',
  recipient_name: '',
  recipient_email: '',
  telegram_chat_id: '',
  notification_channels: ['email'],
};

const getPaymentId = (payment) => payment.id || payment._id;

const formatDate = (value) => {
  if (!value) return 'No due date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid due date';
  return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

const formatAmount = (amount, currency = 'USD') => {
  const numericAmount = Number(amount);
  if (Number.isNaN(numericAmount)) return `${currency} --`;
  return new Intl.NumberFormat([], { style: 'currency', currency }).format(numericAmount);
};

const getPaymentLabel = (payment) => payment.title || payment.description || 'Untitled payment';

const DashboardPage = () => {
  const { user } = useSelector((state) => state.commonData);
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyPaymentId, setBusyPaymentId] = useState(null);
  const [error, setError] = useState('');

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      setPayments(await paymentApi.listPending());
      setError('');
    } catch (requestError) {
      setError(paymentApi.getErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleChannelChange = (event) => {
    const { value, checked } = event.target;
    setForm((current) => ({
      ...current,
      notification_channels: checked
        ? [...current.notification_channels, value]
        : current.notification_channels.filter((channel) => channel !== value),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title || !form.amount || !form.due_date || !form.recipient_name
      || !form.recipient_email || form.notification_channels.length === 0) {
      setError('Complete the required payment fields and choose at least one notification channel.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await paymentApi.create({
        ...form,
        amount: Number(form.amount),
        due_date: new Date(form.due_date).toISOString(),
      });
      setForm(initialForm);
      await loadPayments();
    } catch (requestError) {
      setError(paymentApi.getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (payment, status) => {
    const paymentId = getPaymentId(payment);
    if (!paymentId) return;
    setBusyPaymentId(paymentId);
    setError('');
    try {
      await paymentApi.updateStatus(paymentId, status);
      await loadPayments();
    } catch (requestError) {
      setError(paymentApi.getErrorMessage(requestError));
    } finally {
      setBusyPaymentId(null);
    }
  };

  const handleDelete = async (payment) => {
    const paymentId = getPaymentId(payment);
    if (!paymentId || !window.confirm(`Delete ${getPaymentLabel(payment)}?`)) return;
    setBusyPaymentId(paymentId);
    setError('');
    try {
      await paymentApi.remove(paymentId);
      setPayments((current) => current.filter((item) => getPaymentId(item) !== paymentId));
    } catch (requestError) {
      setError(paymentApi.getErrorMessage(requestError));
    } finally {
      setBusyPaymentId(null);
    }
  };

  return (
    <main className="payment-dashboard">
      <div className="payment-dashboard__shell">
        <header className="payment-dashboard__topbar">
          <div>
            <p className="payment-dashboard__eyebrow">Payment control desk</p>
            <h1 className="payment-dashboard__title">Keep every payment on time.</h1>
            <p className="payment-dashboard__subtitle">
              Track what is due, who should receive it, and which channels will send the reminder.
            </p>
          </div>
          <div className="payment-dashboard__user">{user?.name || 'Account'} </div>
        </header>

        <div className="payment-dashboard__grid">
          <section className="payment-dashboard__panel payment-dashboard__panel--form">
            <div className="payment-dashboard__section-heading">
              <div>
                <h2>Add a payment</h2>
                <p>The backend keeps delivery credentials private.</p>
              </div>
            </div>

            <form className="payment-dashboard__form" onSubmit={handleSubmit}>
              <div className="payment-dashboard__field payment-dashboard__field--wide">
                <label htmlFor="payment-title">Title *</label>
                <input id="payment-title" name="title" value={form.title} onChange={handleFieldChange} placeholder="Hosting invoice" required />
              </div>
              <div className="payment-dashboard__field payment-dashboard__field--wide">
                <label htmlFor="payment-description">Description</label>
                <textarea id="payment-description" name="description" value={form.description} onChange={handleFieldChange} placeholder="Monthly production hosting" />
              </div>
              <div className="payment-dashboard__field">
                <label htmlFor="payment-amount">Amount *</label>
                <input id="payment-amount" name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={handleFieldChange} placeholder="49.99" required />
              </div>
              <div className="payment-dashboard__field">
                <label htmlFor="payment-currency">Currency *</label>
                <input id="payment-currency" name="currency" maxLength="3" value={form.currency} onChange={(event) => handleFieldChange({ target: { name: 'currency', value: event.target.value.toUpperCase() } })} required />
              </div>
              <div className="payment-dashboard__field">
                <label htmlFor="payment-due-date">Due date and time *</label>
                <input id="payment-due-date" name="due_date" type="datetime-local" value={form.due_date} onChange={handleFieldChange} required />
              </div>
              <div className="payment-dashboard__field">
                <label htmlFor="payment-recipient">Recipient name *</label>
                <input id="payment-recipient" name="recipient_name" value={form.recipient_name} onChange={handleFieldChange} placeholder="Finance team" required />
              </div>
              <div className="payment-dashboard__field">
                <label htmlFor="payment-email">Recipient email *</label>
                <input id="payment-email" name="recipient_email" type="email" value={form.recipient_email} onChange={handleFieldChange} placeholder="finance@example.com" required />
              </div>
              <div className="payment-dashboard__field">
                <label htmlFor="payment-telegram">Telegram chat ID</label>
                <input id="payment-telegram" name="telegram_chat_id" value={form.telegram_chat_id} onChange={handleFieldChange} placeholder="Optional" />
              </div>
              <div className="payment-dashboard__field payment-dashboard__field--wide">
                <label>Notification channels *</label>
                <div className="payment-dashboard__channels">
                  {['email', 'telegram'].map((channel) => (
                    <label className="payment-dashboard__channel" key={channel}>
                      <input type="checkbox" value={channel} checked={form.notification_channels.includes(channel)} onChange={handleChannelChange} />
                      {channel === 'email' ? 'Gmail / email' : 'Telegram'}
                    </label>
                  ))}
                </div>
              </div>
              <div className="payment-dashboard__form-actions">
                <button className="payment-dashboard__button payment-dashboard__button--muted" type="button" onClick={() => setForm(initialForm)}>Clear</button>
                <button className="payment-dashboard__button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save payment'}</button>
              </div>
            </form>
            {error && <p className="payment-dashboard__notice" role="alert">{error}</p>}
          </section>

          <aside className="payment-dashboard__panel payment-dashboard__panel--configs">
            <div className="payment-dashboard__section-heading">
              <div>
                <h2>Notification setup</h2>
                <p>Connection details stay on the server.</p>
              </div>
            </div>
            <div className="payment-dashboard__config">
              <div className="payment-dashboard__config-header">
                <span className="payment-dashboard__config-title">Gmail / email</span>
                <span className="payment-dashboard__status">Backend managed</span>
              </div>
              <p className="payment-dashboard__config-detail">SMTP credentials and sender identity are never sent to this browser.</p>
            </div>
            <div className="payment-dashboard__config">
              <div className="payment-dashboard__config-header">
                <span className="payment-dashboard__config-title">Telegram</span>
                <span className="payment-dashboard__status">Backend managed</span>
              </div>
              <p className="payment-dashboard__config-detail">The bot token remains private. Add a chat ID to a payment when Telegram delivery is needed.</p>
            </div>
            <div className="payment-dashboard__config">
              <div className="payment-dashboard__config-header">
                <span className="payment-dashboard__config-title">API connection</span>
                <span className="payment-dashboard__status payment-dashboard__status--neutral">Protected</span>
              </div>
              <p className="payment-dashboard__config-detail">Requests use the signed-in account token and the `/api/v1` backend.</p>
            </div>
          </aside>
        </div>

        <section className="payment-dashboard__list">
          <div className="payment-dashboard__list-heading">
            <h2>Pending payments</h2>
            <span>{isLoading ? 'Loading...' : `${payments.length} ${payments.length === 1 ? 'payment' : 'payments'}`}</span>
          </div>
          {isLoading ? <div className="payment-dashboard__empty">Loading payments...</div> : null}
          {!isLoading && payments.length === 0 ? <div className="payment-dashboard__empty">No pending payments yet. Add one above to start tracking.</div> : null}
          <div className="payment-dashboard__payments">
            {payments.map((payment) => {
              const paymentId = getPaymentId(payment);
              const isBusy = busyPaymentId === paymentId;
              return (
                <article className="payment-dashboard__payment" key={paymentId || payment.title}>
                  <div className="payment-dashboard__payment-main">
                    <div className="payment-dashboard__payment-mark">$</div>
                    <div>
                      <div className="payment-dashboard__payment-title">{getPaymentLabel(payment)}</div>
                      <div className="payment-dashboard__payment-detail">{payment.recipient_name || 'No recipient'} · Due {formatDate(payment.due_date)}</div>
                    </div>
                  </div>
                  <div className="payment-dashboard__payment-meta">
                    <span className="payment-dashboard__payment-amount">{formatAmount(payment.amount, payment.currency)}</span>
                    <span>{(payment.notification_channels || []).join(' + ') || 'No channel'}</span>
                    <div className="payment-dashboard__payment-actions">
                      <button className="payment-dashboard__text-button" type="button" onClick={() => handleStatusChange(payment, 'paid')} disabled={isBusy}>Mark paid</button>
                      <button className="payment-dashboard__text-button" type="button" onClick={() => handleStatusChange(payment, 'cancelled')} disabled={isBusy}>Cancel</button>
                      <button className="payment-dashboard__text-button payment-dashboard__text-button--danger" type="button" onClick={() => handleDelete(payment)} disabled={isBusy}>Delete</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
};

export default DashboardPage;
