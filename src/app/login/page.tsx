// Add this state near your other useState declarations:
const [phoneError, setPhoneError] = useState('')

// Replace your existing handleSendOTP (or submit) function with this:
const handleSendOTP = () => {
  // Change 8: Validation
  if (!phone || phone.trim() === '') {
    setPhoneError('Please enter your mobile number')
    return
  }
  if (phone.replace(/\D/g, '').length < 10) {
    setPhoneError('Please enter a valid 10-digit mobile number')
    return
  }
  if (phone.replace(/\D/g, '').length > 10) {
    setPhoneError('Mobile number cannot be more than 10 digits')
    return
  }
  setPhoneError('') // clear error if valid
  // ... rest of your existing OTP logic
}

// In your phone input JSX, add onChange to clear error and show error message below:
// 1. In your <input> tag, add:
//    onChange={(e) => { setPhone(e.target.value); if (phoneError) setPhoneError('') }}
//
// 2. Right below the input, add this error message block:
{phoneError && (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '6px',
    marginTop: '6px', padding: '8px 12px',
    background: '#FEE2E2', borderRadius: '10px',
  }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    <span style={{ fontSize: '12px', fontWeight: 600, color: '#DC2626' }}>{phoneError}</span>
  </div>
)}