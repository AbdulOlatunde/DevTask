import axios from 'axios';

const TELEX_WEBHOOK_URL = process.env.TELEX_WEBHOOK_URL || '';

/**
 * sendToTelex(user, text)
 * Sends a message back to Telex using the configured webhook.
 * If TELEX_WEBHOOK_URL is missing, it logs the message for local testing.
 */
export const sendToTelex = async (user, text) => {
  try {
    if (!TELEX_WEBHOOK_URL) {
      console.log('[telex.service] TELEX_WEBHOOK_URL not set — would send:', { user, text });
      return;
    }

    const payload = { user, message: text };

    await axios.post(TELEX_WEBHOOK_URL, payload, { timeout: 5000 });
    console.log(`[telex.service] Sent message to ${user}`);
  } catch (err) {
    console.error('[telex.service] Failed to send message to Telex:', err?.response?.data || err?.message || err);
  }
};
