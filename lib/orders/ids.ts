import { randomBytes } from "crypto";

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function crockford(length: number) {
  const bytes = randomBytes(length);
  let body = "";
  for (let i = 0; i < length; i += 1) {
    body += CROCKFORD[bytes[i] % CROCKFORD.length];
  }
  return body;
}

export function newCustomerPublicId() {
  return `cus_${crockford(12)}`;
}

export function newOrderPublicId() {
  return `ord_${crockford(12)}`;
}

export function newPublicToken() {
  return randomBytes(24).toString("base64url");
}

export function newIdempotencyKey() {
  return randomBytes(16).toString("base64url");
}
