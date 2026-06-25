# Enquiry API Integration Guide

**Endpoint:** `POST /api/v1/enquiry`  
**Auth:** ❌ Not required — anyone can submit  
**Base URL:** `https://your-domain.com` (replace with your server)

---

## Fields Reference

| Field | Type | Required | Max | Description |
|-------|------|----------|-----|-------------|
| `name` | string | ✅ | 100 | Full name of enquirer |
| `email` | string (email) | ✅ | — | Contact email |
| `phone` | string | ❌ | — | Phone number |
| `subject` | string | ✅ | 200 | Enquiry subject |
| `message` | string | ✅ | 2000 | Detailed message |
| `type` | enum | ❌ | — | `general` \| `admission` \| `course` \| `support` \| `feedback` |

---

## 1. cURL (Test it right now)

```bash
curl -X POST https://your-domain.com/api/v1/enquiry \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "subject": "Admission enquiry",
    "message": "I would like to know about the admission process.",
    "type": "admission"
  }'
```

---

## 2. HTML Form + Vanilla JavaScript

Drop this anywhere on your website:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Contact Us</title>
  <style>
    form { max-width: 500px; display: flex; flex-direction: column; gap: 12px; }
    input, textarea, select { padding: 10px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; width: 100%; box-sizing: border-box; }
    button { padding: 12px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 15px; }
    button:disabled { background: #93c5fd; cursor: not-allowed; }
    .success { color: green; font-weight: bold; }
    .error   { color: red; }
  </style>
</head>
<body>

<form id="enquiryForm">
  <h2>Send an Enquiry</h2>

  <input  type="text"  name="name"    placeholder="Full Name *"   required />
  <input  type="email" name="email"   placeholder="Email *"        required />
  <input  type="tel"   name="phone"   placeholder="Phone (optional)" />
  <input  type="text"  name="subject" placeholder="Subject *"      required />

  <select name="type">
    <option value="general">General</option>
    <option value="admission">Admission</option>
    <option value="course">Course</option>
    <option value="support">Support</option>
    <option value="feedback">Feedback</option>
  </select>

  <textarea name="message" rows="5" placeholder="Your message *" required></textarea>

  <button type="submit" id="submitBtn">Send Enquiry</button>
  <p id="statusMsg"></p>
</form>

<script>
  const API_BASE = 'https://your-domain.com/api/v1'; // ← change this

  document.getElementById('enquiryForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn = document.getElementById('submitBtn');
    const msg = document.getElementById('statusMsg');
    const form = e.target;

    btn.disabled = true;
    btn.textContent = 'Sending...';
    msg.textContent = '';
    msg.className = '';

    const payload = {
      name:    form.name.value.trim(),
      email:   form.email.value.trim(),
      phone:   form.phone.value.trim() || undefined,
      subject: form.subject.value.trim(),
      message: form.message.value.trim(),
      type:    form.type.value,
    };

    try {
      const res = await fetch(`${API_BASE}/enquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        msg.className = 'success';
        msg.textContent = '✅ ' + data.message;
        form.reset();
      } else {
        const errors = data.errors ? data.errors.join(', ') : data.message;
        msg.className = 'error';
        msg.textContent = '❌ ' + errors;
      }
    } catch (err) {
      msg.className = 'error';
      msg.textContent = '❌ Network error. Please try again.';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send Enquiry';
    }
  });
</script>

</body>
</html>
```

---

## 3. React Component

```jsx
// EnquiryForm.jsx
import { useState } from 'react';

const API_BASE = 'https://your-domain.com/api/v1'; // ← change this

const ENQUIRY_TYPES = [
  { value: 'general',   label: 'General' },
  { value: 'admission', label: 'Admission' },
  { value: 'course',    label: 'Course' },
  { value: 'support',   label: 'Support' },
  { value: 'feedback',  label: 'Feedback' },
];

const initialState = {
  name: '', email: '', phone: '', subject: '', message: '', type: 'general',
};

export default function EnquiryForm() {
  const [form, setForm]       = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [status, setStatus]   = useState(null); // { ok: bool, text: string }

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const payload = { ...form };
    if (!payload.phone) delete payload.phone;

    try {
      const res  = await fetch(`${API_BASE}/enquiry`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({ ok: true, text: data.message });
        setForm(initialState);
      } else {
        const errors = data.errors ? data.errors.join(', ') : data.message;
        setStatus({ ok: false, text: errors });
      }
    } catch {
      setStatus({ ok: false, text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 500 }}>
      <h2>Send an Enquiry</h2>

      <input name="name"    value={form.name}    onChange={handleChange} placeholder="Full Name *"    required />
      <input name="email"   value={form.email}   onChange={handleChange} placeholder="Email *"         required type="email" />
      <input name="phone"   value={form.phone}   onChange={handleChange} placeholder="Phone (optional)" />
      <input name="subject" value={form.subject} onChange={handleChange} placeholder="Subject *"       required />

      <select name="type" value={form.type} onChange={handleChange}>
        {ENQUIRY_TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      <textarea
        name="message"
        value={form.message}
        onChange={handleChange}
        rows={5}
        placeholder="Your message *"
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Enquiry'}
      </button>

      {status && (
        <p style={{ color: status.ok ? 'green' : 'red', fontWeight: 'bold' }}>
          {status.ok ? '✅ ' : '❌ '}{status.text}
        </p>
      )}
    </form>
  );
}
```

---

## 4. Axios (React / Vue / Node)

```js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-domain.com/api/v1', // ← change this
  headers: { 'Content-Type': 'application/json' },
});

async function submitEnquiry(data) {
  try {
    const response = await api.post('/enquiry', {
      name:    data.name,
      email:   data.email,
      phone:   data.phone,     // optional
      subject: data.subject,
      message: data.message,
      type:    data.type,      // optional — default: 'general'
    });

    console.log('Success:', response.data.message);
    // response.data.data.id  → the enquiry ID
    return response.data;

  } catch (error) {
    if (error.response) {
      // API returned an error (4xx / 5xx)
      const { message, errors } = error.response.data;
      console.error('API Error:', errors || message);
    } else {
      // Network error
      console.error('Network Error:', error.message);
    }
    throw error;
  }
}

// Usage
submitEnquiry({
  name:    'Jane Smith',
  email:   'jane@example.com',
  phone:   '+1234567890',
  subject: 'Admission enquiry',
  message: 'I would like to know about the admission process.',
  type:    'admission',
});
```

---

## 5. Vue 3 Component

```vue
<!-- EnquiryForm.vue -->
<template>
  <form @submit.prevent="submit">
    <h2>Send an Enquiry</h2>

    <input v-model="form.name"    placeholder="Full Name *"    required />
    <input v-model="form.email"   placeholder="Email *"         required type="email" />
    <input v-model="form.phone"   placeholder="Phone (optional)" />
    <input v-model="form.subject" placeholder="Subject *"       required />

    <select v-model="form.type">
      <option v-for="t in types" :key="t.value" :value="t.value">{{ t.label }}</option>
    </select>

    <textarea v-model="form.message" rows="5" placeholder="Your message *" required />

    <button type="submit" :disabled="loading">
      {{ loading ? 'Sending...' : 'Send Enquiry' }}
    </button>

    <p v-if="status" :class="status.ok ? 'success' : 'error'">
      {{ status.text }}
    </p>
  </form>
</template>

<script setup>
import { ref, reactive } from 'vue';

const API_BASE = 'https://your-domain.com/api/v1'; // ← change this

const types = [
  { value: 'general',   label: 'General'   },
  { value: 'admission', label: 'Admission' },
  { value: 'course',    label: 'Course'    },
  { value: 'support',   label: 'Support'   },
  { value: 'feedback',  label: 'Feedback'  },
];

const form    = reactive({ name: '', email: '', phone: '', subject: '', message: '', type: 'general' });
const loading = ref(false);
const status  = ref(null);

async function submit() {
  loading.value = true;
  status.value  = null;

  const payload = { ...form };
  if (!payload.phone) delete payload.phone;

  try {
    const res  = await fetch(`${API_BASE}/enquiry`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const data = await res.json();

    if (res.ok) {
      status.value = { ok: true, text: '✅ ' + data.message };
      Object.assign(form, { name: '', email: '', phone: '', subject: '', message: '', type: 'general' });
    } else {
      status.value = { ok: false, text: '❌ ' + (data.errors?.join(', ') || data.message) };
    }
  } catch {
    status.value = { ok: false, text: '❌ Network error. Please try again.' };
  } finally {
    loading.value = false;
  }
}
</script>
```

---

## 6. Next.js (App Router — Server Action)

```ts
// app/actions/enquiry.ts
'use server';

export async function submitEnquiry(formData: FormData) {
  const payload = {
    name:    formData.get('name'),
    email:   formData.get('email'),
    phone:   formData.get('phone') || undefined,
    subject: formData.get('subject'),
    message: formData.get('message'),
    type:    formData.get('type') || 'general',
  };

  const res = await fetch(`${process.env.API_BASE_URL}/api/v1/enquiry`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.errors?.join(', ') || data.message);
  }

  return res.json();
}
```

```tsx
// app/contact/page.tsx
'use client';
import { useFormStatus } from 'react-dom';
import { submitEnquiry } from '../actions/enquiry';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending}>{pending ? 'Sending...' : 'Send Enquiry'}</button>;
}

export default function ContactPage() {
  return (
    <form action={async (formData) => {
      try {
        await submitEnquiry(formData);
        alert('Enquiry submitted successfully!');
      } catch (err: any) {
        alert('Error: ' + err.message);
      }
    }}>
      <input name="name"    placeholder="Full Name *"    required />
      <input name="email"   placeholder="Email *"         required type="email" />
      <input name="phone"   placeholder="Phone (optional)" />
      <input name="subject" placeholder="Subject *"       required />
      <select name="type">
        <option value="general">General</option>
        <option value="admission">Admission</option>
        <option value="course">Course</option>
        <option value="support">Support</option>
        <option value="feedback">Feedback</option>
      </select>
      <textarea name="message" rows={5} placeholder="Your message *" required />
      <SubmitButton />
    </form>
  );
}
```

---

## Success Response

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Enquiry submitted successfully. We will get back to you shortly.",
  "data": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d2",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "subject": "Admission enquiry",
    "type": "admission",
    "status": "new",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Validation Error Response

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    "email must be an email",
    "message must be shorter than or equal to 2000 characters"
  ]
}
```
