import { PrismaClient, User } from '@prisma/client';
import { ApolloError } from 'apollo-server-express';
import { AuthInfo } from '../models/auth-info.model';
import { LoginInput } from '../models/login-input.model';
import { NewUserInput } from '../models/new-user-input.model';
import { UserPayload } from '../models/user-payload.model';
import { comparePassword, generatePassword } from '../utils/bcrypt';
import { generateJWToken, getUserPayload } from '../utils/jwt';

const prisma = new PrismaClient();
const EMAIL_REGEX = /[A-Za-z0-9.]{1,}@[a-z0-9]{1,}\.com(\.[a-z]{1,})?/;

async function getUsers(id?: number): Promise<User[]> {
  const users = await prisma.user.findMany({
    where: { id },
    include: { recipes: true },
  });
  return users;
}

async function createUser(input: NewUserInput): Promise<AuthInfo> {
  let { name, email, password } = input;
  name = name ? name.trim() : name;
  email = email ? email.trim() : email;
  password = password ? password.trim() : password;

  if (!name || !email || !password) {
    throw new ApolloError('Please provide a name, email and password');
  } else if (!EMAIL_REGEX.test(email)) {
    throw new ApolloError('Provided email is not valid');
  }
  // Hashing the password with bcrypt
  const hashedPassword: string = await generatePassword(password);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    include: { recipes: true },
  });

  // Getting the user's jwt payload
  const userPayload: UserPayload = getUserPayload(user);

  // Creating the user's token
  const token: string = generateJWToken(userPayload);

  // Sending the response
  const response: AuthInfo = { user, token };
  return response;
}

async function updateUserName(newName: string, user: User) {
  newName = newName.trim();
  const updatedUser = await prisma.user.update({
    data: { name: newName },
    where: { id: user.id },
    include: { recipes: true },
  });
  return updatedUser;
}

async function updateUserEmail(newEmail: string, user: User) {
  newEmail = newEmail.trim();

  if (!newEmail) {
    throw new ApolloError('Please provide the new email');
  } else if (!EMAIL_REGEX.test(newEmail)) {
    throw new ApolloError('Provided email is not valid');
  }
  const updatedUser = await prisma.user.update({
    data: { email: newEmail },
    where: { id: user.id },
    include: { recipes: true },
  });
  return updatedUser;
}

async function updateUserPassword(
  password: string,
  newPassword: string,
  user: User
) {
  password = password.trim();
  newPassword = newPassword.trim();

  if (!password || !newPassword) {
    throw new ApolloError('Please provide the current and new passwords');
  }
  const passwordMatch = await comparePassword(password, user.password);

  if (!passwordMatch) {
    throw new ApolloError('The provided current password is incorrect');
  }
  const hashedPassword = await generatePassword(newPassword);
  const updatedUser = await prisma.user.update({
    data: { password: hashedPassword },
    where: { id: user.id },
    include: { recipes: true },
  });
  return updatedUser;
}

async function deleteUser(id: number, user: User): Promise<User> {
  if (id !== user?.id && user.role !== 'ADMIN') {
    throw new ApolloError(
      "You don't have the permission to delete this account"
    );
  }
  const deletedUser = await prisma.user.delete({
    where: { id },
    include: { recipes: true },
  });
  return deletedUser;
}

async function loginUser(input: LoginInput): Promise<AuthInfo> {
  const { name, email, password } = input;

  if (!name && !email) {
    throw new ApolloError(`Please provide a name or email`);
  }
  // Getting the user from the database
  const user = await prisma.user.findFirst({ where: { name, email } });

  if (!user && name) {
    throw new ApolloError(`No user with the name ${name} was found`);
  } else if (!user && email) {
    throw new ApolloError(`No user with the email ${email} was found`);
  }
  // Comparing the passwords
  const passwordsMatch = await comparePassword(password, user!.password);

  if (!passwordsMatch) {
    throw new ApolloError(`Provided password is incorrect`);
  }
  // Getting the user's jwt payload
  const userPayload: UserPayload = getUserPayload(user!);

  // Creating the user's token
  const token: string = generateJWToken(userPayload);

  // Sending the response
  const response: AuthInfo = { user: user!, token };
  return response;
}

export {
  getUsers,
  createUser,
  updateUserName,
  updateUserEmail,
  updateUserPassword,
  deleteUser,
  loginUser,
};
