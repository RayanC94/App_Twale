const TRIVIAL_PINS = new Set<string>([
  "000000",
  "111111",
  "222222",
  "333333",
  "444444",
  "555555",
  "666666",
  "777777",
  "888888",
  "999999",
  "123456",
  "654321",
  "012345",
  "543210",
  "121212",
  "212121",
  "456789",
  "098765",
]);

export function isTrivialPin(pin: string): boolean {
  if (!/^\d{6}$/.test(pin)) return true;
  return TRIVIAL_PINS.has(pin);
}

export function isValidPinFormat(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}
