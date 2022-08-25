import { PrismaClient, User } from '@prisma/client';
import { Context } from 'apollo-server-core';
import { ApolloError } from 'apollo-server-express';
import { AuthInfo } from '../models/auth-info.model';
import { LoginInput } from '../models/login-input.model';
import { NewUserInput } from '../models/new-user-input.model';
import { UserPayload } from '../models/user-payload.model';
import { comparePassword, generatePassword } from '../utils/bcrypt';
import { generateJWToken, getUserPayload } from '../utils/jwt';

const prisma = new PrismaClient();

async function getUsers(id?: number): Promise<User[]> {
  const users = await prisma.user.findMany({ where: { id } });
  return users;
}

async function createUser(input: NewUserInput): Promise<AuthInfo> {
  let { name, email, password } = input;
  name = name ? name.trim() : name;
  email = email ? email.trim() : email;
  password = password ? password.trim() : password;

  if (!name || !email || !password) {
    throw new ApolloError('Please provide a name, email and password');
  }
  // Hashing the password with bcrypt
  const hashedPassword: string = await generatePassword(password);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  // Getting the user's jwt payload
  const userPayload: UserPayload = getUserPayload(user);

  // Creating the user's token
  const token: string = generateJWToken(userPayload);

  // Sending the response
  const response: AuthInfo = { user, token };
  return response;
}

async function updateUser(
  id: number,
  newData: NewUserInput,
  context: Context
): Promise<User> {
  const user = await prisma.user.update({ where: { id }, data: newData });
  return user;
}

async function deleteUser(id: number, context: Context): Promise<User> {
  const user = await prisma.user.delete({ where: { id } });
  return user;
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

export { getUsers, createUser, updateUser, deleteUser, loginUser };
