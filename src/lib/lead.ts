const LEAD_ENDPOINT = "/api/contacto.php";

export const HONEYPOT_FIELD = "website";

export type LeadFields = {
  name: string;
  contact?: string;
  business?: string;
  service?: string;
  plan?: string;
  timing?: string;
  message?: string;
};

export function sendLead(fields: LeadFields, startedAt: number, honeypot = "") {
  const body = new FormData();
  Object.entries(fields).forEach(([key, value]) => { if (value) body.append(key, value); });
  body.append(HONEYPOT_FIELD, honeypot);
  body.append("elapsed", String(Math.round(performance.now() - startedAt)));
  body.append("page", window.location.pathname);
  return fetch(LEAD_ENDPOINT, { method: "POST", body, keepalive: true, credentials: "omit" })
    .then((response) => response.ok)
    .catch(() => false);
}
