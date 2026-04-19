/* =============================================
   AURELIAN — Login Page Script
   ============================================= */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    initLoginForm();
    initPasswordToggle();
    initSocialButtons();
    initFieldValidation();
});

/* ============================================================
   PASSWORD VISIBILITY TOGGLE
   ============================================================ */
function initPasswordToggle() {
    const btn   = document.getElementById('togglePassword');
    const input = document.getElementById('password');
    if (!btn || !input) return;

    btn.addEventListener('click', () => {
        const isText = input.type === 'text';
        input.type = isText ? 'password' : 'text';
        btn.setAttribute('aria-label', isText ? 'Show password' : 'Hide password');

        // Swap icon
        btn.innerHTML = isText
            ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
            : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
    });
}

/* ============================================================
   INLINE VALIDATION (on blur)
   ============================================================ */
function initFieldValidation() {
    const emailInput = document.getElementById('email');
    const pwInput    = document.getElementById('password');

    emailInput?.addEventListener('blur', () => validateEmail(emailInput));
    pwInput?.addEventListener('blur',    () => validatePassword(pwInput));

    // Clear error on re-type
    emailInput?.addEventListener('input', () => clearError('emailGroup'));
    pwInput?.addEventListener('input',    () => clearError('passwordGroup'));
}

function validateEmail(input) {
    const val = input.value.trim();
    if (!val) return setError('emailGroup', 'emailError', 'Email is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
        return setError('emailGroup', 'emailError', 'Please enter a valid email address.');
    setValid('emailGroup');
    return true;
}

function validatePassword(input) {
    const val = input.value;
    if (!val) return setError('passwordGroup', 'passwordError', 'Password is required.');
    if (val.length < 8)
        return setError('passwordGroup', 'passwordError', 'Password must be at least 8 characters.');
    setValid('passwordGroup');
    return true;
}

function setError(groupId, errorId, message) {
    document.getElementById(groupId)?.classList.add('has-error');
    document.getElementById(groupId)?.classList.remove('is-valid');
    const el = document.getElementById(errorId);
    if (el) el.textContent = message;
    return false;
}

function setValid(groupId) {
    document.getElementById(groupId)?.classList.remove('has-error');
    document.getElementById(groupId)?.classList.add('is-valid');
}

function clearError(groupId) {
    document.getElementById(groupId)?.classList.remove('has-error');
    const errEl = document.getElementById(groupId)?.querySelector('.field-error');
    if (errEl) errEl.textContent = '';
}

/* ============================================================
   LOGIN FORM SUBMISSION
   ============================================================ */
function initLoginForm() {
    const form    = document.getElementById('loginForm');
    const btn     = document.getElementById('loginBtn');
    const formErr = document.getElementById('formError');
    if (!form || !btn) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate all fields
        const emailInput = document.getElementById('email');
        const pwInput    = document.getElementById('password');

        const emailOk = validateEmail(emailInput);
        const pwOk    = validatePassword(pwInput);
        if (!emailOk || !pwOk) return;

        const email    = emailInput.value.trim();
        const remember = document.getElementById('remember')?.checked;

        // UI: loading state
        setLoading(btn, true);
        if (formErr) formErr.hidden = true;

        try {
            // --- Replace this block with your real auth API call ---
            await simulateAuth(email);
            // -------------------------------------------------------

            // Store session
            if (remember) {
                localStorage.setItem('aurelian_email', email);
                localStorage.setItem('aurelian_remember', 'true');
            }

            // Success state
            setSuccess(btn);

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);

        } catch (err) {
            setLoading(btn, false);
            if (formErr) {
                formErr.textContent = err.message || 'Sign in failed. Please try again.';
                formErr.hidden = false;
            }
        }
    });
}

/* Simulated auth — replace with Firebase/real API */
function simulateAuth(email) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate failure for demo:
            // reject(new Error('Incorrect email or password.'));
            resolve({ email });
        }, 1500);
    });
}

function setLoading(btn, loading) {
    const text   = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.btn-loader');
    btn.disabled = loading;
    btn.classList.toggle('loading', loading);
    if (text)   text.textContent = loading ? 'Signing in…' : 'Sign In';
    if (loader) loader.hidden = !loading;
}

function setSuccess(btn) {
    const text   = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.btn-loader');
    btn.style.background = '#27ae60';
    if (text)   text.textContent = 'Success!';
    if (loader) loader.hidden = true;
}

/* ============================================================
   SOCIAL LOGIN BUTTONS
   ============================================================ */
function initSocialButtons() {
    document.getElementById('googleBtn')?.addEventListener('click', () => {
        handleSocialLogin('Google');
    });
    document.getElementById('appleBtn')?.addEventListener('click', () => {
        handleSocialLogin('Apple');
    });
}

function handleSocialLogin(provider) {
    // In a real app: trigger OAuth flow (Firebase, Auth0, etc.)
    console.log(`${provider} OAuth flow triggered`);

    const btn = document.getElementById(provider.toLowerCase() + 'Btn');
    if (btn) {
        btn.style.opacity = '0.6';
        btn.disabled = true;
        setTimeout(() => {
            btn.style.opacity = '';
            btn.disabled = false;
        }, 1500);
    }

    // Placeholder alert — remove and replace with real OAuth
    alert(`${provider} sign-in coming soon. Integrate your OAuth provider here.`);
}