import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import paymentApi from '../../../apiCalls/paymentApi';
import { performLogoutAction } from '../../../redux/actions';
import ToastMessage from '../../../components/commonComponents/toastMessage';

const emptyForm = {
    title: '',
    description: '',
    amount: '',
    currency: 'USD',
    payment_type: 'full',
    down_payment: '',
    emi_months: '',
    due_date: '',
    recipient_name: '',
    recipient_emails: [''],
    telegram_chat_ids: [''],
    notification_channels: ['email'],
};

const filters = ['all', 'pending', 'paid', 'cancelled'];
const paymentId = (payment) => payment.id || payment._id;
const dateValue = (value) => (value ? new Date(value).getTime() : 0);
const formatDate = (value) => {
    if (!value) return 'No due date';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'No due date' : date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};
const formatAmount = (amount, currency = 'USD') => {
    try { return new Intl.NumberFormat([], { style: 'currency', currency }).format(Number(amount)); } catch { return `${currency} ${amount}`; }
};
const messageFrom = (error) => error.response?.data?.error || error.response?.data?.message || error.message || 'Request failed.';
const getRecipients = (payment, key, fallback) => payment[key] || (payment[fallback] ? [payment[fallback]] : []);
const isEmiPayment = (payment) => Boolean(
    payment.is_emi
    || payment.emi
    || payment.payment_type === 'emi'
    || /\bemi\b|installment/i.test(`${payment.title || ''} ${payment.description || ''}`)
);

const DashboardPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.commonData?.user);

    const [payments, setPayments] = useState([]);
    const [filter, setFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [notificationSettings, setNotificationSettings] = useState({
        email: true,
        telegram: true,
        dueSoon: true,
        overdue: true,
    });
    const [form, setForm] = useState(emptyForm);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [busyId, setBusyId] = useState(null);
    const [notice, setNotice] = useState({ type: '', text: '' });

    // Profile menu state
    const [anchorEl, setAnchorEl] = useState(null);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const loadPayments = async () => {
        setIsLoading(true);
        try {
            setPayments(await paymentApi.list('all'));
            setNotice({ type: '', text: '' });
        } catch (error) {
            setNotice({ type: 'error', text: messageFrom(error) });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadPayments(); }, []);

    // Profile menu handlers
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        handleMenuClose();
        setIsLoggingOut(true);

        try {
            await dispatch(performLogoutAction(
                navigate,
                (message, severity) => setToast({ open: true, message, severity })
            ));
        } catch (error) {
            setToast({
                open: true,
                message: 'Logout completed',
                severity: 'success',
            });
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleToastClose = () => {
        setToast({ ...toast, open: false });
    };

    const summary = useMemo(() => {
        const now = Date.now();
        const pending = payments.filter((item) => item.status === 'pending');
        return {
            total: payments.length,
            pending: pending.length,
            paid: payments.filter((item) => item.status === 'paid').length,
            overdue: pending.filter((item) => dateValue(item.due_date) < now).length,
            amount: pending.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
        };
    }, [payments]);

    const visiblePayments = useMemo(() => payments.filter((payment) => filter === 'all' || payment.status === filter).sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (b.status === 'pending' && a.status !== 'pending') return 1;
        return dateValue(a.due_date) - dateValue(b.due_date);
    }), [filter, payments]);

    const tabPayments = useMemo(() => {
        if (activeTab === 'dashboard') {
            return visiblePayments.filter((payment) => payment.status === 'pending');
        }
        if (activeTab === 'emi') {
            // All EMI payments (both pending and completely paid)
            return visiblePayments.filter(isEmiPayment);
        }
        if (activeTab === 'payments') {
            // Standard non-EMI payments, plus fully paid EMI items
            return visiblePayments.filter((payment) => !isEmiPayment(payment) || payment.status === 'paid');
        }
        return visiblePayments;
    }, [activeTab, visiblePayments]);

    const changeField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    const changeCurrency = (event) => setForm((current) => ({ ...current, currency: event.target.value.toUpperCase() }));
    const changeArray = (key, index, value) => setForm((current) => ({ ...current, [key]: current[key].map((item, itemIndex) => (itemIndex === index ? value : item)) }));
    const addArrayItem = (key) => setForm((current) => ({ ...current, [key]: [...current[key], ''] }));
    const removeArrayItem = (key, index) => setForm((current) => ({ ...current, [key]: current[key].length === 1 ? [''] : current[key].filter((_, itemIndex) => itemIndex !== index) }));
    const changeChannel = (event) => setForm((current) => ({ ...current, notification_channels: event.target.checked ? [...current.notification_channels, event.target.value] : current.notification_channels.filter((item) => item !== event.target.value) }));

    const submitPayment = async (event) => {
        event.preventDefault();
        const amount = Number(form.amount);
        const emails = form.recipient_emails.map((item) => item.trim()).filter(Boolean);
        const chats = form.telegram_chat_ids.map((item) => item.trim()).filter(Boolean);
        const hasEmailChannel = form.notification_channels.includes('email');
        const hasTelegramChannel = form.notification_channels.includes('telegram');

        // Validate required fields
        if (!form.title.trim() || !amount || amount <= 0 || !/^[A-Z]{3}$/.test(form.currency) || !form.due_date || !form.recipient_name.trim() || !form.notification_channels.length) {
            setNotice({ type: 'error', text: 'Complete all required fields and select at least one notification channel.' });
            return;
        }

        // Validate email is required when email channel is selected
        if (hasEmailChannel && !emails.length) {
            setNotice({ type: 'error', text: 'At least one email address is required when Email notification is selected.' });
            return;
        }

        // Validate telegram chat IDs are required when telegram channel is selected
        if (hasTelegramChannel && !chats.length) {
            setNotice({ type: 'error', text: 'At least one Telegram chat ID is required when Telegram notification is selected.' });
            return;
        }
        setIsSubmitting(true);
        setNotice({ type: '', text: '' });
        const downPayment = Number(form.down_payment || 0);
        const emiMonths = Number(form.emi_months || 0);
        if (
            form.payment_type === 'emi' &&
            (!downPayment || downPayment <= 0 || downPayment >= amount)
        ) {
            setNotice({
                type: 'error',
                text: 'For EMI payments, the down payment must be greater than 0 and less than the total amount.',
            });
            setIsSubmitting(false);
            return;
        }

        // Validate EMI months
        if (form.payment_type === 'emi' && (!emiMonths || emiMonths < 1)) {
            setNotice({
                type: 'error',
                text: 'For EMI payments, the number of months must be at least 1.',
            });
            setIsSubmitting(false);
            return;
        }
        try {
            await paymentApi.create({
                ...form,
                title: form.title.trim(),
                description: form.description.trim(),
                amount,
                currency: form.currency,
                payment_type: form.payment_type,
                down_payment: form.payment_type === 'emi' ? downPayment : 0,
                emi_months: form.payment_type === 'emi' ? emiMonths : 0,
                due_date: new Date(form.due_date).toISOString(),
                recipient_name: form.recipient_name.trim(),
                recipient_emails: emails,
                telegram_chat_ids: chats,
            });
            setForm(emptyForm);
            setNotice({ type: 'success', text: 'Payment created successfully.' });
            await loadPayments();
        } catch (error) {
            setNotice({ type: 'error', text: messageFrom(error) });
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateStatus = async (payment, status) => {
        const id = paymentId(payment);
        if (!id) return;
        setBusyId(id);
        setNotice({ type: '', text: '' });
        try {
            await paymentApi.updateStatus(id, status);
            setNotice({ type: 'success', text: `Payment marked ${status}.` });
            await loadPayments();
        } catch (error) {
            setNotice({ type: 'error', text: messageFrom(error) });
        } finally {
            setBusyId(null);
        }
    };

    const removePayment = async (payment) => {
        const id = paymentId(payment);
        if (!id || !window.confirm(`Delete ${payment.title || 'this payment'}?`)) return;
        setBusyId(id);
        try {
            await paymentApi.remove(id);
            setNotice({ type: 'success', text: 'Payment deleted.' });
            await loadPayments();
        } catch (error) {
            setNotice({ type: 'error', text: messageFrom(error) });
        } finally {
            setBusyId(null);
        }
    };

    const toggleNotification = (name) => setNotificationSettings((current) => ({ ...current, [name]: !current[name] }));

    return (
        <>
            <div className="-min-h-screen -bg-[#f7f7f8] -text-[#202123]">
                <div className="-flex -min-h-screen -w-screen">
                    {/* Navigation Sidebar */}
                    <aside className="-hidden md:-flex -w-[260px] -shrink-0 -flex-col -border-r -border-[#e5e5e5] -bg-[#f7f7f8]">
                        <div className="-flex -h-full -flex-col -px-3 -py-3">
                            <div className="-mb-1 -flex -items-center -gap-2 -px-3 -py-3">
                                <div className="-grid -h-8 -w-8 -place-items-center -rounded-lg -bg-[#202123] -text-white">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 3a9 9 0 1 0 9 9" />
                                        <path d="M12 3a9 9 0 0 1 9 9" />
                                        <path d="M12 3v18" />
                                    </svg>
                                </div>
                                <span className="-text-[15px] -font-semibold">Payments</span>
                            </div>

                            <div
                                type="button"
                                onClick={() => setActiveTab('dashboard')}
                                className="-mt-1 -flex -w-full -items-center -gap-3 -rounded-lg -px-3 -py-2.5 -text-left -text-sm -font-medium -text-[#2f2f2f] hover:-bg-[#ececec]"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="7" height="7" rx="1" />
                                    <rect x="14" y="3" width="7" height="7" rx="1" />
                                    <rect x="3" y="14" width="7" height="7" rx="1" />
                                    <rect x="14" y="14" width="7" height="7" rx="1" />
                                </svg>
                                Dashboard
                            </div>

                            <div className="-mt-1 -px-3 -pb-2 -pt-5 -text-[11px] -font-semibold -uppercase -tracking-wider -text-[#8e8e8e]">
                                Manage
                            </div>

                            {[
                                ['payments', 'Payments', 'card'],
                                ['emi', 'EMI payments', 'repeat'],
                                ['config', 'Configuration', 'settings'],
                            ].map(([tab, label, icon]) => (
                                <div
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    className={`-mb-0.5 -flex -w-full -items-center -gap-3 -rounded-lg -px-3 -py-2.5 -text-left -text-sm -transition-colors hover:-bg-[#ececec] ${activeTab === tab
                                        ? '-bg-[#e5e5e5] -font-semibold -text-[#202123]'
                                        : '-font-medium -text-[#555]'
                                        }`}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        {icon === 'card' && <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /></>}
                                        {icon === 'repeat' && <><path d="M17 2l4 4-4 4" /><path d="M3 11V9a3 3 0 0 1 3-3h15" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a3 3 0 0 1-3 3H3" /></>}
                                        {icon === 'settings' && <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.6h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V4h2.6v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.6h-.2a1.7 1.7 0 0 0-1.6 1z" /></>}
                                    </svg>
                                    {label}
                                </div>
                            ))}

                            <div className="-flex-1" />

                            <div className="-border-t -border-[#e5e5e5] -pt-3">
                                <div
                                    type="button"
                                    onClick={handleMenuOpen}
                                    disabled={isLoggingOut}
                                    className="-flex -w-full -items-center -gap-3 -rounded-lg -px-3 -py-2.5 -text-left -text-sm -font-medium -text-[#555] hover:-bg-[#ececec] disabled:-opacity-50"
                                >
                                    <div className="-grid -h-7 -w-7 -place-items-center -rounded-full -bg-[#d9d9d9] -text-xs -font-bold -text-[#444]">
                                        {(user?.name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="-min-w-0 -flex-1">
                                        <div className="-truncate -font-medium">{user?.name || 'User'}</div>
                                        <div className="-truncate -text-xs -text-[#8e8e8e]">{user?.email || ''}</div>
                                    </div>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </div>
                                {anchorEl && (
                                    <div className="payment-dashboard__profile-menu" role="menu">
                                        <div className="payment-dashboard__profile-menu-name">{user?.name || 'User'}</div>
                                        <div className="payment-dashboard__profile-menu-email">{user?.email || ''}</div>
                                        <div type="button" onClick={handleLogout} disabled={isLoggingOut} role="menuitem">
                                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    <main className="-min-w-0 -flex-1">
                        {/* Mobile Header */}
                        <header className="-sticky -top-0 -z-10 -border-b -border-[#e5e5e5] -bg-[#f7f7f8]/95 -backdrop-blur md:-hidden">
                            <div className="-flex -items-center -justify-between -px-4 -py-3">
                                <span className="-text-sm -font-semibold">Payments</span>
                                <div
                                    type="button"
                                    onClick={handleMenuOpen}
                                    className="-rounded-full -bg-[#e5e5e5] -px-3 -py-1.5 -text-xs -font-semibold"
                                >
                                    {user?.name || 'Account'}
                                </div>
                                {anchorEl && (
                                    <div className="payment-dashboard__profile-menu payment-dashboard__profile-menu--mobile" role="menu">
                                        <div type="button" onClick={handleLogout} disabled={isLoggingOut} role="menuitem">
                                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </header>

                        <div className="-mx-auto -w-full -max-w-[1200px] -px-4 -py-6 sm:-px-6 lg:-px-10 lg:-py-8">
                            <header className="-mb-7 -flex -items-start -justify-between -gap-6">
                                <div>
                                    <div className="-mb-1 -text-xs -font-semibold -uppercase -tracking-wider -text-[#8e8e8e]">
                                        Payment control desk
                                    </div>
                                    <h1 className="-text-2xl -font-semibold -tracking-tight -text-[#202123] sm:-text-3xl">
                                        {activeTab === 'dashboard'
                                            ? 'Overview & Pending Items'
                                            : activeTab === 'payments'
                                                ? 'Payments'
                                                : activeTab === 'emi'
                                                    ? 'EMI Payments'
                                                    : 'Configuration'}
                                    </h1>
                                    <p className="-mt-1 -max-w-2xl -text-sm -leading-6 -text-[#6b6b6b]">
                                        Track due payments, reminders, recipients, and notification channels in one place.
                                    </p>
                                </div>
                            </header>

                            <div className="-mt-5 -mb-7 -flex -gap-1 -overflow-x-auto -border-b -border-[#e5e5e5]">
                                {[
                                    ['dashboard', 'Overview'],
                                    ['payments', 'Payments'],
                                    ['emi', 'EMI'],
                                    ['config', 'Settings'],
                                ].map(([tab, label]) => (
                                    <div
                                        key={tab}
                                        type="button"
                                        onClick={() => setActiveTab(tab)}
                                        className={`-relative -whitespace-nowrap -px-3 -py-3 -text-sm -transition-colors ${activeTab === tab
                                            ? '-font-semibold -text-[#202123]'
                                            : '-font-medium -text-[#8e8e8e] hover:-text-[#444]'
                                            }`}
                                    >
                                        {label}
                                        {activeTab === tab && (
                                            <span className="-absolute -bottom-[-1px] -left-2 -right-2 -h-0.5 -rounded-full -bg-[#202123]" />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {activeTab !== 'config' && (
                                <section className="-mt-2">
                                    {activeTab === 'dashboard' && (
                                        <div className="-mb-4 -grid -grid-cols-2 -gap-3 lg:-grid-cols-5">
                                            {[
                                                ['Total payments', summary.total, 'neutral'],
                                                ['Pending', summary.pending, 'amber'],
                                                ['Paid', summary.paid, 'green'],
                                                ['Overdue', summary.overdue, 'red'],
                                                ['Pending amount', formatAmount(summary.amount), 'blue'],
                                            ].map(([label, value, tone]) => (
                                                <div key={label} className="-rounded-xl -border -border-[#e5e5e5] -bg-white -p-4 -shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
                                                    <div className="-flex -items-center -justify-between">
                                                        <span className="-text-xs -font-medium -text-[#737373]">{label}</span>
                                                        <span className={`-h-2 -w-2 -rounded-full ${tone === 'amber' ? '-bg-amber-400' :
                                                            tone === 'green' ? '-bg-emerald-500' :
                                                                tone === 'red' ? '-bg-red-500' :
                                                                    tone === 'blue' ? '-bg-blue-500' : '-bg-[#b5b5b5]'
                                                            }`} />
                                                    </div>
                                                    <strong className="-mt-1 -block -text-xl -font-semibold -tracking-tight">{value}</strong>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="-mt-6 -mb-5 -flex -flex-col -gap-3 sm:-flex-row sm:-items-end sm:-justify-between">
                                        <div>
                                            <h2 className="-text-lg -font-semibold -tracking-tight">
                                                {activeTab === 'dashboard'
                                                    ? 'Pending Payments Overview'
                                                    : activeTab === 'emi'
                                                        ? 'All EMI Payments'
                                                        : 'Payment Records'}
                                            </h2>
                                            <p className="-mt-0.5 -text-xs -text-[#8e8e8e]">
                                                {isLoading ? 'Loading payments...' : `${tabPayments.length} ${tabPayments.length === 1 ? 'record' : 'records'}`}
                                            </p>
                                        </div>
                                        <div className="-flex -w-fit -rounded-lg -border -border-[#e5e5e5] -bg-white -p-1">
                                            {filters.map((item) => (
                                                <div
                                                    key={item}
                                                    type="button"
                                                    onClick={() => setFilter(item)}
                                                    className={`-rounded-md -px-3 -py-1.5 -text-xs -font-medium -capitalize -transition-colors ${filter === item
                                                        ? '-bg-[#202123] -text-white'
                                                        : '-text-[#737373] hover:-bg-[#f0f0f0]'
                                                        }`}
                                                >
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {notice.text && (
                                        <div className={`-mb-4 -rounded-lg -border -px-4 -py-3 -text-sm ${notice.type === 'error'
                                            ? '-border-red-200 -bg-red-50 -text-red-700'
                                            : '-border-emerald-200 -bg-emerald-50 -text-emerald-700'
                                            }`} role="alert">
                                            {notice.text}
                                        </div>
                                    )}

                                    {isLoading && (
                                        <div className="-rounded-xl -border -border-[#e5e5e5] -bg-white -p-10 -text-center -text-sm -text-[#8e8e8e]">
                                            Loading payments...
                                        </div>
                                    )}

                                    {!isLoading && !tabPayments.length && (
                                        <div className="-rounded-xl -border -border-dashed -border-[#d4d4d4] -bg-white -p-12 -text-center">
                                            <div className="-mx-auto -mb-2 -grid -h-10 -w-10 -place-items-center -rounded-full -bg-[#f0f0f0] -text-[#737373]">$</div>
                                            <p className="-text-sm -font-medium">No {activeTab === 'emi' ? 'EMI' : filter === 'all' ? '' : filter} payments found.</p>
                                            <p className="-mt-1 -text-xs -text-[#8e8e8e]">Create a payment to start tracking reminders.</p>
                                        </div>
                                    )}

                                    <div className="-space-y-2">
                                        {tabPayments.map((payment) => {
                                            const id = paymentId(payment);
                                            const emails = getRecipients(payment, 'recipient_emails', 'recipient_email');
                                            const chats = getRecipients(payment, 'telegram_chat_ids', 'telegram_chat_id');
                                            const isOverdue = payment.status === 'pending' && dateValue(payment.due_date) < Date.now();
                                            const isDueSoon = payment.status === 'pending' && !isOverdue && dateValue(payment.due_date) < Date.now() + 172800000;
                                            const emi = isEmiPayment(payment);

                                            return (
                                                <article
                                                    key={id || payment.title}
                                                    className={`-group -rounded-xl -border -bg-white -p-4 -transition-all hover:-border-[#cfcfcf] hover:-shadow-[0_4px_14px_rgba(0,0,0,0.06)] ${isOverdue ? '-border-red-200' : isDueSoon ? '-border-amber-200' : '-border-[#e5e5e5]'
                                                        }`}
                                                >
                                                    <div className="-flex -flex-col -gap-4 lg:-flex-row lg:-items-center">
                                                        <div className="-flex -min-w-0 -flex-1 -items-center -gap-3">
                                                            <div className={`-grid -h-10 -w-10 -shrink-0 -place-items-center -rounded-lg -text-sm -font-semibold ${isOverdue ? '-bg-red-50 -text-red-600' : isDueSoon ? '-bg-amber-50 -text-amber-600' : '-bg-[#f0f0f0] -text-[#555]'
                                                                }`}>
                                                                $
                                                            </div>
                                                            <div className="-min-w-0">
                                                                <div className="-flex -items-center -gap-2">
                                                                    <span className="-truncate -text-sm -font-semibold">{payment.title || 'Untitled payment'}</span>
                                                                    {emi && (
                                                                        <span className="-rounded -bg-blue-50 -px-1.5 -py-0.5 -text-[10px] -font-bold -text-blue-600">
                                                                            EMI
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="-mt-0.5 -truncate -text-xs -text-[#737373]">
                                                                    {payment.recipient_name || 'No recipient'} · {formatDate(payment.due_date)}
                                                                </div>
                                                                <div className="-mt-0.5 -truncate -text-xs -text-[#9a9a9a]">
                                                                    {emails.join(', ') || 'No email'}{chats.length ? ` · Telegram: ${chats.join(', ')}` : ''}
                                                                </div>
                                                                {/* Last Notification Sent metadata display for EMI pending students */}
                                                                {emi && payment.status === 'pending' && (
                                                                    <div className="-mt-1.5 -flex -items-center -gap-1.5 -text-[11px] -text-indigo-600">
                                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                                                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                                                        </svg>
                                                                        <span>
                                                                            Last notification: {payment.notification_sent_at ? formatDate(payment.notification_sent_at) : 'Not sent yet'}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="-flex -items-center -gap-3 lg:-min-w-[260px] lg:-justify-end">
                                                            <div className="-text-right">
                                                                <strong className="-block -text-sm -font-semibold">{formatAmount(payment.amount, payment.currency)}</strong>
                                                                {emi && Boolean(payment.down_payment) && (
                                                                    <span className="-text-[11px] -text-[#8e8e8e]">
                                                                        Down: {formatAmount(payment.down_payment, payment.currency)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className={`-rounded-full -px-2.5 -py-1 -text-[11px] -font-semibold -capitalize ${payment.status === 'paid'
                                                                ? '-bg-emerald-50 -text-emerald-700'
                                                                : payment.status === 'cancelled'
                                                                    ? '-bg-[#f0f0f0] -text-[#737373]'
                                                                    : isOverdue
                                                                        ? '-bg-red-50 -text-red-700'
                                                                        : '-bg-amber-50 -text-amber-700'
                                                                }`}>
                                                                {payment.status || 'pending'}
                                                            </span>
                                                            <span className="-hidden -text-xs -text-[#9a9a9a] xl:-inline">
                                                                {(payment.notification_channels || []).join(' + ') || 'No channel'}
                                                            </span>
                                                        </div>

                                                        <div className="-flex -items-center -gap-1 lg:-justify-end">
                                                            {payment.status !== 'paid' && (
                                                                <div
                                                                    type="button"
                                                                    onClick={() => updateStatus(payment, 'paid')}
                                                                    disabled={busyId === id}
                                                                    className="-rounded-md -px-2.5 -py-1.5 -text-xs -font-medium -text-emerald-700 hover:-bg-emerald-50 disabled:-opacity-50"
                                                                >
                                                                    Mark paid
                                                                </div>
                                                            )}
                                                            {payment.status !== 'cancelled' && (
                                                                <div
                                                                    type="button"
                                                                    onClick={() => updateStatus(payment, 'cancelled')}
                                                                    disabled={busyId === id}
                                                                    className="-rounded-md -px-2.5 -py-1.5 -text-xs -font-medium -text-[#737373] hover:-bg-[#f0f0f0] disabled:-opacity-50"
                                                                >
                                                                    Cancel
                                                                </div>
                                                            )}
                                                            <div
                                                                type="button"
                                                                onClick={() => removePayment(payment)}
                                                                disabled={busyId === id}
                                                                aria-label="Delete payment"
                                                                className="-rounded-md -p-2 -text-[#a0a0a0] hover:-bg-red-50 hover:-text-red-600 disabled:-opacity-50"
                                                            >
                                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            {activeTab === 'payments' && (
                                <section className="-mt-6 -rounded-xl -border -border-[#e5e5e5] -bg-white -p-5 -shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:-p-6">
                                    <div className="-mb-6">
                                        <h2 className="-text-lg -font-semibold">Add payment</h2>
                                        <p className="-mt-1 -text-sm -text-[#737373]">Create a reminder with multiple recipients and notification channels.</p>
                                    </div>

                                    <form className="-grid -grid-cols-1 -gap-5 md:-grid-cols-2">
                                        {[
                                            ['title', 'Title *', 'text', 'Hosting invoice'],
                                            ['description', 'Description', 'textarea', 'Monthly hosting'],
                                            ['amount', 'Amount *', 'number', '0.00'],
                                            ['currency', 'Currency *', 'text', 'USD'],
                                            ['due_date', 'Due date and time *', 'datetime-local', ''],
                                            ['recipient_name', 'Recipient name *', 'text', 'Student / client name'],
                                        ].map(([name, label, type, placeholder]) => (
                                            <div key={name} className={name === 'title' || name === 'description' ? 'md:-col-span-2' : ''}>
                                                <label htmlFor={`payment-${name}`} className="-mb-1.5 -block -text-xs -font-semibold -text-[#555]">{label}</label>
                                                {type === 'textarea' ? (
                                                    <textarea
                                                        id={`payment-${name}`}
                                                        name={name}
                                                        value={form[name]}
                                                        onChange={changeField}
                                                        placeholder={placeholder}
                                                        className="-min-h-24 -w-full -resize-y -rounded-lg -border -border-[#d9d9d9] -bg-white -px-3 -py-2.5 -text-sm -outline-none focus:-border-[#888] focus:-ring-2 focus:-ring-[#000]/5"
                                                    />
                                                ) : (
                                                    <input
                                                        id={`payment-${name}`}
                                                        name={name}
                                                        type={type}
                                                        min={name === 'amount' ? '0.01' : undefined}
                                                        step={name === 'amount' ? '0.01' : undefined}
                                                        maxLength={name === 'currency' ? 3 : undefined}
                                                        value={form[name]}
                                                        onChange={name === 'currency' ? changeCurrency : changeField}
                                                        required={['title', 'amount', 'currency', 'due_date', 'recipient_name'].includes(name)}
                                                        placeholder={placeholder}
                                                        className="-h-10 -w-full -rounded-lg -border -border-[#d9d9d9] -bg-white -px-3 -text-sm -outline-none focus:-border-[#888] focus:-ring-2 focus:-ring-[#000]/5"
                                                    />
                                                )}
                                            </div>
                                        ))}

                                        {/* Payment Type Selection */}
                                        <div>
                                            <label
                                                htmlFor="payment-payment_type"
                                                className="-mb-1.5 -block -text-xs -font-semibold -text-[#555]"
                                            >
                                                Payment type *
                                            </label>

                                            <select
                                                id="payment-payment_type"
                                                name="payment_type"
                                                value={form.payment_type}
                                                onChange={changeField}
                                                className="-h-10 -w-full -rounded-lg -border -border-[#d9d9d9] -bg-white -px-3 -text-sm -outline-none focus:-border-[#888] focus:-ring-2 focus:-ring-[#000]/5"
                                            >
                                                <option value="full">Full payment</option>
                                                <option value="emi">EMI</option>
                                            </select>
                                        </div>

                                        {/* Down Payment Field (shown when payment_type is 'emi') */}
                                        {form.payment_type === 'emi' && (
                                            <div>
                                                <label
                                                    htmlFor="payment-down_payment"
                                                    className="-mb-1.5 -block -text-xs -font-semibold -text-[#555]"
                                                >
                                                    Down payment *
                                                </label>

                                                <input
                                                    id="payment-down_payment"
                                                    name="down_payment"
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    max={form.amount || undefined}
                                                    value={form.down_payment}
                                                    onChange={changeField}
                                                    placeholder="0.00"
                                                    required
                                                    className="-h-10 -w-full -rounded-lg -border -border-[#d9d9d9] -bg-white -px-3 -text-sm -outline-none focus:-border-[#888] focus:-ring-2 focus:-ring-[#000]/5"
                                                />

                                                {form.amount && form.down_payment && (
                                                    <p className="-mt-1 -text-xs -text-[#8e8e8e]">
                                                        Remaining: {formatAmount(
                                                            Math.max(
                                                                0,
                                                                Number(form.amount) - Number(form.down_payment)
                                                            ),
                                                            form.currency
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* EMI Months Field (shown when payment_type is 'emi') */}
                                        {form.payment_type === 'emi' && (
                                            <div>
                                                <label
                                                    htmlFor="payment-emi_months"
                                                    className="-mb-1.5 -block -text-xs -font-semibold -text-[#555]"
                                                >
                                                    Number of months (EMI) *
                                                </label>

                                                <input
                                                    id="payment-emi_months"
                                                    name="emi_months"
                                                    type="number"
                                                    min="1"
                                                    step="1"
                                                    value={form.emi_months}
                                                    onChange={changeField}
                                                    placeholder="e.g., 6, 12, 24"
                                                    required
                                                    className="-h-10 -w-full -rounded-lg -border -border-[#d9d9d9] -bg-white -px-3 -text-sm -outline-none focus:-border-[#888] focus:-ring-2 focus:-ring-[#000]/5"
                                                />

                                                {form.amount && form.down_payment && form.emi_months && (
                                                    <p className="-mt-1 -text-xs -text-[#8e8e8e]">
                                                        Monthly EMI: {formatAmount(
                                                            Math.max(
                                                                0,
                                                                (Number(form.amount) - Number(form.down_payment)) / Number(form.emi_months)
                                                            ),
                                                            form.currency
                                                        )} / month
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        <div className="md:-col-span-2">
                                            <label className="-mb-1.5 -block -text-xs -font-semibold -text-[#555]">Notification channels *</label>
                                            <div className="-flex -flex-wrap -gap-2">
                                                {['email', 'telegram'].map((channel) => (
                                                    <label key={channel} className={`-flex -cursor-pointer -items-center -gap-2 -rounded-lg -border -px-3 -py-2 -text-sm ${form.notification_channels.includes(channel) ? '-border-[#202123] -bg-[#f7f7f7] -font-medium' : '-border-[#d9d9d9]'
                                                        }`}>
                                                        <input
                                                            type="checkbox"
                                                            value={channel}
                                                            checked={form.notification_channels.includes(channel)}
                                                            onChange={changeChannel}
                                                        />
                                                        {channel === 'email' ? 'Email' : 'Telegram'}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        {form.notification_channels.includes('email') && (
                                            <div className="md:-col-span-2">
                                                <label className="-mb-1.5 -block -text-xs -font-semibold -text-[#555]">Recipient emails *</label>
                                                {form.recipient_emails.map((email, index) => (
                                                    <div className="-mb-2 -flex -gap-2" key={`email-${index}`}>
                                                        <input
                                                            type="email"
                                                            value={email}
                                                            onChange={(event) => changeArray('recipient_emails', index, event.target.value)}
                                                            placeholder="finance@example.com"
                                                            required={index === 0}
                                                            className="-h-10 -min-w-0 -flex-1 -rounded-lg -border -border-[#d9d9d9] -px-3 -text-sm focus:-border-[#888] -outline-none"
                                                        />
                                                        <div
                                                            type="button"
                                                            onClick={() => removeArrayItem('recipient_emails', index)}
                                                            className="-rounded-lg -flex -justify-center -items-center -px-3 -text-xs -font-medium -text-[#777] hover:-bg-[#f0f0f0]"
                                                        >
                                                            Remove
                                                        </div>
                                                    </div>
                                                ))}
                                                <div
                                                    type="button"
                                                    onClick={() => addArrayItem('recipient_emails')}
                                                    className="-mt-1 -text-xs -font-semibold -text-[#555] hover:-text-black"
                                                >
                                                    + Add email
                                                </div>
                                            </div>
                                        )}

                                        {form.notification_channels.includes('telegram') && (
                                            <div className="md:-col-span-2">
                                                <label className="-mb-1.5 -block -text-xs -font-semibold -text-[#555]">Telegram chat IDs *</label>
                                                {form.telegram_chat_ids.map((chat, index) => (
                                                    <div className="-mb-2 -flex -gap-2" key={`chat-${index}`}>
                                                        <input
                                                            value={chat}
                                                            onChange={(event) => changeArray('telegram_chat_ids', index, event.target.value)}
                                                            placeholder="123456789"
                                                            required={index === 0}
                                                            className="-h-10 -min-w-0 -flex-1 -rounded-lg -border -border-[#d9d9d9] -px-3 -text-sm focus:-border-[#888] -outline-none"
                                                        />
                                                        <div
                                                            type="button"
                                                            onClick={() => removeArrayItem('telegram_chat_ids', index)}
                                                            className="-rounded-lg -flex -justify-center -items-center -px-3 -text-xs -font-medium -text-[#777] hover:-bg-[#f0f0f0]"
                                                        >
                                                            Remove
                                                        </div>
                                                    </div>
                                                ))}
                                                <div
                                                    type="button"
                                                    onClick={() => addArrayItem('telegram_chat_ids')}
                                                    className="-mt-1 -text-xs -font-semibold -text-[#555] hover:-text-black"
                                                >
                                                    + Add chat ID
                                                </div>
                                            </div>
                                        )}

                                        <div className="-flex -justify-end -gap-2 md:-col-span-2">
                                            <div type="button" onClick={() => setForm(emptyForm)} className="-rounded-lg -border -border-[#d9d9d9] -px-4 -py-2 -text-sm -font-medium hover:-bg-[#f5f5f5]">Clear</div>
                                            <div type="submit" disabled={isSubmitting} onClick={submitPayment} className="-rounded-lg -bg-[#202123] -px-4 -py-2 -text-sm -font-medium -text-white hover:-bg-[#000] disabled:-opacity-50">
                                                {isSubmitting ? 'Saving...' : 'Save payment'}
                                            </div>
                                        </div>
                                    </form>
                                </section>
                            )}

                            {activeTab === 'config' && (
                                <section className="-rounded-xl -border -border-[#e5e5e5] -bg-white -p-5 -shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:-p-6">
                                    <div className="-mb-6">
                                        <h2 className="-text-lg -font-semibold">Notification configuration</h2>
                                        <p className="-mt-1 -text-sm -text-[#737373]">Choose how payment reminders should reach you.</p>
                                    </div>

                                    <div className="-grid -grid-cols-1 -gap-3 md:-grid-cols-2">
                                        {[
                                            ['email', 'Gmail / Email', 'Receive payment reminders by email.', 'G'],
                                            ['telegram', 'Telegram', 'Receive reminders through Telegram chats.', 'T'],
                                        ].map(([key, title, description, icon]) => (
                                            <article key={key} className="-flex -items-center -justify-between -rounded-xl -border -border-[#e5e5e5] -p-4">
                                                <div className="-flex -items-center -gap-3">
                                                    <span className="-grid -h-10 -w-10 -place-items-center -rounded-lg -bg-[#f0f0f0] -text-sm -font-bold">{icon}</span>
                                                    <div>
                                                        <h3 className="-text-sm -font-semibold">{title}</h3>
                                                        <p className="-mt-0.5 -text-xs -text-[#737373]">{description}</p>
                                                    </div>
                                                </div>
                                                <label className="-relative -inline-flex -h-6 -w-11 -cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="-peer -sr-only"
                                                        checked={notificationSettings[key]}
                                                        onChange={() => toggleNotification(key)}
                                                    />
                                                    <span className="-h-6 -w-11 -rounded-full -bg-[#d4d4d4] after:-absolute after:-left-[2px] after:-top-[2px] after:-h-7 after:-w-7 after:-rounded-full after:-border after:-border-[#ddd] after:-bg-white after:-transition-all peer-checked:-bg-[#202123] peer-checked:after:-translate-x-0 peer-checked:after:-translate-y-0" />
                                                </label>
                                            </article>
                                        ))}

                                        <article className="-rounded-xl -border -border-[#e5e5e5] -p-4 md:-col-span-2">
                                            <h3 className="-text-sm -font-semibold">Reminder timing</h3>
                                            <p className="-mt-0.5 -text-xs -text-[#737373]">Show visual alerts for payments that need attention.</p>
                                            <div className="-mt-4 -flex -flex-wrap -gap-4 -text-sm">
                                                <label className="-flex -items-center -gap-2">
                                                    <input type="checkbox" checked={notificationSettings.dueSoon} onChange={() => toggleNotification('dueSoon')} />
                                                    Due within 48 hours
                                                </label>
                                                <label className="-flex -items-center -gap-2">
                                                    <input type="checkbox" checked={notificationSettings.overdue} onChange={() => toggleNotification('overdue')} />
                                                    Overdue payments
                                                </label>
                                            </div>
                                        </article>
                                    </div>

                                    <p className="-mt-5 -border-t -border-[#e5e5e5] -pt-4 -text-xs -leading-5 -text-[#8e8e8e]">
                                        Gmail SMTP credentials and the Telegram bot token are managed by the backend worker and are never stored in this browser.
                                    </p>
                                </section>
                            )}
                        </div>
                    </main>
                </div>
            </div>

            <ToastMessage
                open={toast.open}
                message={toast.message}
                severity={toast.severity}
                onClose={handleToastClose}
            />
        </>
    );
};

export default DashboardPage;