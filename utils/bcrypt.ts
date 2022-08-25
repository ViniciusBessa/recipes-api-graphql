import bcrypt from 'bcrypt';

async function generatePassword(password: string): Promise<string> {
  const salt: string = await bcrypt.genSalt();
  const hashedPassword: string = await bcrypt.hash(password, salt);
  return hashedPassword;
}

async function comparePassword(
  comparedValue: string,
  password: string
): Promise<boolean> {
  const result = await bcrypt.compare(comparedValue, password);
  return result;
}

export { generatePassword, comparePassword };
