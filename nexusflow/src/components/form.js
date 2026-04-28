/* NexusFlow — Contact Form Handler
   Uses Formspree (free tier) for email delivery.
   Sign up at https://formspree.io and replace YOUR_FORM_ID below.
*/

(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoading = submitBtn.querySelector('.btn-loading');
  const successEl = document.getElementById('formSuccess');
  const errorEl = document.getElementById('formErrorMsg');

  // ── Validation ──
  function validate() {
    let valid = true;

    const fields = [
      { id: 'fname', errId: 'fnameErr', msg: 'First name is required.' },
      { id: 'lname', errId: 'lnameErr', msg: 'Last name is required.' },
      { id: 'email', errId: 'emailErr', msg: 'A valid work email is required.', type: 'email' },
      { id: 'company', errId: 'companyErr', msg: 'Company name is required.' },
      { id: 'team', errId: 'teamErr', msg: 'Please select your team size.' },
      { id: 'dept', errId: 'deptErr', msg: 'Please select a department.' },
    ];

    fields.forEach(f => {
      const el = document.getElementById(f.id);
      const err = document.getElementById(f.errId);
      let fieldValid = true;

      if (!el.value.trim()) {
        fieldValid = false;
      } else if (f.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(el.value.trim())) fieldValid = false;
      }

      if (!fieldValid) {
        el.classList.add('error');
        err.textContent = f.msg;
        valid = false;
      } else {
        el.classList.remove('error');
        err.textContent = '';
      }
    });

    return valid;
  }

  // Clear errors on input
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.classList.remove('error');
      const errEl = document.getElementById(el.id + 'Err');
      if (errEl) errEl.textContent = '';
    });
  });

  // ── Submit ──
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    successEl.style.display = 'none';
    errorEl.style.display = 'none';

    if (!validate()) return;

    // Set loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';

    const data = {
      firstName: document.getElementById('fname').value.trim(),
      lastName: document.getElementById('lname').value.trim(),
      email: document.getElementById('email').value.trim(),
      company: document.getElementById('company').value.trim(),
      teamSize: document.getElementById('team').value,
      department: document.getElementById('dept').value,
      message: document.getElementById('message').value.trim(),
      _subject: `New Audit Request from ${document.getElementById('fname').value.trim()} @ ${document.getElementById('company').value.trim()}`,
    };

    try {
      // ============================================================
      // FORMSPREE INTEGRATION
      // Replace YOUR_FORM_ID with your actual Formspree form ID.
      // Get one free at https://formspree.io/register
      // Your form endpoint will look like: https://formspree.io/f/xabc1234
      // ============================================================
      const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mdayryyy';

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Success
        form.reset();
        successEl.style.display = 'flex';
        successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        throw new Error('Server error: ' + response.status);
      }
    } catch (err) {
      console.error('Form error:', err);
      errorEl.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
    }
  });
})();
