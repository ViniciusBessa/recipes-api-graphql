import typeDefs from '../schema';
import resolvers from '../resolvers';
import createrServer from '../app';
import { Server } from 'http';
import request from 'supertest';
import { GraphQLRequest } from 'apollo-server-types';

describe('Users Mutations', () => {
  let server: Server;

  beforeAll(async () => {
    server = await createrServer(typeDefs, resolvers);
  });

  afterAll(() => {
    server?.close();
  });

  describe('User is admin', () => {
    let adminToken: string;

    beforeAll(async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: LoginInput!) { loginUser(input: $input) { user { id name email } token } }',
        variables: {
          input: { email: 'syntyche@gmail.com', password: 'sjoann' },
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      adminToken = response.body.data.loginUser.token;
    });

    it('should return all users', async () => {
      const queryData: GraphQLRequest = {
        query: 'query { users { id name email createdAt updatedAt } }',
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.users.length).toBeGreaterThanOrEqual(3);
      expect(response.body.data.users[0].id).toBeTruthy();
      expect(response.body.data.users[0].name).toBeTruthy();
      expect(response.body.data.users[0].email).toBeTruthy();
      expect(response.body.data.users[0].createdAt).toBeTruthy();
      expect(response.body.data.users[0].updatedAt).toBeTruthy();
    });

    it('should return one user', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query($id: Int) { users(id: $id) { id name email createdAt updatedAt } }',
        variables: { id: 2 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.users.length).toEqual(1);
      expect(response.body.data.users[0].id).toEqual(2);
      expect(response.body.data.users[0].name).toEqual('Ulrik Meginrat');
      expect(response.body.data.users[0].email).toEqual('ulrik@gmail.com');
      expect(response.body.data.users[0].createdAt).toBeTruthy();
      expect(response.body.data.users[0].updatedAt).toBeTruthy();
    });

    it("should successfully delete another user's account", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteUserId: Int!) { deleteUser(id: $deleteUserId) { id name email createdAt updatedAt } }',
        variables: {
          deleteUserId: 6,
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: adminToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.deleteUser.id).toEqual(6);
      expect(response.body.data.deleteUser.name).toEqual('Richard Smith');
      expect(response.body.data.deleteUser.email).toEqual('richard@gmail.com');
      expect(response.body.data.deleteUser.createdAt).toBeTruthy();
      expect(response.body.data.deleteUser.updatedAt).toBeTruthy();
    });
  });

  describe('User is logged in', () => {
    let userRosalindaToken: string;
    let userJohnToken: string;

    beforeAll(async () => {
      // Getting Rosalinda's Token
      const queryDataRosalinda: GraphQLRequest = {
        query:
          'mutation($input: LoginInput!) { loginUser(input: $input) { user { id name email } token } }',
        variables: {
          input: { email: 'rosalinda@gmail.com', password: 'rastrid' },
        },
      };
      const responseRosalinda = await request(server)
        .post('/graphql')
        .send(queryDataRosalinda);
      userRosalindaToken = responseRosalinda.body.data.loginUser.token;

      // Getting John's Token
      const queryDataJohn: GraphQLRequest = {
        query:
          'mutation($input: LoginInput!) { loginUser(input: $input) { user { id name email } token } }',
        variables: {
          input: { email: 'john@gmail.com', password: 'jastrid' },
        },
      };
      const responseJohn = await request(server)
        .post('/graphql')
        .send(queryDataJohn);
      userJohnToken = responseJohn.body.data.loginUser.token;
    });

    it('should return all users', async () => {
      const queryData: GraphQLRequest = {
        query: 'query { users { id name email createdAt updatedAt } }',
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userRosalindaToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data!.users.length).toBeGreaterThanOrEqual(3);
      expect(response.body.data!.users[0].id).toBeTruthy();
      expect(response.body.data!.users[0].name).toBeTruthy();
      expect(response.body.data!.users[0].email).toBeTruthy();
      expect(response.body.data!.users[0].createdAt).toBeTruthy();
      expect(response.body.data!.users[0].updatedAt).toBeTruthy();
    });

    it('should return one user', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query($id: Int) { users(id: $id) { id name email createdAt updatedAt } }',
        variables: { id: 2 },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userRosalindaToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data!.users.length).toEqual(1);
      expect(response.body.data!.users[0].id).toEqual(2);
      expect(response.body.data!.users[0].name).toEqual('Ulrik Meginrat');
      expect(response.body.data!.users[0].email).toEqual('ulrik@gmail.com');
      expect(response.body.data!.users[0].createdAt).toBeTruthy();
      expect(response.body.data!.users[0].updatedAt).toBeTruthy();
    });

    it("should successfully update the user's name", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($newName: String!) { updateUserName(newName: $newName) { id name email createdAt updatedAt } }',
        variables: {
          newName: 'Rosalind',
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userRosalindaToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.updateUserName.id).toEqual(4);
      expect(response.body.data.updateUserName.name).toEqual('Rosalind');
      expect(response.body.data.updateUserName.email).toBeTruthy();
      expect(response.body.data.updateUserName.createdAt).toBeTruthy();
      expect(response.body.data.updateUserName.updatedAt).toBeTruthy();
    });

    it("should fail to update the user's name by missing the new name", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($newName: String!) { updateUserName(newName: $newName) { id name email createdAt updatedAt } }',
        variables: {
          newName: '',
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userRosalindaToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it("should successfully update the user's email", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($newEmail: String!) { updateUserEmail(newEmail: $newEmail) { id name email createdAt updatedAt } }',
        variables: {
          newEmail: 'rosalind@gmail.com',
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userRosalindaToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.updateUserEmail.id).toEqual(4);
      expect(response.body.data.updateUserEmail.name).toBeTruthy();
      expect(response.body.data.updateUserEmail.email).toEqual(
        'rosalind@gmail.com'
      );
      expect(response.body.data.updateUserEmail.createdAt).toBeTruthy();
      expect(response.body.data.updateUserEmail.updatedAt).toBeTruthy();
    });

    it("should fail to update the user's email by missing the new email", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($newEmail: String!) { updateUserEmail(newEmail: $newEmail) { id name email createdAt updatedAt } }',
        variables: {
          newEmail: '',
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userRosalindaToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it("should fail to update the user's email by providing an invalid email", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($newEmail: String!) { updateUserEmail(newEmail: $newEmail) { id name email createdAt updatedAt } }',
        variables: {
          newEmail: 'invalidemail',
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userRosalindaToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it("should successfully update the user's password", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($password: String!, $newPassword: String!) { updateUserPassword(password: $password, newPassword: $newPassword) { id name email createdAt updatedAt } }',
        variables: {
          password: 'rastrid',
          newPassword: 'astrid',
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userRosalindaToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.updateUserPassword.id).toEqual(4);
      expect(response.body.data.updateUserPassword.name).toBeTruthy();
      expect(response.body.data.updateUserPassword.email).toBeTruthy();
      expect(response.body.data.updateUserPassword.createdAt).toBeTruthy();
      expect(response.body.data.updateUserPassword.updatedAt).toBeTruthy();
    });

    it("should fail to update the user's password by missing the current password", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($password: String!, $newPassword: String!) { updateUserPassword(password: $password, newPassword: $newPassword) { id name email createdAt updatedAt } }',
        variables: {
          password: '',
          newPassword: 'astrid',
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userRosalindaToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it("should fail to update the user's password by missing the new password", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($password: String!, $newPassword: String!) { updateUserPassword(password: $password, newPassword: $newPassword) { id name email createdAt updatedAt } }',
        variables: {
          password: 'rastrid',
          newPassword: '',
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userRosalindaToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it("should fail to update the user's password by providing the wrong current password", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($password: String!, $newPassword: String!) { updateUserPassword(password: $password, newPassword: $newPassword) { id name email createdAt updatedAt } }',
        variables: {
          password: 'currentPassword',
          newPassword: 'rastrid',
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userRosalindaToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it("should successfully delete the user's account", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteUserId: Int!) { deleteUser(id: $deleteUserId) { id name email createdAt updatedAt } }',
        variables: {
          deleteUserId: 5,
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userJohnToken });
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.deleteUser.id).toEqual(5);
      expect(response.body.data.deleteUser.name).toEqual('John Astrid');
      expect(response.body.data.deleteUser.email).toEqual('john@gmail.com');
      expect(response.body.data.deleteUser.createdAt).toBeTruthy();
      expect(response.body.data.deleteUser.updatedAt).toBeTruthy();
    });

    it("should fail delete another user's account", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteUserId: Int!) { deleteUser(id: $deleteUserId) { id name email createdAt updatedAt } }',
        variables: {
          deleteUserId: 2,
        },
      };
      const response = await request(server)
        .post('/graphql')
        .send(queryData)
        .set({ Authorization: userRosalindaToken });
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });
  });

  describe('User is not logged in', () => {
    it('should return all users', async () => {
      const queryData: GraphQLRequest = {
        query: 'query { users { id name email createdAt updatedAt } }',
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data!.users.length).toBeGreaterThanOrEqual(3);
      expect(response.body.data!.users[0].id).toBeTruthy();
      expect(response.body.data!.users[0].name).toBeTruthy();
      expect(response.body.data!.users[0].email).toBeTruthy();
      expect(response.body.data!.users[0].createdAt).toBeTruthy();
      expect(response.body.data!.users[0].updatedAt).toBeTruthy();
    });

    it('should return one user', async () => {
      const queryData: GraphQLRequest = {
        query:
          'query($id: Int) { users(id: $id) { id name email createdAt updatedAt } }',
        variables: { id: 2 },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data!.users.length).toEqual(1);
      expect(response.body.data!.users[0].id).toEqual(2);
      expect(response.body.data!.users[0].name).toEqual('Ulrik Meginrat');
      expect(response.body.data!.users[0].email).toEqual('ulrik@gmail.com');
      expect(response.body.data!.users[0].createdAt).toBeTruthy();
      expect(response.body.data!.users[0].updatedAt).toBeTruthy();
    });

    it('should successfully create a new user', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: NewUserInput!) { createUser(input: $input) { user { id name email createdAt updatedAt } token } }',
        variables: {
          input: {
            name: 'NewUser',
            email: 'new.user@gmail.com',
            password: 'newuser',
          },
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data!.createUser.user).toBeTruthy();
      expect(response.body.data!.createUser.user.id).toEqual(7);
      expect(response.body.data!.createUser.user.name).toEqual('NewUser');
      expect(response.body.data!.createUser.user.email).toEqual(
        'new.user@gmail.com'
      );
      expect(response.body.data!.createUser.user.createdAt).toBeTruthy();
      expect(response.body.data!.createUser.user.updatedAt).toBeTruthy();
      expect(response.body.data!.createUser.token).toBeTruthy();
    });

    it('should fail to create a new user by missing the name', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: NewUserInput!) { createUser(input: $input) { user { id name email createdAt updatedAt } token } }',
        variables: {
          input: {
            email: 'newuser@gmail.com',
            password: 'newuser',
          },
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to create a new user by missing the email', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: NewUserInput!) { createUser(input: $input) { user { id name email createdAt updatedAt } token } }',
        variables: {
          input: {
            name: 'NewUser',
            password: 'newuser',
          },
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to create a new user by missing the password', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: NewUserInput!) { createUser(input: $input) { user { id name email createdAt updatedAt } token } }',
        variables: {
          input: {
            name: 'NewUser',
            email: 'newuser@gmail.com',
            password: '',
          },
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to create a new user by providing an invalid email', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: NewUserInput!) { createUser(input: $input) { user { id name email createdAt updatedAt } token } }',
        variables: {
          input: {
            name: 'NewUser',
            email: 'invalidemail',
            password: 'password',
          },
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it("should fail to update the user's name", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($newName: String!) { updateUserName(newName: $newName) { id name email createdAt updatedAt } }',
        variables: {
          newName: 'NewName',
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it("should fail to update the user's email", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($newEmail: String!) { updateUserEmail(newEmail: $newEmail) { id name email createdAt updatedAt } }',
        variables: {
          newEmail: 'newemail@gmail.com',
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it("should fail to update the user's password", async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($password: String!, $newPassword: String!) { updateUserPassword(password: $password, newPassword: $newPassword) { id name createdAt updatedAt } }',
        variables: {
          password: 'password',
          newPassword: 'newPassword',
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to delete the account', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($deleteUserId: Int!) { deleteUser(id: $deleteUserId) { id name email createdAt updatedAt } }',
        variables: {
          deleteUserId: 1,
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should successfully login the user', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: LoginInput!) { loginUser(input: $input) { user { id name email createdAt updatedAt } token } }',
        variables: {
          input: {
            email: 'taqqiq@gmail.com',
            password: 'tberlin',
          },
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeTruthy();
      expect(response.body.errors).toBeFalsy();
      expect(response.body.data.loginUser.user.id).toEqual(3);
      expect(response.body.data.loginUser.user.name).toEqual('Taqqiq Berlin');
      expect(response.body.data.loginUser.user.email).toEqual(
        'taqqiq@gmail.com'
      );
      expect(response.body.data.loginUser.user.createdAt).toBeTruthy();
      expect(response.body.data.loginUser.user.updatedAt).toBeTruthy();
      expect(response.body.data.loginUser.token).toBeTruthy();
    });

    it('should fail to login the user by not providing a name or email', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: LoginInput!) { loginUser(input: $input) { user { id name email createdAt updatedAt } token } }',
        variables: {
          input: {
            name: '',
            email: '',
            password: 'password',
          },
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to login the user by providing a name not registered', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: LoginInput!) { loginUser(input: $input) { user { id name email createdAt updatedAt } token } }',
        variables: {
          input: {
            name: 'UserName',
            password: 'password',
          },
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to login the user by providing an email not registered', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: LoginInput!) { loginUser(input: $input) { user { id name email createdAt updatedAt } token } }',
        variables: {
          input: {
            email: 'email@gmail.com',
            password: 'password',
          },
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to login the user by not providing a password', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: LoginInput!) { loginUser(input: $input) { user { id name email createdAt updatedAt } token } }',
        variables: {
          input: {
            email: 'rosalinda@gmail.com',
            password: '',
          },
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });

    it('should fail to login the user by providing the wrong password', async () => {
      const queryData: GraphQLRequest = {
        query:
          'mutation($input: LoginInput!) { loginUser(input: $input) { user { id name email createdAt updatedAt } token } }',
        variables: {
          input: {
            email: 'taqqiq@gmail.com',
            password: 'password',
          },
        },
      };
      const response = await request(server).post('/graphql').send(queryData);
      expect(response.body.data).toBeFalsy();
      expect(response.body.errors).toBeTruthy();
    });
  });
});
