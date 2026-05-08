import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCreditCard,
  faWallet,
  faMoneyBill,
  faXmark,
  faCheck,
  faLock,
  faShieldHalved,
  faCrown,
  faExclamationCircle,
  faCalendarCheck,
  faClock,
  faDumbbell,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "../utils/api";
import "../css/paymentModal.css";

/* ─── Types ─────────────────────────────── */
export interface PaymentBooking {
  id: number | string;
  type?: 'trainer' | 'subscription' | 'class';
  trainerName?: string;
  trainerAvatar?: string;
  trainerSpecialty?: string;
  scheduledAt?: string;
  durationMins?: number;
  totalPrice: number | string;
  paymentStatus?: string;
  status?: string;
  // Subscription specific
  planName?: string;
  planId?: string;
  billingCycle?: string;
}

interface Props {
  booking: PaymentBooking;
  onClose: () => void;
  onPaid: (id: any) => void;
}

type Method = "card" | "wallet" | "cash";

/* ─── Helpers ────────────────────────────── */
function formatCardNumber(val: string) {
  return val
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function formatExpiry(val: string) {
  const clean = val.replace(/\D/g, "").slice(0, 4);
  if (clean.length >= 3) return `${clean.slice(0, 2)}/${clean.slice(2)}`;
  return clean;
}

function maskCardNumber(num: string) {
  const digits = num.replace(/\s/g, "");
  if (digits.length === 0) return "•••• •••• •••• ••••";
  const padded = digits.padEnd(16, "•");
  return `${padded.slice(0, 4)} ${padded.slice(4, 8)} ${padded.slice(8, 12)} ${padded.slice(12, 16)}`;
}

function detectNetwork(num: string): string {
  const d = num.replace(/\D/g, "");
  if (d.startsWith("4")) return "💳 VISA";
  if (d.startsWith("5")) return "💳 MC";
  if (d.startsWith("3")) return "💳 AMEX";
  return "💳";
}

function formatDate(iso: string) {
  if (!iso) return "N/A";
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ─── Component ──────────────────────────── */
export default function PaymentModal({ booking, onClose, onPaid }: Props) {
  const [method, setMethod] = useState<Method>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txnRef, setTxnRef] = useState("");

  const isCardValid =
    method !== "card" ||
    (cardNumber.replace(/\s/g, "").length === 16 &&
      cardName.trim().length > 1 &&
      expiry.length === 5 &&
      cvv.length >= 3);

  const handlePay = async () => {
    if (method === "card" && !isCardValid) {
      setError("Please fill in all card details correctly.");
      return;
    }
    setError(null);
    setPaying(true);

    try {
      const ref = `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
      
      const cleanPrice = typeof booking.totalPrice === 'string' 
        ? parseFloat(booking.totalPrice.replace(/[$,]/g, '')) 
        : booking.totalPrice;

      if (booking.type === 'subscription') {
        await api.post("/api/subscriptions", {
          plan: booking.planId,
          billingCycle: booking.billingCycle,
          paymentMethod: method,
          transactionRef: ref,
          amount: cleanPrice
        });
      } else {
        await api.patch(`/api/trainer-bookings/${booking.id}/pay`, {
          transactionRef: ref,
          method,
        });
      }

      setTxnRef(ref);
      setSuccess(true);
      onPaid(booking.id);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Payment failed. Please check your details and try again."
      );
    } finally {
      setPaying(false);
    }
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="pm-overlay" onClick={onClose}>
        <div className="pm-modal pm-modal-wide" onClick={(e) => e.stopPropagation()}>
          <div className="pm-success">
            <div className="pm-success-icon">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <h3>Payment Successful!</h3>
            <p>
              {booking.type === 'subscription' ? (
                <>Your <strong>{booking.planName}</strong> subscription is now active.</>
              ) : (
                <>
                  Your session with <strong>{booking.trainerName}</strong> on{" "}
                  <strong>{formatDate(booking.scheduledAt || "")}</strong> is confirmed and paid.
                </>
              )}
            </p>
            <div className="pm-success-ref">{txnRef}</div>
            <button className="pm-success-close" onClick={() => onPaid(booking.id)}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal pm-modal-wide" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="pm-header">
          <div className="pm-header-icon">
            <FontAwesomeIcon icon={faCreditCard} />
          </div>
          <div className="pm-header-text">
            <h2>Complete Payment</h2>
            <p>Secure checkout for your {booking.type === 'subscription' ? 'membership' : 'training session'}</p>
          </div>
          <button className="pm-close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="pm-body">
          {/* ── Summary ── */}
          <div className="pm-summary">
            {booking.type === 'subscription' ? (
              <>
                <div className="pm-summary-row">
                  <span className="pm-summary-label">
                    <FontAwesomeIcon icon={faCrown} /> Plan
                  </span>
                  <span className="pm-summary-value">{booking.planName}</span>
                </div>
                <div className="pm-summary-row">
                  <span className="pm-summary-label">
                    <FontAwesomeIcon icon={faCalendarCheck} /> Billing
                  </span>
                  <span className="pm-summary-value" style={{ textTransform: 'capitalize' }}>{booking.billingCycle}</span>
                </div>
              </>
            ) : (
              <>
                <div className="pm-summary-row">
                  <span className="pm-summary-label">
                    <FontAwesomeIcon icon={faUser} /> Trainer
                  </span>
                  <span className="pm-summary-value">{booking.trainerName}</span>
                </div>
                <div className="pm-summary-row">
                  <span className="pm-summary-label">
                    <FontAwesomeIcon icon={faCalendarCheck} /> Session
                  </span>
                  <span className="pm-summary-value">{formatDate(booking.scheduledAt || "")}</span>
                </div>
                <div className="pm-summary-row">
                  <span className="pm-summary-label">
                    <FontAwesomeIcon icon={faClock} /> Duration
                  </span>
                  <span className="pm-summary-value">{booking.durationMins} min</span>
                </div>
                <div className="pm-summary-row">
                  <span className="pm-summary-label">
                    <FontAwesomeIcon icon={faDumbbell} /> Specialty
                  </span>
                  <span className="pm-summary-value">{booking.trainerSpecialty || "Personal Training"}</span>
                </div>
              </>
            )}
            <hr className="pm-summary-divider" />
            <div className="pm-summary-total">
              <span className="pm-total-label">Total Due</span>
              <span className="pm-total-amount">${(Number(booking.totalPrice) || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* ── Payment Method ── */}
          <span className="pm-method-label">Payment Method</span>
          <div className="pm-methods">
            <button
              className={`pm-method-btn ${method === "card" ? "active" : ""}`}
              onClick={() => setMethod("card")}
            >
              <FontAwesomeIcon icon={faCreditCard} />
              Card
            </button>
            <button
              className={`pm-method-btn ${method === "wallet" ? "active" : ""}`}
              onClick={() => setMethod("wallet")}
            >
              <FontAwesomeIcon icon={faWallet} />
              Wallet
            </button>
            <button
              className={`pm-method-btn ${method === "cash" ? "active" : ""}`}
              onClick={() => setMethod("cash")}
            >
              <FontAwesomeIcon icon={faMoneyBill} />
              Cash
            </button>
          </div>

          {/* ── Card Form ── */}
          {method === "card" && (
            <>
              {/* Visual card preview */}
              <div className="pm-card-visual">
                <div className="pm-card-chip" />
                <div className="pm-card-number-display">
                  {maskCardNumber(cardNumber)}
                </div>
                <div className="pm-card-row-bottom">
                  <div>
                    <div className="pm-card-label-sm">Card Holder</div>
                    <div className="pm-card-value-sm">
                      {cardName || "YOUR NAME"}
                    </div>
                  </div>
                  <div>
                    <div className="pm-card-label-sm">Expires</div>
                    <div className="pm-card-value-sm">{expiry || "MM/YY"}</div>
                  </div>
                  <div className="pm-card-network">
                    {detectNetwork(cardNumber)}
                  </div>
                </div>
              </div>

              <div className="pm-card-form">
                <div>
                  <label className="pm-field-label">Card Number</label>
                  <input
                    id="pm-card-number"
                    className="pm-input"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="pm-field-label">Cardholder Name</label>
                  <input
                    id="pm-card-name"
                    className="pm-input"
                    placeholder="Name on card"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    style={{ fontFamily: "inherit", letterSpacing: "normal" }}
                  />
                </div>
                <div className="pm-card-row">
                  <div>
                    <label className="pm-field-label">Expiry</label>
                    <input
                      className="pm-input"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      maxLength={5}
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label className="pm-field-label">CVV</label>
                    <input
                      className="pm-input"
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      maxLength={4}
                      inputMode="numeric"
                      type="password"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Wallet / Cash instructions */}
          {method === "wallet" && (
            <div style={{ padding: "0.5rem 1.8rem 0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              <p>Your wallet balance will be debited immediately upon confirmation. Make sure you have sufficient funds before proceeding.</p>
            </div>
          )}
          {method === "cash" && (
            <div style={{ padding: "0.5rem 1.8rem 0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              <p>Please bring the exact amount in cash to your session. Your trainer will confirm receipt at the start of the session.</p>
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="pm-error">
              <FontAwesomeIcon icon={faExclamationCircle} />
              {error}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="pm-footer">
          <button className="pm-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            id="pm-pay-btn"
            className="pm-btn-pay"
            onClick={handlePay}
            disabled={paying || (method === "card" && !isCardValid)}
          >
            {paying ? (
              <span className="pm-spinner" />
            ) : (
              <>
                <FontAwesomeIcon icon={faLock} />
                Pay ${(Number(booking.totalPrice) || 0).toFixed(2)}
              </>
            )}
          </button>
        </div>

        {/* Secure badge */}
        <div className="pm-secure">
          <FontAwesomeIcon icon={faShieldHalved} />
          256-bit SSL encrypted · Powered by Stripe
        </div>
      </div>
    </div>
  );
}
