import { Role, User } from '@prisma/client';
import { ApolloError, AuthenticationError } from 'apollo-server-express';

function allowedRoles(roles: Role[], user: User | null): void {
  if (!user) {
    throw new AuthenticationError(
      'You need to be logged in to access this resource'
    );
  } else if (!roles.includes(user.role)) {
    throw new ApolloError("You can't access this resource");
  }
}

export default allowedRoles;
